import {TryCatch , ResError , ResSuccess} from '../utils/extra.js'
import { ObjectId } from 'mongodb';
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
      text : {
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

const getSearchPosts = async(q , skip , limit , userId) => {
  let totalPosts ;
  
  if(skip === 0){
    totalPosts = await Post.aggregate([
      {$searchMeta : {
        index : 'post' ,
        compound: {
        must: [
          {
            text: {
              query: q,
              path: 'content',
              fuzzy: { maxEdits: 2, prefixLength: 2 }
            }
          }
        ],
        mustNot: [
          {
            equals: {
              path: "isDeleted",
              value: true
            }
          }
        ]
      }}}
    ])
    console.log(totalPosts);
    
    totalPosts = Math.ceil(totalPosts[0].count.lowerBound / limit );
  }

  const posts = await Post.aggregate([
    {$search : {
      index : 'post' ,
      text : {
        query : q , 
        path  : 'content' ,
        fuzzy : {
          maxEdits : 2 ,
          prefixLength : 2 ,
        }
      }
    }} , 
    {$match : {
      $expr : {
        $eq : ['$isDeleted' , false ]
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

    {$unwind : '$authorDetails'} ,
    {$addFields : {
      author : '$authorDetails' ,
      likeStatus : { $gt : [{ $size : '$userLike'} , 0 ]}  ,
      likeCount : {$size : '$totalLike'} ,
      commentCount : {$size : '$totalComments'} ,
    }} ,
    
    {$project : {
      content : 1 ,
      hashtags : 1 ,
      title : 1 ,
      category : 1 ,
      createdAt : 1 ,
      media : 1 ,
      author : 1 ,
      likeStatus : 1 ,
      likeCount : 1 ,
      commentCount : 1 ,
      views : 1 ,
    }}
  ]) 

  return {posts , totalPosts} ;
}

const getSearchUsers = async(q , skip , limit , userId) => {
  let totalUsers ;

  if(skip === 0){
    totalUsers = await User.aggregate([
      {$searchMeta : {
        index : 'autocomplete_users' ,
        autocomplete : {query : q , path : 'username' , fuzzy : {maxEdits : 2 , prefixLength : 2}}
      }}
    ])
    totalUsers = Math.ceil(totalUsers[0].count.lowerBound / limit) ;
  }
    console.log(skip , totalUsers);
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
            $and : [
              {$eq : ['$followedBy' , new ObjectId(`${userId}`)]} ,
              {$eq : ['$followedTo' , "$$userId"]}
            ]
          }}
        } ,
        { $project: { _id: 1} }
      ] ,
      as : 'followings' ,
    }} ,
    // totalFollowers
    {$lookup : {
      from : 'followings' , 
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

  return {users , totalUsers} ;
}

const getSearchCommunities = async(q , skip, limit , userId ) => {
  let totalComm ;
  if(skip === 0){
    let totalComm = await Community.aggregate([
      {$searchMeta : {
        index : 'communities' ,
        text : {query : q , path : ['name' , 'description'] , fuzzy : {maxEdits : 2 , prefixLength : 2}}
      }}
    ])
    
    totalComm = Math.floor(totalComm[0].count.lowerBound / limit);
  }

  const communities = await Community.aggregate([
    {$search : {
      index : 'communities' ,
      text : {
        query : q ,
        path : ['description' , 'name'] ,
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
      let : {commId : '$_id' } ,
      pipeline : [
        {$match : {
          $expr : {
            $and : [
              {$eq : ['$followedBy' , new ObjectId(`${userId}`) ] },
              {$eq : ['$followingCommunity' , '$commId']}
            ]
          }
        }} 
      ] ,
      as : 'followings' ,
    }} ,
    //follwers count
    {$lookup : {
      from : 'followers' ,
      localField : '_id' ,
      foreignField : 'followedTo' ,
      as : 'totalFollowers'
    }} ,
    {$addFields : {
      isFollowing : {$gt : [{$size : '$followings'} , 0]} ,
      totalFollowers : {$size : '$totalFollowers'}
    }} ,
    {$project : {
      name : 1 ,
      avatar : 1 ,
      banner : 1 ,
      isFollowing : 1 ,
      totalFollowers : 1 ,
      description : 1 ,
    }}
  ])

  return {communities , totalComm} ;
}

const normalSearch = TryCatch(async (req,res) => {
  const {q , page = 1 } = req.query ;
  if(!q) return ResError(res , 400 , 'Search query is required') ;
  if(q.length > 100) return ResError(res , 400 , 'Search query is too long') ;

  let skip = (page -1) * 5 ;

  const {users , totalUsers} = await getSearchUsers(q , skip , 5 , req.user._id) ;
  const {posts , totalPosts} = await getSearchPosts(q , skip , 5 , req.user._id) ;
  const {communities , totalComm} = await getSearchCommunities(q , skip , 5 , req.user._id) ;

  return ResSuccess(
    res , 200 , {
      user : {results : users , total : totalUsers} ,
      post : {results : posts , total :totalPosts} ,
      communities : {results : communities , total : totalComm} ,
    }
  )

} , 'normalSearch')

const continueSearch = TryCatch(async(req ,res) => {
  const {q , page = 2 , tab } = req.query ;
  if(!q) return ResError(res , 400 , 'Search query is required')
  let limit = 5 ;
  let skip = (page -1) * limit ;
  if(tab !== 'post' && tab !== 'user' && tab !== 'community' ) return ResError(res , 400 , 'Wrong tab type.')

  let results  = [] ;

  switch (tab) {
    case 'post':
      results = (await getSearchPosts(q , skip , 5 , req.user._id)).posts ;
    break;
    case 'community' :
      results = (await getSearchCommunities(q , skip , 5 , req.user._id)).communities ;
    break ;
    case 'user' :
      results = (await getSearchUsers(q, skip , 5 , req.user._id)).users ;
    break ;
    default:
      break;
  }


  return ResSuccess(res , 200 , results) ;
} , 'continueSearchUsers')

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

  continueSearch ,
}
