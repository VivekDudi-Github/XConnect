import {ResError, ResSuccess, TryCatch} from '../utils/extra.js' ;
import {Comment} from '../models/comment.model.js' ;
import { Post } from '../models/post.model.js';
import { Likes } from '../models/likes.modal.js';
import mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

const createComment  = TryCatch( async (req , res ) => {
  const {id} =  req.params ;
  const { content , comment_id ,isEdited = false , mentions = [] } =  req.body ;
  
  
  if(!id) return ResError(res , 400 , 'PostId not found')
  if(!content ) return ResError(res , 400 , 'Text Should not be empty')
  
  if(content && typeof content !== 'string') return ResError(res , 400 ,'Content data is invalid')  
  if(mentions && !Array.isArray(mentions)) return ResError(res , 400 , 'Mention data is invalid ')  
    
  const isExistPost = await Post.exists({_id : id})
  if(!isExistPost) return ResError(res , 400 , 'Post not found')

  if(comment_id ){
    const isExistComment = await Comment.exists({_id : comment_id})
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

  return ResSuccess(res ,200 , comment)

} , 'createComment')

const getComments = TryCatch(async(req , res) => {
  const {id} = req.params ;
  const {page = 1 , limit = 5 , sortBy = 'Top' } = req.query; 
  const skip = (page - 1) * limit;  

  const totalComments  = await Comment.countDocuments({post : id }) ;
  const totalPages = Math.ceil(totalComments/limit) ;
  
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

  const comments = await Comment.aggregate([
    {$match : 
      {$expr : {
        $and : [
          {$eq : ['$post' , new ObjectId(`${id}`)]} ,
          {$eq : ['$replyTo' , 'post']} ,
        ]
      }}
    } ,
    ...sortOptions ,
    { $skip : skip} ,

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
    {$addFields : {
      author : '$userDetails' ,
      likeStatus : { $gt : [{ $size : '$totalLike'} , 0 ]}  ,
      likeCount : {$size : '$totalLike'} ,
    }} ,

    {$unwind: {path: '$author',preserveNullAndEmptyArrays: true} } ,
    
    {$project : {
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
 
export {
  createComment ,
  getComments ,
  toggleLikeComment ,
  deleteComment ,
} 