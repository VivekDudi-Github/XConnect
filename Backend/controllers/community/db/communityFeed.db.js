import { Post } from '../../../models/post.model.js';
import { ObjectId } from 'mongodb';

export const getCommunityFeedAggregation = async ({
  userId,
  hashtags,
  limit,
  skip,
}) => {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 4);

  const getFollowings = await Following.find({ followedBy: userId }).select('followedTo followingCommunity -_id').lean(); 

  const followingUserIds = getFollowings.map(f => f.followedTo).filter(Boolean) ;
  const followingCommunityIds = getFollowings.map(f => f.followingCommunity).filter(Boolean) ;

  return Post.aggregate([
      //match posts
      {$match : {
          $expr : {
            $and : [
              // {$gte: ['$createdAt', threeDaysAgo] } ,
              {$eq : ['$isDeleted' , false]} ,
              {$eq : ['$type' , 'community']} ,
              {$or : [
                { $gte: ['$createdAt', threeDaysAgo] },
                { $in: ['$author', followingUserIds] },
                { $in: ['$hashtags', hashtags] },
                { $in : ['$community', followingCommunityIds] },
              ]}
            ]
          }
        }
      } ,
      {$skip : skip} ,
      
      {$limit : limit} ,
  
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
            username : 1 ,
          }}
        ] ,
        as : 'authorDetails'
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
  
      {$addFields : {
        author : {$cond : {
          if : { $eq : ['$isAnonymous' , true] } ,
          then : 'Anonymous' ,
          else : '$authorDetails' ,
        }} ,
        likeStatus : { $gt : [{ $size : '$userLike'} , 0 ]}  ,
        likeCount : {$size : '$totalLike'} ,
        commentCount : {$size : '$totalComments'} ,
        community : {$arrayElemAt : ['$communityDetails.name' , 0]} ,
        communityId : {$arrayElemAt : ['$communityDetails._id' , 0]} ,
      }} ,
  
      {$unwind: {path: '$author',preserveNullAndEmptyArrays: true} } ,
      
      {$project : {
        authorDetails : 0 ,
        totalLike : 0 ,
        userLike : 0 ,
        communityFollowIds : 0 ,
        userFollowIds : 0 ,
        UsersFollowing : 0 ,
        communityDetails : 0 ,
        isDeleted : 0 ,
      }}
  ])
};
