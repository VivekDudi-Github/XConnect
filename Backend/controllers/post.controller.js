import mongoose from 'mongoose';
import { Comment } from '../models/comment.model.js';
import { Likes } from '../models/likes.modal.js';
import {Post} from '../models/post.model.js'
import {User} from '../models/user.model.js'
import { deleteFilesFromCloudinary, uploadFilesTOCloudinary } from '../utils/cloudinary.js';
import {ResError , ResSuccess ,TryCatch} from '../utils/extra.js'
import { Bookmark } from '../models/bookmark.model.js';
import { Preferance } from '../models/prefrence.model.js';
import { Following } from '../models/following.model.js';
import { emitEvent } from '../utils/socket.js';
import { Notification } from '../models/notifiaction.model.js';
import { WatchHistory } from '../models/watchHistory.model.js';


const ObjectId = mongoose.Types.ObjectId ;


const createPost = TryCatch( async(req , res) => {
  req.CreateMediaForDelete = [] ;
  const {content , hashtags = [] ,  repost , mentions= [] , visiblity } = req.body ;
  
  const {media} = req.files ;
  if(media) media.forEach(file => req.CreateMediaForDelete.push(file)) ;
  
  if(!content || typeof content !== 'string' ) return ResError(res , 400 , 'There should be some text for context.')

  if( media && !Array.isArray(media)) return ResError(res , 400 , "Media's data is invalid.")
  if(!Array.isArray(hashtags)) return ResError(res , 400 , "Hastags' data is invalid.")
  if(!Array.isArray(mentions)) return ResError(res , 400 , "Mentions' data is invalid.")
  
  if(repost && typeof repost !== 'string') return ResError(res , 400 , "Repost's data is invalid.")
  if(visiblity && !['public' , 'followers' , 'group'].includes(visiblity)) return ResError(res , 400 , "Visiblity's data is invalid.")

  let cloudinaryResults = [] ;  
  if(media && media.length > 0) {
    cloudinaryResults = await uploadFilesTOCloudinary(media)
  }
  
  const post = await Post.create({
    author : req.user._id ,
    content : content ,
    media : cloudinaryResults || [] ,
    hashtags : hashtags || [] ,
    repost : repost || null ,
    visiblity : visiblity || 'public' ,
    mentions : mentions || [] ,
  })
  if(!post) return ResError(res , 500 , 'Post could not be created.')
    
  ResSuccess(res , 200 , post)


  if(mentions.length > 0){
    const user = await User.find({username : {
      $in : mentions
    }}).select('_id')
  
    const mentionsIds = user
    .map(u => u._id.toString())
    .filter(id => id !== req.user._id.toString()) ;
    
    const ops = mentionsIds.map(mentionId => ({
      insertOne: {
        document: {
          type: 'mention',
          post: post._id,
          sender: req.user._id,
          receiver: mentionId,
        }
      }
    }));
  
    await Notification.bulkWrite(ops , { ordered : false})
    
    mentionsIds.forEach(userId => {
      emitEvent('notification:receive' , `user` , [`${userId}`] , {
        type : 'mention' ,
        post : post._id ,
        sender : {
          avatar : req.user.avatar ,
          username : req.user.username ,
          _id : req.user._id ,
        } ,
      })
    })

  }

  return ;

} , 'CreatePost' ) 

const deletePost = TryCatch(async(req , res) => {
  const {id} = req.params;
  
  if(!id) return ResError(res , 400 , 'Post ID is required.')

  const post = await Post.findById(id);
  
  if(!post) return ResError(res , 404 , 'Post not found.')
  if(!post.author.equals( req.user._id)) return ResError(res , 403 , 'You are not authorized to delete this post.')

  await deleteFilesFromCloudinary(post.media)
  
  post.isDeleted = true;
  await post.save();

  return ResSuccess(res , 200 , 'Post deleted successfully.')
} , 'DeletePost')

