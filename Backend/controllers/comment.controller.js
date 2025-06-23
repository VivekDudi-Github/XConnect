import {ResError, ResSuccess, TryCatch} from '../utils/extra' ;
import { uploadFilesTOCloudinary } from '../utils/cloudinary';
import {Comment} from '../models/comment.model' ;


const createComment  = TryCatch( async (req , res ) => {
  const postId =  req.params ;
  req.CreateMediaForDelete = [] ;
  const { content , comment_id ,isEdited = false , mentions = [] , replyTo } =  req.body ;

  const {media} = req.files ;

  if(media) media.forEach(file => req.CreateMediaForDelete.push(file)) ;

  
  if(!postId) return ResError(res , 400 , 'PostId not found')
  if(!content ) return ResError(res , 400 , 'Text Should not be empty')
  
  if(content && typeof content !== 'string') return ResError(res , 400 ,'Content data is invalid')  
  if(media && !Array.isArray(media)) return ResError(res , 400 , 'Media data is invalid')
  if(mentions && !Array.isArray(mentions)) return ResError(res , 400 , 'Mention data is invalid ')  

  const isExistComment = await Comment.exists({_id : comment_id})
  if(!isExistComment){
    return  ResError(res , 400 , 'Invalid replying Id') ;
  } ;

  let cloudinaryResults = [] ;  
  if(media && media.length > 0) {
    cloudinaryResults = await uploadFilesTOCloudinary(media)
  } ;  

  const comment = await Comment.create({
    content ,
    cloudinaryResults ,
    isEdited ,
    replyTo ,
    comment_id ,
  })

  return ResSuccess(res ,200 , comment)

} , createComment)