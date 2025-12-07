import {TryCatch , ResError , ResSuccess} from '../utils/extra.js'

import { User } from '../models/user.model.js'
import { Post } from '../models/post.model.js';
import { Community } from '../models/community.model.js';

const searchBarsearch = TryCatch(async (req , res) => {
  const {q ,page = 1 ,limit = 20 } = req.params ;
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
    {$project : {
      username : 1 ,
    }} , 
    {$limit : 10}
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
      name : 1 ,
    }} ,
    {$limit : 10}
  ]) ;

  const bySearchCommunities = await getSearchCommunities(true) ;
  const bySearchUsers = await getSearchUsers(true) ;

  return ResSuccess( res , 200 , {autocomplete : {users , communities} , users : bySearchUsers , communities : bySearchCommunities , page , limit})
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

const getSearchUsers = async(q , skip , limit ,isSearchBar) => {
  let skipFilter = [] ;
  if(isSearchBar){
    skipFilter.push({$limit : 10}) ;
  }else {
    skipFilter.push({$skip : skip}) ;
    skipFilter.push({$limit : limit}) ;
  }
  
  const users = await User.aggregate([
    {$search : {
      index : 'autocomplete_users' ,
      text : {
        query : q ,
        path : 'username' ,
        fuzzy : {
          maxEdits : 2 ,
          prefixLength : 2 ,
        }
      }
    }} ,
    ...skipFilter ,
    //isFollwing
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
    //totalFollowers
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

const getSearchCommunities = async(q , skip, limit , isSearchBar) => {
  let skipFilter = [] ;
  if(isSearchBar){
    skipFilter.push({$limit : 10}) ;
  }else {
    skipFilter.push({$skip : skip}) ;
    skipFilter.push({$limit : limit}) ;
  }
  
  let projections = [] ;

  if(isSearchBar){
    projections.push({
      name : 1 ,
      avatar : 1 ,
    }) ;
  }else { 
    projections.push({
      name : 1 ,
      avatar : 1 ,
      banner : 1 ,
      description : 1 ,
    }) ;
  }

  const communities = await Community.aggregate([
    {$search : {
      index : 'communities' ,
      text : {
        query : q ,
        path : 'name' ,
        fuzzy : {
          maxEdits : 2 ,
          prefixLength : 2 ,
        }
      }
    }} ,
    ...skipFilter ,
    {$project : {
      ...projections[0] ,
    }}
  ])

  return communities ;
}




const normalSearch = TryCatch(async (req,res) => {

} , 'normalSearch')


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
  search , 
  searchUsers ,
}