const editPost = TryCatch(async(req , res) => {
  const {content , hashtags , repost , visiblity } = req.body;
  const {media} = req.files ;
  const {id} = req.params;

  if(!id) return ResError(res , 400 , 'Post ID is required.')
  if(!content || typeof content !== 'string' ) return ResError(res , 400 , 'There should be some text for context.')
  if(!Array.isArray(media)) return ResError(res , 400 , "Media's data is invalid.")
  if(!Array.isArray(hashtags)) return ResError(res , 400 , "Hastags' data is invalid.")
  if(repost || typeof repost !== 'string') return ResError(res , 400 , "Repost's data is invalid.")
  if(visiblity && !['public' , 'followers' , 'group'].includes(visiblity)) return ResError(res , 400 , "Visiblity's data is invalid.")

  const post = await Post.findById(id).NoDelete();
  if(!post) return ResError(res , 404 , 'Post not found.')

  if(post.author.toString() !== req.user._id.toString()) return ResError(res , 403 , 'You are not authorized to edit this post.')
  
  let cloudinaryResults = [] ;
  
  if(post.media.length > 0) {
    await deleteFilesFromCloudinary(post.media);
    cloudinaryResults = await uploadFilesTOCloudinary(media)
  }

  post.content = content;
  post.hashtags = hashtags || [];
  post.media = cloudinaryResults || [];
  post.repost = repost || null;
  post.visiblity = visiblity || 'public';
  await post.save();

  return ResSuccess(res , 200 , post)

} , 'editPost')

const getPost = TryCatch(async(req , res) => { 
  const {id} = req.params;
  
  if(!id) return ResError(res , 400 , 'Post ID is required.')

  const postData = await Post.findById(id).select('author visiblity') ;
  
  if(!postData || postData.isDeleted === true) return ResError(res , 404 , 'Post not found.') ;
  
  if( !postData.author.equals( req.user._id) && postData.visiblity === 'private') return ResError(res , 403 , 'The post is private.')
  
  const IsFollower = await Following.exists({followedBy : req.user._id , followedTo : postData.author}) ;
  if(!IsFollower && postData.visiblity === 'followers') return ResError(res , 403 , 'You are not authorized to view this post.')


  const post = await Post.aggregate([
    {$match : {
      $expr : {
        $and : [
          {$eq : ['$_id' ,new ObjectId(`${id}`)]} ,
          {$eq : ['$isDeleted' , false]} ,
        ]
      }
    }} ,
    //author
    {$lookup : {
      from : 'users' ,
      let : { userId : '$author'} ,
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
    //repost
    {$lookup : {
      from : 'posts' ,
      let : {'repostsId' : '$repost' } ,
      pipeline : [
        {$match : {
          $expr : {
            $and : [
              {$eq : [ '$_id' , '$$repostsId']} ,
              {$eq : ['$isDeleted' , false]} ,
              {$eq : ['$visiblity' , 'public']} ,
            ]
          }
        }} ,
        //repost-author
        {
          $lookup: {
            from: 'users',
            let: { userId: '$author' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$_id', '$$userId'],
                  },
                },
              },
              {
                $project: {
                  avatar: 1,
                  username: 1,
                  fullname: 1,
                },
              },
            ],
            as: 'authorDetails',
          },
        },
        {$addFields : {
          author : {$arrayElemAt: ['$authorDetails' , 0]} ,
        }} ,
        {$project : {
          author : 1 ,
          content : 1 ,
          media : 1 ,
          hashtags : 1 ,
          visiblity : 1 ,
        }}
      ] , 
      as : 'repostDetails'
    }} ,
    //userlike
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
    //userBookmark
    {$lookup : {
      from : 'bookmarks' ,
      let : { postId : '$_id'} ,
      pipeline : [
        {
          $match : {
            $expr : {
              $and : [
                {$eq : ['$post' , '$$postId']} ,
                {$eq : ['$user' , new ObjectId(`${req.user._id}`)]}
              ]
            }
          }
        }
      ] , 
      as : 'userBookmark'
    }} ,

    {$lookup : {
      from : 'bookmarks' ,
      localField : '_id' ,
      foreignField : 'post' ,
      as : 'bookmarksArray' ,
    }} ,
    {$lookup : {
      from : 'likes' ,
      localField : '_id' ,
      foreignField : 'post' ,
      as : 'likesArray' ,
    }} ,

    {$addFields : {
      likeStatus : { $gt : [{ $size : '$userLike'} , 0 ]}  ,
      bookmarkStatus : { $gt : [{ $size : '$userBookmark'} , 0 ]}  ,
      likeCount :{ $size : '$likesArray'} , 
      bookmarkCount: { $size : '$bookmarksArray'} ,
      repost : '$repostDetails' , 
      author : '$authorDetails' ,
    }} ,
    
    {$unwind: {path: '$author',preserveNullAndEmptyArrays: true} } ,
    {$unwind: {path: '$repost',preserveNullAndEmptyArrays: true} } ,

    {$project : {
      userLike : 0 ,
      isDeleted : 0 ,
      likesArray : 0 ,
      userBookmark : 0 ,
      bookmarkArray : 0 ,
      authorDetails : 0 ,
      repostDetails : 0 ,
    }}

  ])
  

  if(post.length === 0) return ResError(res , 404 , 'Post not found.')

  ResSuccess(res , 200 , post[0])

  if( !post[0].author._id.equals(req.user._id)){
    await WatchHistory.create({
      post : post[0]._id ,
      user : req.user._id ,
    }) ;
  }

}, 'GetPost')


