import mongoose from 'mongoose';
import { Likes } from '../models/likes.modal.js';
import {Post} from '../models/post.model.js'
import {User} from '../models/user.model.js'
import { deleteFilesFromCloudinary, uploadFilesTOCloudinary } from '../utils/cloudinary.js';
import {ResError , ResSuccess ,TryCatch} from '../utils/extra.js'
import { Bookmark } from '../models/bookmark.model.js';
import { Preferance } from '../models/prefrence.model.js';
import { Following } from '../models/following.model.js';
import { Hashtag } from '../models/hastags.model.js';


const ObjectId = mongoose.Types.ObjectId ;


const createPost = TryCatch( async(req , res) => {
  req.CreatePostMediaForDelete = [] ;
  const {content , hashtags = [] ,  repost , mentions= [] , visiblity } = req.body ;
  
  const {media} = req.files ;
  if(media) media.forEach(file => req.CreatePostMediaForDelete.push(file)) ;
  
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
      from : 'bookmarks' ,
      let : {'postId' : '$_id'} ,
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
      from : 'likes' ,
      localField : '_id' ,
      foreignField : 'post' ,
      as : 'likesArray' ,
    }} ,

    {$addFields : {
      isBookmarked : { $gt : [{ $size : '$userBookmark'} , 0 ]} ,
      likeStatus : { $gt : [{ $size : '$userLike'} , 0 ]} ,
      likeCount :{ $size : '$likesArray'} , 
      repost : '$repostDetails' , 
      author : '$authorDetails' ,
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

  
  return ResSuccess(res, 200, {posts  , totalPages});
} , 'get MyPosts')

const toggleOnPost  = TryCatch(async(req , res) => {
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
    await Bookmark.create({post : id , user : req.user._id}) ;
     return ResSuccess(res , 200 , {operation : true} )
  }
}

const LikePost = async(req , res , postId , ) => {
  const IsPostExist = await Post.findById({_id : postId})
  if(!IsPostExist) return ResError(res , 400 , 'No such Post exist')
  
  const hashtags =  IsPostExist.hashtags.slice(0 , 4) || [] ;
  console.log(hashtags);
  
  const IsAlreadyLiked = await Likes.exists({post : postId , user : req.user._id})
  
  if(IsAlreadyLiked){
    await Likes.deleteOne({_id : IsAlreadyLiked._id}) ;
    ResSuccess(res , 200 ,{operation : false} )
    
    
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
  }else {
    await Likes.create({post : postId , user : req.user._id}) ;
    ResSuccess(res , 200 , {operation : true} )
    
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

  const followings = await Following.find({followedBy : userId})

  const tags = Preferance.find({user : userId })

  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const posts = await Post.aggregate([
    {
      $match : {
        $or : [
          {createdAt : { $gte : threeDaysAgo}} ,
          { author : { $in : followings}} ,
          { hashtags : { $in : tags }} ,
        ]
      }
    } , 
    { $sort : {createdAt : -1}} ,
    {$limit : 10} ,
  ])

  return ResSuccess (res , 200 , posts)

} , 'fetchFeedPosts')

const fetchExplorePost = TryCatch(async(req , res) => {
  const tags =await  Hashtag.find({count : 1 })

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

} , 'fetchExplorePosts')


export {
  createPost ,
  deletePost ,
  editPost ,
  getPost ,
  getMyPosts ,
  toggleOnPost ,

  fetchFeedPost ,
  fetchExplorePost ,
}