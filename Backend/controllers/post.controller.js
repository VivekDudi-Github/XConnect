import mongoose from 'mongoose';
import { Likes } from '../models/likes.modal.js';
import {Post} from '../models/post.model.js'
import { deleteFilesFromCloudinary, uploadFilesTOCloudinary } from '../utils/cloudinary.js';
import {ResError , ResSuccess ,TryCatch} from '../utils/extra.js'


const ObjectId = mongoose.Types.ObjectId ;


const createPost = TryCatch( async(req , res) => {
  req.CreatePostMediaForDelete = [] ;
  const {content , hashtags = [] ,  repost , mentions= [] , visiblity } = req.body ;
  
  const {media} = req.files ;
  if(media) media.forEach(file => req.CreatePostMediaForDelete.push(file)) ;
  
  if(!content || typeof content !== 'string' ) return ResError(res , 400 , 'There should be some text for context.')

  if( media && !Array.isArray(media)) return ResError(res , 400 , "Media's data is invalid.")
  if(!Array.isArray(hashtags)) return ResError(res , 400 , "Hastags' data is invalid.")
  if(!Array.isArray(mentions)) return ResError(res , 400 , "Mention' data is invalid.")
  
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
    
  return ResSuccess(res , 200 , post)

} , 'CreatePost' )

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

const getMyPosts = TryCatch(async(req , res) => {
  const {page = 1 , limit = 2 , tab = 'Posts'} = req.query;
  const skip = (page - 1) * limit;  

  const totalPost  = await Post.countDocuments({author : req.user._id}) ;
  const totalPages = Math.ceil(totalPost/limit) ;
  

  const posts = await Post.aggregate([
    {$match : {
      author :  new ObjectId(`${req.user._id}`) ,
      isDeleted : false ,
    }} ,
    {$sort : {
      createdAt : -1 
    }} ,
    { $skip : skip} ,
    { $limit : limit} ,

    {$lookup : {
      from : 'users' ,
      let : { userId : new ObjectId(`${req.user._id}`)} ,
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

    {$lookup : {
      from : 'reposts' ,
      let : {'repostsId' : '$repost' } ,
      pipeline : [
        {$match : {
          $expr : {
            $eq : [ '$_id' , '$$repostsId']
          }
        }} ,
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
              {$eq : ['$user' , new ObjectId(`${req.user._id}`)]}
            ]
          }
        }}
      ] ,
      as : 'userLike'
    }} ,

    {$lookup : {
      from : 'likes' ,
      localField : '_id' ,
      foreignField : 'post' ,
      as : 'likesArray' ,
    }} ,

    {$addFields : {
      likeStatus : { $gt : [{ $size : '$userLike'} , 0 ]} ,
      totalLikes :{ $size : '$likesArray'} , 
      repost : '$repostDetails' , 
      author : '$authorDetails'
    }} ,
    
    {$project : {
      userLike : 0 ,
      likesArray : 0  ,
      authorDetails : 0 ,
      repostDetails : 0 ,
    }} ,

    {$unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
    {$unwind: { path: "$repost", preserveNullAndEmptyArrays: true } },


  ])

  

  // const post = await Post.find({author: req.user._id}).NoDelete()
  //   .sort({createdAt: -1})
  //   .skip(skip)
  //   .limit(Number(limit))
  //   .populate('repost', 'author content media hashtags visiblity')
  //   .populate('author', 'username fullname profilePicture');
    
  return ResSuccess(res, 200, {posts  , totalPages});
} , 'get MyPosts')

const toggleLikePost  = TryCatch(async(req , res) => {
  const {id} = req.params ;
  if(!id) return ResError(res , 400 , 'Post id not provided.')
  
  const IsPostExist = await Post.exists({_id : id})
  if(!IsPostExist) return ResError(res , 400 , 'No such Post exist')
  
  const IsAlreadyLiked = await Likes.exists({post : id , user : req.user._id})
  if(IsAlreadyLiked){
    await Likes.deleteOne({_id : IsAlreadyLiked._id}) ;
    return ResSuccess(res , 200 ,{like : false} )
  }else {
    await Likes.create({post : id , user : req.user._id}) ;
    return ResSuccess(res , 200 , {like : true} )
  }
} , 'toggleLikePost')


export {
  createPost ,
  deletePost ,
  editPost ,
  getPost ,
  getMyPosts ,
  toggleLikePost ,
}