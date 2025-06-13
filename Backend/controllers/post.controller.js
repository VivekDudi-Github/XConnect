import {Post} from '../models/post.model.js'
import { deleteFilesFromCloudinary, uploadFilesTOCloudinary } from '../utils/cloudinary.js';
import {ResError , ResSuccess ,TryCatch} from '../utils/extra.js'

const createPost = TryCatch( async(req , res) => {
  const {content , hashtags = [] ,  repost , visiblity } = req.body ;
  console.log(req.body , req?.files);
  const {media} = req.files ;

  if(!content || typeof content !== 'string' ) return ResError(res , 400 , 'There should be some text for context.')

  if(!Array.isArray(media)) return ResError(res , 400 , "Media's data is invalid.")
  if(!Array.isArray(hashtags)) return ResError(res , 400 , "Hastags' data is invalid.")
  if(repost && typeof repost !== 'string') return ResError(res , 400 , "Repost's data is invalid.")
  if(visiblity && !['public' , 'followers' , 'group'].includes(visiblity)) return ResError(res , 400 , "Visiblity's data is invalid.")

  let cloudinaryResults = [] ;  
  if(media.length > 0) {
    cloudinaryResults = await uploadFilesTOCloudinary(media)
  }
  
  const post = await Post.create({
    author : req.user._id ,
    media : cloudinaryResults || [] ,
    hashtags : hashtags || [] ,
    repost : repost || null ,
    visiblity : visiblity || 'public' ,
  })
  if(!post) return ResError(res , 500 , 'Post could not be created.')

  return ResSuccess(res , 200 , post)

} , 'CreatePost')

const deletePost = TryCatch(async(req , res) => {
  const {id} = req.params;

  if(!id) return ResError(res , 400 , 'Post ID is required.')

  const post = await Post.findById(id);
  if(!post) return ResError(res , 404 , 'Post not found.')

  await deleteFilesFromCloudinary(post.media)
  
  post.isDeleted = true;
  post.deletedAt = new Date();
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

  const post = await Post.findOne({_id : id , isDeleted : false})
  .populate('repost' , 'author content media hashtags visiblity')
  .populate('author' , 'username fullname profilePicture')


  if(!post) return ResError(res , 404 , 'Post not found.')

  return ResSuccess(res , 200 , post)
}, 'GetPost')


export {
  createPost ,
  deletePost ,
  editPost ,
  getPost ,
}