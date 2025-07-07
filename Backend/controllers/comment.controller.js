import {ResError, ResSuccess, TryCatch} from '../utils/extra.js' ;
import {Comment} from '../models/comment.model.js' ;
import { Post } from '../models/post.model.js';
import { Likes } from '../models/likes.modal.js';
import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { Notification } from '../models/notifiaction.model.js';
import { emitEvent } from '../utils/socket.js';

const ObjectId = mongoose.Types.ObjectId;

const createComment  = TryCatch( async (req , res ) => {
  const {id} =  req.params ;
  const { content , comment_id ,isEdited = false , mentions = [] } =  req.body ;
  
  
  if(!id) return ResError(res , 400 , 'PostId not found')
  if(!content ) return ResError(res , 400 , 'Text Should not be empty')
  
  if(content && typeof content !== 'string') return ResError(res , 400 ,'Content data is invalid')  
  if(mentions && !Array.isArray(mentions)) return ResError(res , 400 , 'Mention data is invalid ')  
    
  const isExistPost = await Post.findOne({_id : id}).select('author').populate('author' , 'username fullname avatar') ;
  if(!isExistPost) return ResError(res , 400 , 'Post not found')

  let isExistComment = null ;

  if(comment_id ){
    if(!ObjectId.isValid(comment_id)) return  ResError(res , 400 , 'Invalid replying Id') ;
    isExistComment = await Comment.findOne({_id : comment_id}).select('user')
    if(!isExistComment) return  ResError(res , 400 , 'Invalid replying Id') ;
  }

  const comment = await Comment.create({
    post : id ,
    content ,
    isEdited ,
    user : req.user._id ,
    replyTo : comment_id ? 'comment' : 'post' ,
    comment_id :  comment_id ? comment_id : null ,
  } )

  ResSuccess(res ,200 , comment) ;

  if(!comment_id){
    const notif = await Notification.create({
      type : 'comment' ,
      post : id ,
      sender : req.user._id , 
      receiver : isExistPost.author._id ,
      comment_Id : comment._id.toString()
    })
    emitEvent('notification:receive' , `user` , [`${isExistPost.author._id.toString()}`] , {
      _id : notif._id ,
      type : 'comment' ,
      post : id ,
      comment_Id : comment._id.toString() ,
      sender : {
        avatar : req.user.avatar ,
        username : req.user.username ,
        _id : req.user._id ,
      } ,
    })
  } else {
    const notif = await Notification.create({
      type : 'reply' ,
      post : id ,
      sender : req.user._id ,
      comment_Id : comment._id ,
      receiver : isExistComment.user ,
    })
    emitEvent('notification:receive' , `user` , [`${isExistComment.user.toString()}`] , {
      _id : notif._id ,
      type : 'reply' ,
      post : id ,
      comment_Id : comment._id.toString() ,
      sender : {
        avatar : req.user.avatar ,
        username : req.user.username ,
        _id : req.user._id ,
      } ,
    })
  }
  
  if(mentions.length > 0){
    const user = await User.find({username : {
      $in : mentions
    }}).select('_id')
  
    const mentionsIds = user
    .map(u => u._id.toString())
    .filter(id => id !== req.user._id.toString()) ;
    
    const ops = mentionsIds.map(id => ({
      insertOne: {
        document: {
          type: 'mention',
          post: id,
          sender: req.user._id,
          receiver: id,
          comment_Id : comment._id ? comment._id.toString() : null ,
        }
      }
    }));
  
    await Notification.bulkWrite(ops , { ordered : false})
    
    mentionsIds.forEach(userId => {
      emitEvent('notification:receive' , `user` , [`${userId}`] , {
        type : 'mention' ,
        post : id ,
        comment_Id : comment._id? comment._id.toString() : null ,
        sender : {
          avatar : req.user.avatar ,
          username : req.user.username ,
          _id : req.user._id ,
        } ,
      })
    })

  }

  return ;

} , 'createComment')

