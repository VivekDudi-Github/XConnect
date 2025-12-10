import {TryCatch , ResError , ResSuccess} from '../utils/extra.js'

import { User } from '../models/user.model.js'
import { Post } from '../models/post.model.js';
import { Community } from '../models/community.model.js';

const searchBarsearch = TryCatch(async (req , res) => {
  const {q ,page = 1 ,limit = 20 } = req.query ;
  if(!q) return ResError(res , 400 , 'Search query is required')
  //search - post -> content , hashtags , title ,
  //search - user -> username 
  //search - community -> name , description

  //autocomple - usernames , communitynames
  // fuzz - get users , posts and users

  const users = await User.aggregate([
    {$search : {
      index : 'autocomplete_users' ,
      autocomplete : {
        query : q , 
        path : 'username' ,
        fuzzy : {
          maxEdits : 2 ,
          prefixLength : 2 ,
        }
      }
    }} ,
    {$limit : 10} ,
    {$addFields : {
      name : '$username' ,
    }} ,
    {$project : {
      name : 1 ,
    }} , 
  ])

  const communities = await Community.aggregate([
    {$search : {
      index : 'communities' ,
      autocomplete : {
        query : q ,
        path : 'name' ,
        fuzzy : {
          maxEdits : 2 ,
          prefixLength : 2 ,
        }
      }
    }} , 
    {$project : {
      _id : 0 ,
      name : 1 ,
    }} ,
    {$limit : 10}
  ])
  
  return ResSuccess( res , 200 , {autocomplete : {users , communities}})
} , 'search')

const getSearchPosts = async(q , skip , limit) => {
  const posts = await Post.aggregate([
    {$search : {
      index : 'posts' ,
      text : {
        query : q , 
        path  : 'content' ,
        fuzzy : {
          maxEdits : 2 ,
          prefixLength : 2 ,
        }
      }
    }} , 
    {$skip : skip} ,
    {$limit : limit} ,
    //author details
    {$lookup : {
      from : 'users', 
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
              {$eq : ['$user' , new ObjectId(`${req.user._id}`)]}
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
      author : '$authorDetails' ,
      likeStatus : { $gt : [{ $size : '$userLike'} , 0 ]}  ,
      likeCount : {$size : '$totalLike'} ,
      commentCount : {$size : '$totalComments'} ,
    }} ,
    
    {$unwind : '$authorDetails'} ,

    {$project : {
      content : 1 ,
      hashtags : 1 ,
      title : 1 ,
      category : 1 ,
      createdAt : 1 ,
      media : 1 ,
      authorDetails : 0 ,
      totalLike : 0 ,
      userLike : 0 ,
      isDeleted : 0 ,
      author : '$authorDetails' ,
    }}
  ]) 

  return posts ;
}

const getSearchUsers = async(q , skip , limit ) => {
  
  const users = await User.aggregate([
    {$search : {
      index : 'autocomplete_users' ,
      autocomplete : {
        query : q ,
        path : 'username' ,
        fuzzy : {
          maxEdits : 2 ,
          prefixLength : 2 ,
        }
      }
    }} ,
    {$skip : skip} ,
    {$limit : limit} ,
    // isFollwing
    {$lookup : {
      from : 'followings' ,
      let : {userId : '$_id'} ,
      pipeline : [
        {$match : {
          $expr : {
            $eq : ['$followedBy' , '$$userId']
          }}
        } ,
        { $project: { _id: 0, followedTo: 1,   followingCommunity : 1 } } 
      ] ,
      as : 'followings' ,
    }} ,
    // totalFollowers
    {$lookup : {
      from : 'followers' , 
      localField : '_id' ,
      foreignField : 'followedTo' ,
      as : 'totalFollowers'
    }} ,
    {$addFields : {
      isFollowing : {$gt : [{$size : '$followings'} , 0]} ,
      totalFollowers : {$size : '$totalFollowers'} ,
    }} ,
    {$project : {
      username : 1 ,
      fullname : 1 ,
      avatar : 1 ,
      isFollowing : 1 ,
      totalFollowers : 1 ,
    }}
  ])

  return users ;
}

const getSearchCommunities = async(q , skip, limit , userId ) => {

  const communities = await Community.aggregate([
    {$search : {
      index : 'communities' ,
      text : {
        query : q ,
        path : 'description' ,
        fuzzy : {
          maxEdits : 2 ,
          prefixLength : 2 ,
        }
      }
    }} ,
    {$skip : skip} ,
    {$limit : limit} ,
    //isFollowing
    {$lookup : {
      from : 'followings' ,
      let : {userId : new ObjectId(`${userId}`)} ,
      pipeline : [
        {$match : {$expr : {
          $eq : ['$followedBy' , '$$userId'] ,
          $eq : ['$followingCommunity' , '$_id']}
        }} 
      ] ,
      as : 'followings' ,
    }} ,
    {$addFields : {
      isFollowing : {$gt : [{$size : '$followings'} , 0]}
    }} ,
    {$project : {
      name : 1 ,
      avatar : 1 ,
      banner : 1 ,
      description : 1 ,
      isFollowing : 1 ,
      followings : 0 ,
    }}
  ])

  return communities ;
}

const normalSearch = TryCatch(async (req,res) => {
  const {q , page = 1 } = req.query ;
  if(!q) return ResError(res , 400 , 'Search query is required') ;

  let skip = (page -1) * 5 ;

  const userResults = await getSearchUsers(q , skip , 5) ;
  const postResults = await getSearchPosts(q , skip , 5) ;
  const communityResults = await getSearchCommunities(q , skip , 5 , req.user._id) ;

  return ResSuccess(
    res , 200 , {
      userResults ,
      postResults ,
      communityResults ,
    }
  )

} , 'normalSearch')

const continueSearchUsers = TryCatch(async(req ,res) => {} , 'continueSearchUsers')

const continueSearchCommunities = TryCatch(async(req ,res) => {} , 'continueSearchCommunities')

const continueSearchPosts = TryCatch(async(req ,res) => {} , 'continueSearchPosts')

const searchUsers = TryCatch(async(req ,res) => {
  const {q ,page = 1 ,limit = 20 } = req.query ;
  if(!q) return ResError(res , 400 , 'Search query is required')
  console.log(q);
  
  let skip = (page -1) * limit ;
  const users = await User.aggregate([
    {$match : {$text : {$search : q}}} ,
    {$skip : skip} ,
    {$limit : limit} ,
    {$lookup : {
      from : 'followings' ,
      let : {userId : '$_id'} ,
      pipeline : [
        {$match : {$expr : {$eq : ['$followedBy' , '$$userId']}}}
      ] ,
      as : 'followings' ,
    }} ,
    {$addFields : {
      isFollowing : {$gt : [{$size : '$followings'} , 0]}
    }} ,
    {$project : {
      fullname : 1 ,
      username : 1 ,
      name : 1 ,
      avatar : 1 ,
      isFollowing : 1 ,
    }}
  ])
  console.log(users);
  
  return ResSuccess( res , 200 , {results : users , page})
} , 'searchUsers')

export {
  searchBarsearch,
  normalSearch , 
  searchUsers ,

  continueSearchUsers ,
  continueSearchCommunities , 
  continueSearchPosts ,
}
