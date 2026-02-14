import { ObjectId } from 'mongodb';
import { Preferance } from '../../../models/prefrence.model.js';
import { Post } from '../../../models/post.model.js';
import { Following} from '../../../models/following.model.js';

export const getUserPreferences = (userId) => {
  return Preferance.find({ user: userId })
    .select('hashtags -_id')
    .sort({ score: 1 })
    .limit(50);
};

export const fetchFeedPostsDB = async ({
  userId,
  hashtags,
  timeAgo,
  skip,
  limit,
  tab,
}) => {
  const filter = [];

  if (tab === 'Communities') {
    filter.push({ $eq: ['$type', 'community'] });
  }

  if (tab === 'Media') {
    filter.push({ $gte: [{ $size: '$media' }, 1] });
  }

  if (tab === 'Following') {
    filter.push({ $in: ['$author', '$userFollowIds'] });
  }

    const getFollowings = await Following.find({ followedBy: userId }).select('followedTo followingCommunity -_id').lean(); 
  
    const followingUserIds = getFollowings.map(f => f.followedTo).filter(Boolean) ;
    const followingCommunityIds = getFollowings.map(f => f.followingCommunity).filter(Boolean) ;
  


  return Post.aggregate([
    {
      $match: {
        $expr: {
          $and: [
            { $eq: ['$isDeleted', false] },
            { $lte: ['$scheduledAt', new Date()] },
            ...filter,
            {
              $or: [
                { $gte: ['$createdAt',timeAgo] },
                { $in: ['$author', followingUserIds] },
                { $in: ['$community', followingCommunityIds] },
                { $in: ['$hashtags', hashtags] },
              ],
            },
          ],
        },
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    
    //author details
    { $lookup : {
      from : 'users' ,
      let : { userId : '$author'} ,
      pipeline : [
        {$match : {
          $expr : {
            $eq : ['$_id' , '$$userId']
          }
        }} ,
        {$project: {
          avatar : 1 ,
          username : 1 ,
          fullname : 1 ,
        }}
      ] ,
      as : 'authorDetails'
    }} ,

    //userLike
    {$lookup : {
      from : 'likes' ,
      let : { postId : '$_id'} ,
      pipeline : [
        {$match : {
          $expr : {
            $and : [
              {$eq : ['$post' , '$$postId']} ,
              {$eq : ['$user' , new ObjectId(`${userId}`)]}
            ]
          }
        }}
      ] ,
      as : 'userLike'
    }} ,

    //totalLike
    {$lookup : {
      from : 'likes' ,
      localField : '_id' ,
      foreignField : 'post' ,
      as : 'totalLike' ,
    }} ,

    //totalComments
    {$lookup : {
      from : 'comments' ,
      localField : '_id' ,
      foreignField : 'post' ,
      as : 'totalComments' ,
    }} ,

    //community name
    {$lookup : {
        from : 'communities' ,
        let : { communityId : '$community'} ,
        pipeline : [
          {$match : {
            $expr : {
              $eq : ['$_id' , '$$communityId']
            }
          }} ,
          {$project: {
            name : 1 ,
          }}
        ] ,
        as : 'communityDetails'
      }
    } ,

    {$addFields : {
      author : '$authorDetails' ,
      likeStatus : { $gt : [{ $size : '$userLike'} , 0 ]}  ,
      likeCount : {$size : '$totalLike'} ,
      commentCount : {$size : '$totalComments'} ,
      community : {$arrayElemAt : ['$communityDetails.name' , 0]} ,
      communityId : {$arrayElemAt : ['$communityDetails._id' , 0]} ,
      totalComments : {$size : '$totalComments'} ,
    }} , 

    {$unwind: {path: '$author',preserveNullAndEmptyArrays: true} } ,
    
    {$project : {
      authorDetails : 0 ,
      totalLike : 0 ,
      userLike : 0 ,
      communityFollowIds : 0 ,
      userFollowIds : 0 ,
      communityDetails : 0 ,
      isDeleted : 0 ,
      UsersFollowing : 0 ,
      isPinned : 0
    }}
  ]);
};
