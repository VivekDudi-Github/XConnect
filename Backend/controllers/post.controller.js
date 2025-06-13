import Post from '../models/post.modal.js'
import {ResError , ResSuccess ,TryCatch} from '../utils/extra'

const createPost = TryCatch( async(req , res) => {
  const {content , hashtags , media , repost , visiblity } = req.body ;

  if(!content ) return ResError(res , 400 , 'There should be some text for context.')

  if(!Array.isArray(hashtags)) return ResError(res , 400 , "Hastags' data is invalid.")

  Post.content = content ;
  Post.author = req.user._id ;
  Post.media = [] ;
  Post.hashtags = hashtags || [] ; 
  Post.repost = repost || null ;
  
  const post = await Post.create({
    author : req.user._id ,
    media : [] ,
    hashtags : hashtags || [] ,
    repost : repost || null ,
    visiblity : visiblity || 'public' ,
  })

  return ResSuccess(res , 200 , post)



} , 'CreatePost')