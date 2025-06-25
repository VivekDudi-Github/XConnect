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
    console.log(id);
    
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

export {
  createComment
} 