const getComments = TryCatch(async(req , res) => {
  const {id} = req.params ;
  const {page = 1 , limit = 5 , sortBy = 'Top' , isComment = false  , comment_id = null} = req.query; 
  const skip = (page - 1) * limit;  
console.log(req.query);

  let totalComments ; 
  
  let sortOptions = [] ;

  switch (sortBy) {
    case 'Top' :
      sortOptions = [
        {$sample : {size : Number(limit)}}
      ]
      break;
    case 'Most Liked' :
      sortOptions = [
        {$limit : Number(limit)} ,
        {$sort : {
          totalLike : 1 ,
        }}
      ]
      break;
    case 'Newest' :
      sortOptions = [
        {$limit : Number(limit)} ,
        {$sort : {
          createdAt : -1 ,
        }}
      ]
      break;
  
    default:
      sortOptions = [
        {$sample : {size : Number(limit)}}
      ]
      break;
  }

  let CommentQuery = []  ;
  
  if(isComment === 'true' && ObjectId.isValid(comment_id)){
    totalComments = await Comment.countDocuments({post : id , comment_id : new ObjectId(`${comment_id}`) , replyTo : 'comment' } ) ;
    CommentQuery = [
      {$eq : ['$replyTo' , 'comment']} ,
      {$eq : ['$comment_id' , new ObjectId(`${comment_id}`)]} 
    ]
  }else {
    totalComments = await Comment.countDocuments({post : id , replyTo : 'post' }) ;
    CommentQuery = [
      {$eq : ['$replyTo' , 'post']} ,
    ]
  }
  
  const totalPages = Math.ceil(totalComments/limit) ;

  const comments = await Comment.aggregate([
    {$match : 
      {$expr : {
        $and : [
          {$eq : ['$post' , new ObjectId(`${id}`)]} ,
          ...CommentQuery
        ]
      }}
    } ,
    ...sortOptions ,
    { $skip : skip} ,

    {$lookup : {
      from : 'comments' ,
      let : { commentId : '$_id'} ,
      pipeline : [
        {$match : {
          $expr : {
            $and : [
              {$eq : ['$post' , new ObjectId(`${id}`)]} ,
              {$eq : ['$replyTo' , 'comment']} ,
              {$eq : ['$comment_id' , '$$commentId']} ,
            ]
          }
        }} ,
        {$project : {
          content : 0 ,
          author : 0 ,
          createdAt : 0 ,
          isEdited : 0 ,
        }}
      ] ,
      as : 'replyDetails'
    }} ,
    {$lookup : {
      from : 'users' ,
      let : { userId : '$user'} ,
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
      as : 'userDetails'  
    }} ,
    {$lookup : {
      from : 'likes' ,
      foreignField : 'comment' ,
      localField : '_id' ,
      as : 'totalLike' ,
    }} ,
    {$lookup : {
      from : 'likes' ,
      let : { commentId : '$_id'} ,
      pipeline : [
        {$match : {
          $expr : {
            $and : [
              {$eq : ['$comment' , '$$commentId']} ,
              {$eq : ['$user' , new ObjectId(`${req.user._id}`)]} ,
            ]
          }
        }} ,
      ] ,
      as : 'likeStatus' ,
    }} ,
    {$addFields : {
      author : '$userDetails' ,
      replyCount : {$size : '$replyDetails'} ,
      likeStatus : { $gt : [{ $size : '$likeStatus'} , 0 ]}  ,
      likeCount : {$size : '$totalLike'} ,
    }} ,

    {$unwind: {path: '$author',preserveNullAndEmptyArrays: true} } ,
    
    {$project : {
      replyDetails : 0 ,
      userDetails : 0 ,
      totalLike : 0 ,
      userLike : 0 ,
    }}

  ])
  
  return ResSuccess(res, 200, {comments  , totalPages , totalComments});

} , 'get Comments')

const toggleLikeComment = TryCatch(async (req , res) => {
  const {id} = req.params ; 
  
  const isExistComment = await Comment.exists({_id : id})
  if(!isExistComment) return  ResError(res , 404 , 'Comment not found') ;

  const isExistLike = await Likes.exists({comment : id , user : req.user._id})

  if(isExistLike) {
    await Likes.deleteOne({comment : id , user : req.user._id})
    ResSuccess(res , 200 , {operation : false}) ;
  } else{ 
    await Likes.create({
      user : req.user._id ,
      comment : id ,
    }) ;
    ResSuccess(res , 200 , {operation : true}) ;
  } ;

  await Post.findByIdAndUpdate(id , {
    $inc : {
      commentCount : isExistLike ? -1 : 1 ,
    }
  });
  return ;

} , 'like Comment')

const deleteComment = TryCatch(async (req , res) => {
  const {id} = req.params ;
  
  const isExistComment = await Comment.findById({_id : id}).select('user') ;

  if(!isExistComment) return  ResError(res , 404 , 'Comment not found') ;

  if( !isExistComment.user.equals(req.user._id)) return ResError(res , 403 , 'You are not the owner of this comment') ;

  await Comment.deleteOne({_id : id})
  return ResSuccess(res , 200 , 'Comment deleted successfully') ;

} , 'delete Comment')

const getSingleComment = TryCatch(async (req , res) => {
  const {id } = req.params ;
  const isExistComment = await Comment.exists({_id : id})
  if(!isExistComment) return  ResError(res , 404 , 'Comment not found') ;

  const comment = await Comment.aggregate([
    {$match : {
      _id : new ObjectId(`${id}`) ,
    }} ,

    //userDetails
    {$lookup : {
      from : 'users' ,
      let : { userId : '$user'} ,
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
      as : 'userDetails'  
    }} ,
 
    //total like
    {$lookup : {
      from : 'likes' ,
      foreignField : 'comment' ,
      localField : '_id' ,
      as : 'totalLike' ,
    }} ,

    //reply count
    {$lookup : {
      from : 'comments' ,
      let : { commentId : '$_id' , postId : '$post'} ,
      pipeline : [
        {$match : {
          $expr : {
            $and : [
              {$eq : ['$post' , '$$postId']} ,
              {$eq : ['$replyTo' , 'comment']} ,
              {$eq : ['$comment_id' , '$$commentId']} ,
            ]
          }
        }} ,
        {$project : {
          content : 0 ,
          author : 0 ,
          createdAt : 0 ,
          isEdited : 0 ,
        }}
      ] ,
      as : 'replyDetails'  
    }} ,

    //like Status
    {$lookup : {
      from : 'likes' ,
      let : { commentId : '$_id'} ,
      pipeline : [
        {$match : {
          $expr : {
            $and : [
              {$eq : ['$comment' , '$$commentId']} ,
              {$eq : ['$user' , new ObjectId(`${req.user._id}`)]} ,
            ]
          }
        }} ,
      ] ,
      as : 'likeStatus' ,
    }} ,

    {$addFields : {
      author : '$userDetails' ,
      replyCount : {$size : '$replyDetails'} ,
      likeStatus : { $gt : [{ $size : '$likeStatus'} , 0 ]}  ,
      likeCount : {$size : '$totalLike'} ,
    }} ,
    {$unwind : {path : '$author' , preserveNullAndEmptyArrays : true}} 
  ])

  if(comment.length === 0) return ResError(res , 404 , 'Comment not found') ;
  return ResSuccess(res , 200 , comment[0]) ;

} , 'get single Comment')

export {
  createComment ,
  getComments ,
  toggleLikeComment ,
  deleteComment ,
  getSingleComment ,
} 