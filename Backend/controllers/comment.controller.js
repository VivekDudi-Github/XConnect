import {ResError, ResSuccess, TryCatch} from '../utils/extra.js' ;
import {Comment} from '../models/comment.model.js' ;
import { Post } from '../models/post.model.js';

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
    replyTo : comment_id ? 'comment' : 'post' ,
    comment_id :  comment_id ? comment_id : null ,
  } )

  return ResSuccess(res ,200 , comment)

} , 'createComment')

const getComment = TryCatch(async(req , res) => {
  const {id} = req.params ;
  const {page = 1 , limit = 2 } = req.query;
  const skip = (page - 1) * limit;  

  const totalComments  = await Comment.countDocuments({post : id }) ;
  const totalPages = Math.ceil(totalComments/limit) ;
  
  const comments = await Comment.aggregate([
    {$match : 
      {$expr : {
        $and : [
          {$eq : ['$post' , new ObjectId(`${id}`)]} ,
          {$eq : ['$replyTo' , 'post']} ,
        ]
      }}
    } ,
    {$sort : {
      createdAt : -1 
    }} ,
    { $skip : skip} ,
    { $limit : limit} ,

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
      likeCount : {$size : '$totalLike'}
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

export {
  createComment ,
  getComment ,
} 