const getUserPosts = TryCatch(async(req , res) => {
  const {page = 1 , username , limit = 2 , tab = 'Posts'} = req.query;
  const skip = (page - 1) * limit;

  const user = await User.exists({username : username}) ;
  let id ;
  if(user) {
    id = user._id ;
  }else {
    id = req.user._id ;
  }
   
  let data ;

  switch (tab) {
    case 'Posts':
      data = await fetchPostsTabs(req , res , id , tab , limit , skip) ;
      break;
    case 'Replies':
      data = await fetchReplies(req , res , id , limit , skip) ;
      break ;
    case 'Likes':
      data = await fetchLikes(req , res , id , limit , skip) ;
      break;
    case 'History':
      data = await fetchHistory(req , res , id , limit , skip) ;
      break;
    default:
      return ResError(res , 400 , 'Invalid tab option provided.') ;
      break;
  }


 if(!data || !data.posts || data.posts.length === 0 ){
  return ;
 }
  console.log(data.posts[0]);
  
  return ResSuccess(res, 200, {posts : data.posts  , totalPages : data.totalPages});
} , 'get User Posts')

const fetchPostsTabs = async(req , res ,id , tab , limit , skip) => {
  const totalPost  = await Post.countDocuments({author : id}) ;
  const totalPages = Math.ceil(totalPost/limit) ;
  
  const posts = await Post.aggregate([
    {$match : {
      author :  new ObjectId(`${id}`) ,
      isDeleted : false ,
    }} ,
    {$sort : {
      createdAt : -1 
    }} ,
    { $skip : skip} ,
    { $limit : limit} ,
    //author details
    {$lookup : {
      from : 'users' ,
      let : { userId : new ObjectId(`${id}`)} ,
      pipeline : [
        {
          $match : {
            $expr : {
              $eq : [ '$_id' , '$$userId']
            }
          }
        } ,
        {
          $project : {
            avatar : 1 ,
            username : 1 ,
            fullname : 1 ,
          }
        }
      ] ,
      as : 'authorDetails'
    }} , 
    //repost
    {$lookup : {
      from : 'reposts' ,
      let : {'repostsId' : '$repost' } ,
      pipeline : [
        {$match : {
          $expr : {
            $eq : [ '$_id' , '$$repostsId']
          }
        }} ,
        {$lookup : {
          from : 'users' ,
          let : { userId : '$author' } ,
          pipeline : [
            {
              $match : {
                $expr : {
                  $eq : [ '$_id' , '$$userId']
                }
              }
            } ,
            {
              $project : {
                avatar : 1 ,
                username : 1 ,
                fullname : 1 ,
              }
            }
          ] ,
          as : 'authorDetails'
        }} ,
        {$addFields : {
          author : '$authorDetails' 
        }} ,
        {$unwind : '$author'}
      ] ,
      as : 'repostDetails'
    }} ,

// check your post like status,
    {$lookup : {
      from : 'likes' ,
      let : {'postId' : '$_id'} ,
      pipeline : [
        {$match : {
          $expr : {
            $and : [
              {$eq : ['$post' , '$$postId']} ,
              {$eq : ['$user' , new ObjectId(`${id}`)]}
            ]
          }
        }}
      ] ,
      as : 'userLike'
    }} ,
    //userBookmark
    {$lookup : {
      from : 'bookmarks' ,
      let : {'postId' : '$_id'} ,
      pipeline : [
        {
          $match : {
            $expr : {
              $and : [
                {$eq : ['$post' , '$$postId']} ,
                {$eq : ['$user' , new ObjectId(`${id}`)]}
              ]
            }
          }
        }
      ] , 
      as : 'userBookmark'
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


    {$addFields : {
      isBookmarked : { $gt : [{ $size : '$userBookmark'} , 0 ]} ,
      likeStatus : { $gt : [{ $size : '$userLike'} , 0 ]} ,
      likeCount :{ $size : '$likesArray'} , 
      repost : '$repostDetails' , 
      author : '$authorDetails' ,
      commentCount : {$size : '$totalComments'} ,
    }} ,
    
    {$project : {
      userLike : 0 ,
      isDeleted : 0 ,
      likesArray : 0 ,
      userBookmark : 0 ,
      authorDetails : 0 ,
      repostDetails : 0 ,
    }} ,

    {$unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
    {$unwind: { path: "$repost", preserveNullAndEmptyArrays: true } },


  ])

  return {posts , totalPages};
}
const fetchReplies = async(req , res , id , limit , skip) => {
  const totalPost  = await Comment.countDocuments({author : id}) ;
  const totalPages = Math.ceil(totalPost/limit) ;
  


}
const fetchHistory = async(req , res , id , limit , skip) => {
  const totalPost  = await Post.countDocuments({author : id}) ;
  const totalPages = Math.ceil(totalPost/limit) ;
  
  const posts = await WatchHistory.aggregate([
    {$match : {
      user : new ObjectId(`${id}`) ,
    }} ,
    {$sort : {
      createdAt : -1 
    }} ,
    { $skip : skip} ,
    { $limit : limit} ,

    //main-post
    {$lookup : {
      from : 'posts' ,
      let : { postId : '$post'} ,
      pipeline : [
        {$match : {
          $expr : {
            $eq : [ '$_id' , '$$postId']
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
        //repost
        {$lookup : {
          from : 'posts' ,
          let : {postId : '$repost'} ,
          pipeline : [
            {$match : {
              $expr : {
                $eq : ['$_id' , '$$postId']
              }
            }} , 
            //repost author
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
              as : 'repostAuthorDetails'
            }} , 
            {$addFields : {
              author : { $arrayElemAt: ['$repostAuthorDetails' , 0]} ,
            }} ,
          ] ,
          as : 'repostDetails'
        }} ,
        {$addFields : {
          author : { $arrayElemAt: ['$authorDetails' , 0]} ,
          repost : { $arrayElemAt: ['$repostDetails' , 0]} 
        }}
      ] ,
      as : 'postDetails' ,
    }} ,

    {$unwind: { path: "$postDetails", preserveNullAndEmptyArrays: true } },

    {$project : {
      user : 0 ,
      post : 0
     }} ,
  ])

  return {posts , totalPages} ;
}
const fetchLikes = async(req , res , id , limit , skip) => {
  const totalPost  = await Post.countDocuments({author : id}) ;
  const totalPages = Math.ceil(totalPost/limit) ;
  
  const posts = await Likes.aggregate([
    {$match : {
      user : new ObjectId(`${id}`) ,
      post : {$ne : null} , 
    }} ,
    {$sort : {
      createdAt : -1 
    }} ,
    { $skip : skip} ,
    { $limit : limit} ,
    
    //post
    {$lookup : {
      from : 'posts' ,
      let : { postId : '$post'} ,
      pipeline : [
        {$match : {
          $expr : {
            $eq : [ '$_id' , '$$postId']
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
        //repost
        {$lookup : {
          from : 'posts' ,
          let : {postId : '$repost'} ,
          pipeline : [
            {$match : {
              $expr : {
                $eq : ['$_id' , '$$postId']
              }
            }} , 
            //repost author
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
              as : 'repostAuthorDetails'
            }} , 
            {$addFields : {
              author : { $arrayElemAt: ['$repostAuthorDetails' , 0]} ,
            }} ,
          ] ,
          as : 'repostDetails'
        }} ,
        //userlike
        {$lookup : {
          from : 'likes' ,
          let : {'postId' : '$_id'} ,
          pipeline : [
            {$match : {
              $expr : {
                $and : [
                  {$eq : ['$post' , '$$postId']} ,
                  {$eq : ['$user' , new ObjectId(`${id}`)]}
                ]
              }
            }}
          ] ,
          as : 'userLike'
        }} ,
        //userBookmark
        {$lookup : {
          from : 'bookmarks' ,
          let : {'postId' : '$_id'} ,
          pipeline : [
            {
              $match : {
                $expr : {
                  $and : [
                    {$eq : ['$post' , '$$postId']} ,
                    {$eq : ['$user' , new ObjectId(`${id}`)]}
                  ]
                }
              }
            }
          ] , 
          as : 'userBookmark'
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
    

        {$addFields : {
          author : { $arrayElemAt: ['$authorDetails' , 0]} ,
          repost : { $arrayElemAt: ['$repostDetails' , 0]} ,
          isBookmarked : { $gt : [{ $size : '$userBookmark'} , 0 ]} ,
          likeStatus : { $gt : [{ $size : '$userLike'} , 0 ]} ,
          likeCount :{ $size : '$likesArray'} , 
          commentCount : {$size : '$totalComments'} ,
        }}
      ] ,
      as : 'postDetails' ,
    }} ,

    {$unwind: { path: "$postDetails", preserveNullAndEmptyArrays: true } },

    {$replaceRoot: { 
      newRoot: {
        $mergeObjects: ['$postDetails', '$$ROOT']
      }
    }},
    {$unset : 'postDetails'},

  ])

  return { posts ,totalPages} ;
}


const toggleOnPost = TryCatch(async(req , res) => {
  const {id} = req.params ;
  const {option} = req.body ;

  if(!id) return ResError(res , 400 , 'Post id not provided.')

  if(option === 'pin'){
    const post = await Post.findOne({_id : id , author : req.user._id}) ;
    if(!post) return ResError(res , 404 , 'Post not found')
    let pinStatus = post.isPinned ;
    
    post.isPinned = !post.isPinned ;
    await post.save() ;
    return ResSuccess(res , 200 , {operation : !pinStatus } ) ;
  }

  switch (option) {
    case 'like':
      await LikePost(req , res , id ,)
      break;
    case 'bookmark' : 
      await BookmarkPost(req ,res , id)
      break ;
    default: 
      return ResError(res , 400 , 'Something went wrong.')
    break;
  }

} , 'toggleOnPost')

const BookmarkPost = async(req , res , postId) => {
  const IsPostExist = await Post.exists({_id : postId})
  if(!IsPostExist) return ResError(res , 400 , 'No such Post exist')
  

  const IsAlreadyLiked = await Bookmark.exists({post : postId , user : req.user._id})
  if(IsAlreadyLiked){
    await Bookmark.deleteOne({_id : IsAlreadyLiked._id}) ;
    return ResSuccess(res , 200 ,{operation : false} )
  }else {
    await Bookmark.create({post : postId , user : req.user._id}) ;
     return ResSuccess(res , 200 , {operation : true} )
  }
}
const LikePost = async(req , res , postId , ) => {
  const IsPostExist = await Post.findById({_id : postId}).select('author hashtags').populate('author' , 'username fullname avatar') ;
  if(!IsPostExist) return ResError(res , 400 , 'No such Post exist')
  
  const hashtags =  IsPostExist?.hashtags.slice(0 , 4) || [] ;
  
  const IsAlreadyLiked = await Likes.exists({post : postId , user : req.user._id})
  
  if(IsAlreadyLiked){
    await Likes.deleteOne({_id : IsAlreadyLiked._id}) ;
    ResSuccess(res , 200 ,{operation : false} )
    
    const DeletedNotifcation = await Notification.findOneAndDelete({
      type : 'like' ,
      post : postId ,
      sender : req.user._id ,
      receiver : IsPostExist.author._id ,  
    }).select('_id') ;
  
    if(DeletedNotifcation){
    emitEvent('notification:retract' , `user` , [`${IsPostExist.author._id.toString()}`] , {
      type : 'like' ,
      _id : DeletedNotifcation._id.toString() ,
    } )
  }
  
    if(hashtags.length > 0){
      console.log('removed like');
      const ops = hashtags.map((h) => ({
        updateOne : {
          filter : { user : req.user._id , hashtags  : h} ,
          update : { $inc : { score : -1} } ,
          upsert : true 
        }
      })
      ) ;

     await Preferance.bulkWrite(ops , { ordered : false})
    }
    return ;

  } else {
    await Likes.create({post : postId , user : req.user._id}) ;
    ResSuccess(res , 200 , {operation : true} )
    console.log(IsPostExist.author._id.toString() , );

   const notification = await Notification.create({
      type : 'like' ,
      post : postId ,
      sender : req.user._id ,
      receiver : IsPostExist.author._id ,
    })

    //emit event to socket
    emitEvent('notification:receive' , `user` , [`${IsPostExist.author._id.toString()}`] , {...notification._doc , sender : {
      _id : req.user._id ,
      username : req.user.username ,
      avatar : req.user.avatar ,
    }} ) 
    
    

    if(hashtags.length > 0){  
      console.log('added like');
      const ops = hashtags.map((h) => ({
        updateOne: {
          filter: { user: req.user._id, hashtags: h },
          update: { $inc: { score: 1 } },
          upsert: true
        }
      }
      )) ;
    
      await Preferance.bulkWrite(ops , { ordered : false})
    }
    return ;
  }
}

const fetchFeedPost = TryCatch( async(req , res) => {
  //post from least last 3 days, post from followers , post from preferances
  const userId = req.user._id ;

  const followings = await Following.find({followedBy : userId}) ;
  const tags = await Preferance.find({user : userId }).select(' hashtags -_id') ;
  
  const hashtags = tags.map(t => t.hashtags )
  

  
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 4);


  const posts = await Post.aggregate([
    {
      $match : {
        $expr : {
          $and : [
            {$eq : ['$isDeleted' , false]} ,
            {$or : [
              { $gte: ['$createdAt', threeDaysAgo] },
              { $in: ['$author', followings] },
              { $in: ['$hashtags', hashtags] }
            ]}
          ]
        }
      } 
    } ,
    {$sample : { size : 10}} ,

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

    {$addFields : {
      author : '$authorDetails' ,
      likeStatus : { $gt : [{ $size : '$userLike'} , 0 ]}  ,
      likeCount : {$size : '$totalLike'} ,
      commentCount : {$size : '$totalComments'} ,
    }} ,

    // {$unwind: {path: '$totalComments',preserveNullAndEmptyArrays: true} } ,
    {$unwind: {path: '$author',preserveNullAndEmptyArrays: true} } ,
    
    {$project : {
      authorDetails : 0 ,
      totalLike : 0 ,
      userLike : 0 ,
    }}

  ])
  
  return ResSuccess (res , 200 , posts)

} , 'fetchFeedPosts')
 
const fetchExplorePost = TryCatch(async(req , res) => {

  const posts = await Post.aggregate([
    {
      $sort : { 
        likeCount : -1 ,
        createdAt : -1 ,
      }
    } ,
    { $sample : {size : 10}} ,
    { $limit : 10} ,


    {$project : {
      content  : 1 ,
      media : 1 ,
      author : 1 ,
      createdAt : 1 ,
      isEdited : 1 ,
    }}
  ])

  ResSuccess(res , 200 , posts)

} , 'fetchExplorePosts')


export {
  createPost ,
  deletePost ,
  editPost ,
  getPost ,
  getUserPosts ,
  toggleOnPost ,

  fetchFeedPost ,
  fetchExplorePost ,

}