import { Likes } from '../../../models/likes.model.js';
import { Following } from '../../../models/following.model.js';
import { ObjectId } from 'mongodb';


export const fetchTrendingDB = async ({ tab, skip, userId }) => {
  const cutoff = new Date(Date.now() - 7 * 24 * 3600 * 1000);

  const andConditions = [{ $eq: ['$_id', '$$postId'] }];

  if (tab === 'Communities')
    andConditions.push({ $eq: ['$type', 'community'] });

  if (tab === 'Media')
    andConditions.push({
      $gte: [{ $size: { $ifNull: ['$media', []] } }, 1],
    });

  return Likes.aggregate([
    { $match: { createdAt: { $gte: cutoff } } },
    { $group: { _id: '$post', likeCount: { $sum: 1 } } },
    {
      $lookup: {
        from: 'posts',
        let: { postId: '$_id' },
        pipeline: [{ $match: { $expr: { $and: andConditions } } }],
        as: 'filteredPost',
      },
    },
    { $unwind: '$filteredPost' },
    { $sort: { likeCount: -1 } },
    { $skip: skip },
    { $limit: 10 },

    { $lookup : {
        from : 'posts' ,
        let : { postId : '$_id'} ,
        pipeline : [
          { $match : {
            $expr : {
              $eq : ['$_id' , '$$postId']
            }
          }} ,
          //author
          {$lookup : {
            from : 'users' , 
            let : {userId : '$author'} ,
            pipeline : [
              {$match : {
                $expr : {
                  $eq : ['$_id' , '$$userId']
                }
              }} , 
              {$project : {
                avatar : 1 ,
                username : 1 ,
                fullname : 1
              }}
            ] , 
            as : 'authorDetails'
          }} ,
          //likeStatus 
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
            as : 'likesArray' ,
          }} ,
          //totalComments
          {$lookup : {
            from : 'comments' ,
            localField : '_id' ,
            foreignField : 'post' ,
            as : 'totalComments' ,
          }} ,
          //bookmark status
          {$lookup : {
            from : 'bookmarks' ,
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
            as : 'userBookmark'
          }} ,
          {$addFields : {
            author : { $arrayElemAt: ['$authorDetails' , 0]} ,
            likeCount : {$size : '$likesArray'} ,
            commentCount : {$size : '$totalComments'} ,
            likeStatus : { $gt : [{ $size : '$userLike'} , 0 ]} ,
            bookmarkStatus : { $gt : [{ $size : '$userBookmark'} , 0 ]} ,
          }} ,
          {$project : {
            totalComments : 0 ,
            userLike : 0 ,
            likesArray : 0 ,
            authorDetails : 0 ,
            isDeleted : 0 ,
            userBookmark : 0 ,
          }}
        ] ,
        as : 'postDetails'
      }
    } ,
    { $unwind: { path: '$postDetails', preserveNullAndEmptyArrays: false } } ,
    {$project : {
      filteredPost : 0 ,
    }}
  ]);
};

export const fetchPeopleDB = async ({ skip, userId }) => {
  const cutoff = new Date(Date.now() - 6 * 24 * 3600 * 1000);

  return Following.aggregate([
    { $match: { createdAt: { $gte: cutoff } } },
    { $group: { _id: '$followedTo', followerCount: { $sum: 1 } } },
    { $sort: { followerCount: -1 } },
    { $skip: skip },
    { $limit: 10 },
    
    /* user lookup pipeline – unchanged */
    {$lookup : {
      from : 'users' ,
      let :  {userId : '$_id'} ,
      pipeline : [
        {$match : {
          $expr : {
            $eq : ['$_id' , '$$userId']
          }
        }} ,
        // isFollowing Stasus
        {$lookup : {
          from : 'followings' ,
          let : {personId : '$_id'} ,
          pipeline : [
            {$match : {
              $expr : {
                $eq : ['$followedBy' , new ObjectId(`${userId}`) ] , 
                $eq : ['$followedTo' , '$$personId']
              }}
            } ,
            { $project: { _id: 0, followedTo: 1 } }  
          ] ,
          as : 'IsFollowing' ,
        }} ,
        //following count
        {$lookup : {
          from : 'followings' ,
          localField : '_id' ,
          foreignField : 'followedTo' ,
          as : "followingCount"
        }} ,
        {$addFields : {
          isFollowing : {$gt : [{$size : '$IsFollowing'} , 0 ]} ,
          followers : {$size : '$followingCount'} ,
        }} ,
        {$project : {
          avatar : 1 ,
          username : 1 ,
          fullname : 1 ,
          bio : 1 ,
          isFollowing : 1 ,
          followers : 1 ,
          followers : 1 ,
        }}
      ] ,
      as : 'userDetails' ,
    }} ,
    {$unwind : { path : '$userDetails' , preserveNullAndEmptyArrays : false}}
  ]);
};
