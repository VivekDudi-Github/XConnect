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
import { Community } from '../models/community.model.js';
import { Hashtag } from '../models/hastags.model.js';
import moment from 'moment';
import { LikesCount } from '../models/likesCount.model.js';
import { VideoUpload } from '../models/videoUpload.model.js';

const ObjectId = mongoose.Types.ObjectId ;

//add videoId in the media
const createPost = TryCatch( async(req , res) => {
  req.CreateMediaForDelete = [] ;
  const {content , hashtags = [] , title , community  , isCommunityPost = false,  repost , mentions= [] , scheduledAt , category ,isAnonymous , videoIds } = req.body ;
  
  const {media} = req.files ;
  if(media) media.forEach(file => req.CreateMediaForDelete.push(file)) ;
  
  if(content && typeof content !== 'string' ) return ResError(res , 400 , 'There should be some text for context.') ;  

  if( media && !Array.isArray(media)) return ResError(res , 400 , "Media's data is invalid.") ;
  if(!Array.isArray(hashtags)) return ResError(res , 400 , "Hastags' data is invalid.") ;
  if(!Array.isArray(mentions)) return ResError(res , 400 , "Mentions' data is invalid.") ;

  if(scheduledAt && !moment(scheduledAt).isValid()) return ResError(res , 400 , 'Invalid scheduled date.') ;
  if(new Date(scheduledAt).getTime() < new Date().getTime()) return ResError(res , 400 , 'Past dates are not allowed.') ;

  if(repost && !ObjectId.isValid(repost)) return ResError(res , 400 , "Repost's data is invalid.") ;  

  if(isCommunityPost){
    if(category && typeof category !== 'string') return ResError(res , 400 , 'Category is required.') ;
    if([ 'general' , 'question' , 'feedback' , 'showcase'].includes(category) === false) return ResError(res , 400 , 'Invalid category.') ; 
    if(!title || typeof title !== 'string') return ResError(res , 400 , 'Title is required.') ;
    if(!category || typeof category !== 'string') return ResError(res , 400 , 'Category is required.') ;
    if(!ObjectId.isValid(community)) return ResError(res , 400 , 'Invalid community id.') ;
    const IsCommunityExist = await Community.exists({_id : community}) ;
    if(!IsCommunityExist) return ResError(res , 400 , 'Invalid community id.') ;
  }

  let cloudinaryResults = [] ;  
  if(media && media.length > 0) {
    cloudinaryResults = await uploadFilesTOCloudinary(media) ;
  }

  let videos = [] ;
  if(videoIds && videoIds?.length > 0){
    for(let i = 0 ; i < videoIds.length ; i++){
      const videoUpload = await VideoUpload.exists({public_id : videoIds[i] , user : req.user._id});
      if(!videoUpload) continue ;
      videos.push({
        type : 'video' , 
        url : `/${videoIds[i]}/hsl/master.m3u8` ,
        public_id : videoIds[i] ,
      })
    }
  }
console.log(videoIds , videos , 'line:67');

 console.log('posting')
  const post = await Post.create({
    author : req.user._id ,
    content : content ,
    media : [...cloudinaryResults , ...videos] || [] ,
    hashtags : hashtags || [] ,
    repost : repost || null ,
    scheduledAt : scheduledAt ||  null ,
    mentions : mentions || [] ,
    community : isCommunityPost ? community : null ,
    title : isCommunityPost ? title : null ,
    isAnonymous : isAnonymous || false ,
    category : category || null ,
    type : isCommunityPost ? 'community' : 'post' ,
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

  if(hashtags.length){
    const ops = hashtags.map(h => {
      return {
        updateOne: {
          filter: { name: h },
          update: { $inc: { count: 1 } },
          upsert : true
        }
      }
    })

    await Hashtag.bulkWrite(ops)
  }

  return ;

} , 'CreatePost' ) 

const deletePost = TryCatch(async(req , res) => {
  const {id} = req.params;
  
  if(!id) return ResError(res , 400 , 'Post ID is required.')

  const post = await Post.findById(id);
  
  if(!post) return ResError(res , 404 , 'Post not found.')
  if(!post.author.equals( req.user._id)) return ResError(res , 403 , 'You are not authorized to delete this post.')

  await deleteFilesFromCloudinary(post.media) ;
  
  post.isDeleted = true;
  await post.save();

  return ResSuccess(res , 200 , 'Post deleted successfully.')
} , 'DeletePost')

const editPost = TryCatch(async(req , res) => {
  const {content , hashtags , repost } = req.body;
  const {media} = req.files ;
  const {id} = req.params;

  if(!id) return ResError(res , 400 , 'Post ID is required.')
  if(!content || typeof content !== 'string' ) return ResError(res , 400 , 'There should be some text for context.')
  if(!Array.isArray(media)) return ResError(res , 400 , "Media's data is invalid.")
  if(!Array.isArray(hashtags)) return ResError(res , 400 , "Hastags' data is invalid.")
  if(repost || typeof repost !== 'string') return ResError(res , 400 , "Repost's data is invalid.")

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
  await post.save();

  return ResSuccess(res , 200 , post)

} , 'editPost')

const getPost = TryCatch(async(req , res) => { 
  const {id} = req.params;
  
  if(!id) return ResError(res , 400 , 'Post ID is required.')

  const postData = await Post.findById(id).select('author scheduledAt') ;
  
  if(!postData || postData.isDeleted === true) return ResError(res , 404 , 'Post not found.') ;
  if(!postData.author.equals( req.user._id) && postData.scheduledAt && new Date(postData.scheduledAt).getTime() < new Date().getTime()) return ResError(res , 403 , 'The post is private.')

  
  // const IsFollower = await Following.exists({followedBy : req.user._id , followedTo : postData.author}) ;


  const post = await Post.aggregate([
    {$match : {
      $expr : {
        $and : [
          {$eq : ['$_id' ,new ObjectId(`${id}`)]} ,
          {$eq : ['$isDeleted' , false]} ,
        ]
      }
    }} ,
    //community
    {$lookup : {
      from : 'communities' ,
      let : { communityId : '$community'} ,
      pipeline : [
        {$match : {
          $expr : {
            $eq : ['$_id' , '$$communityId']
          }
        }} ,
        {$project: {
          name : 1 ,
          avatar : 1 ,
        }} ,
      ] ,
      as : 'communityDetails' ,
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
      community : '$communityDetails' ,
    }} ,
    {$unwind : {path : '$community' , preserveNullAndEmptyArrays : true}} ,
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
      communityDetails : 0 ,
    }}

  ])

  if(post.length === 0) return ResError(res , 404 , 'Post not found.')

  ResSuccess(res , 200 , post[0])

  await Post.findByIdAndUpdate({_id : id} , {$inc : {engagements : 1}}) ;

  if( !post[0].author._id.equals(req.user._id)){
    await WatchHistory.deleteOne({post : post[0]._id , user : req.user._id}) ;
    await WatchHistory.create({
      post : post[0]._id ,
      user : req.user._id ,
      author : post[0].author._id ,
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
    return ResError(res , 400 , 'User not found.')
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
    case 'BookMarks':
      data = await fetchBookmarkedPosts(req , res , id , limit , skip) ;
      break;
    default:
      return ResError(res , 400 , 'Invalid tab option provided.') ;
      break;
  }


 if(!data || !data.posts || data.posts.length === 0 ){
  return ResSuccess(res, 200, {posts : [] , totalPages : 0});
 }

  
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
  const totalPost  = await Comment.countDocuments({user : id}) ;
  const totalPages = Math.ceil(totalPost/limit) ;
  

const posts = await Comment.aggregate([
  {$match : {
    user : new ObjectId(`${id}`) 
  }} ,
  {$sort : {
    createdAt : -1 
  }} ,
  { $skip : skip} ,
  { $limit : limit} ,
  
  //mycomment author
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
    as : 'myCommentAuthorDetails'
  }} ,

  //comment
  {$lookup : {
    from : 'comments' ,
    let : { commentId : '$comment_id'} ,
    pipeline : [
      {$match : {
        $expr : {
          $eq : [ '$_id' , '$$commentId']
        }
      }} ,
      //author
      {$lookup : {
        from : 'users' , 
        let : {userId : '$user'} ,
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
      //likes , like status , comment count
      {$lookup : {
        from : 'likes' ,
        let : { commentId : '$_id'} ,
        pipeline : [
          {$match : {
            $expr : {
              $and : [
                {$eq : ['$comment' , '$$commentId']} ,
                {$eq : ['$user' , new ObjectId(`${id}`)]}
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
        foreignField : 'comment' ,
        as : 'totalLike' ,
      }} ,
      //totalComments
      {$lookup : {
        from : 'comments' ,
        localField : '_id' ,
        foreignField : 'comment_id' ,
        as : 'totalComments' ,
      }} ,

      {$addFields : {
        author : { $arrayElemAt: ['$authorDetails' , 0]} ,
        commentCount : {$size : '$totalComments'} ,
        likeCount : {$size : '$totalLike'} ,
        likeStatus : { $gt : [{ $size : '$userLike'} , 0 ]} ,
      }} ,
      {$project : { 
        userLike : 0 ,
        totalLike : 0 ,
        authorDetails : 0 ,
        totalComments : 0 ,
      }}
    ] , 
    as : 'commentDetailsRaw'
  }} ,
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
      }} , 
      {$project : { 
        userLike : 0 ,
        isDeleted : 0 ,
        likesArray : 0 ,
        userBookmark : 0 ,
        authorDetails : 0 ,
        repostDetails : 0 ,
        totalComments : 0 ,
      }}
    ] ,
    as : 'postDetailsRaw' ,
  }} ,



  {$addFields: {
      author : { $arrayElemAt: ['$myCommentAuthorDetails' , 0]} ,
      postDetails: {
        $cond: {
          if: { $eq: ["$replyTo", "post"] },
          then: { $arrayElemAt: ["$postDetailsRaw", 0] },
          else: null
        }
      },
      commentDetails: {
        $cond: {
          if: { $eq: ["$replyTo", "comment"] },
          then: { $arrayElemAt: ["$commentDetailsRaw", 0] },
          else: null
        }
      }
    }
  } ,
  {$project : {
    postDetailsRaw : 0 ,
    commentDetailsRaw : 0 ,
  }}


]) ;
 return {posts , totalPages} ;
}
const fetchHistory = async(req , res , id , limit , skip) => {
  const totalPost  = await WatchHistory.countDocuments({ user : id}) ;
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
        //user like
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

    {$replaceRoot : {
      newRoot : {
        $mergeObjects: ['$$ROOT' , '$postDetails']
      }
    }},
    {$unset : 'postDetails'},

    {$project : { 
      userLike : 0 ,
      isDeleted : 0 ,
      likesArray : 0 ,
      userBookmark : 0 ,
      authorDetails : 0 ,
      repostDetails : 0 ,
      totalComments : 0 ,
    }}
  ])

  return {posts , totalPages} ;
}
const fetchLikes = async(req , res , id , limit , skip) => {
  const totalPost  = await Likes.countDocuments({user : id}) ; 
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
        $mergeObjects: ['$$ROOT' , '$postDetails']
      }
    }},
    
    {$unset : 'postDetails'} ,

    {$project : { 
      userLike : 0 ,
      isDeleted : 0 ,
      likesArray : 0 ,
      userBookmark : 0 ,
      authorDetails : 0 ,
      repostDetails : 0 ,
      totalComments : 0 ,
    }} ,
  ])

  return { posts ,totalPages} ;
}
const fetchBookmarkedPosts = async(req , res , id , limit , skip) => {
  const totalPost  = await Bookmark.countDocuments({ user : id}) ;
  const totalPages = Math.ceil(totalPost/limit) ;
  
  const posts = await Bookmark.aggregate([
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
        //user like
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

    {$replaceRoot : {
      newRoot : {
        $mergeObjects: ['$$ROOT' , '$postDetails']
      }
    }},
    {$unset : 'postDetails'},

    {$project : { 
      userLike : 0 ,
      isDeleted : 0 ,
      likesArray : 0 ,
      userBookmark : 0 ,
      authorDetails : 0 ,
      repostDetails : 0 ,
      totalComments : 0 ,
    }}
  ])

  return {posts , totalPages} ;
}

const toggleOnPost = TryCatch(async(req , res) => {
  const {id} = req.params ;
  const {option} = req.body ;

  if(!ObjectId.isValid(id)) return ResError(res , 400 , 'Post id not provided.')

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
    ResSuccess(res , 200 ,{operation : false} ) ;
    
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
      })
    }

    await LikesCount.findOneAndUpdate({
      user : IsPostExist.author._id ,
      createdAt : IsAlreadyLiked.createdAt ,
    } , {
      $inc : {count : -1}
    })

    if(hashtags.length > 0){
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

    await LikesCount.findOneAndUpdate({
      user : IsPostExist.author._id ,
    } , {
      $inc : {count : 1}
    } , {
      upsert : true ,
    })
    
    if(IsPostExist.author._id.equals(req.user._id)) return ;

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
  //post from least last 7 days, post from followers , post from preferances
  const userId = req.user._id ;
  let { tab , page} = req.query ;
  const tags = await Preferance.find({user : userId }).select(' hashtags -_id').sort({score : 1}).limit(50)
  console.log(page  , tab);
  
  let skip = (page - 1) * 10 ;

  const hashtags = tags.map(t => t.hashtags )
  let filter = [];
  switch (tab) {
    case 'Communities':
      filter = [
        {$eq : ['$type' , 'community']} ,
      ]
      break;
    case 'Media':
      filter = [
        {$gte : [{$size : '$media'}  , 1]}
      ]
      break ;
    case 'Following':
      filter = [
        { $in: ['$author', '$userFollowIds'] },
      ]
    default:
      break;
  }

  const timeAgo = new Date();
  timeAgo.setDate(timeAgo.getDate() - 7);


  const posts = await Post.aggregate([
    {$lookup : {
      from : 'followings' ,
      let : {
        userId : new ObjectId(`${req.user._id}`) ,        
      } ,
      pipeline : [
        {$match : {
          $expr : {
            $eq : ['$followedBy' , '$$userId']
          }}
        } ,
        { $project: { _id: 0, followedTo: 1,   followingCommunity : 1 } } 
      ] ,
      as : 'UsersFollowing' ,
    }} ,
    {$addFields : {
      communityFollowIds : {
        $map : {
          input : '$UsersFollowing' ,
          as : 'id' ,
          in : '$$id.followingCommunity'
        }
      } ,
      userFollowIds : {
        $map : {
          input : '$UsersFollowing' ,
          as : 'id' ,
          in : '$$id.followedTo'
        }
      }
    }} ,
    {$match : {
        $expr : {
          $and : [
            // {$gte: ['$createdAt', threeDaysAgo] } ,
            {$eq : ['$isDeleted' , false]} ,
            ...filter ,
            {$or : [
              { $gte: ['$createdAt', timeAgo ] },
              { $in: ['$author', '$userFollowIds'] },
              { $in: ['$community', '$communityFollowIds'] },
              { $in: ['$hashtags', hashtags] },
            ]}
          ]
        }
      }
    } ,
    {$skip : skip} ,
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

    //community name
    {$lookup : {
        from : 'communities' ,
        let : { communityId : '$community'} ,
        pipeline : [
          {$match : {
            $expr : {
              $eq : ['$_id' , '$$communityId']
            }
          }} ,
          {$project: {
            name : 1 ,
          }}
        ] ,
        as : 'communityDetails'
      }
    } ,

    {$addFields : {
      author : '$authorDetails' ,
      likeStatus : { $gt : [{ $size : '$userLike'} , 0 ]}  ,
      likeCount : {$size : '$totalLike'} ,
      commentCount : {$size : '$totalComments'} ,
      community : {$arrayElemAt : ['$communityDetails.name' , 0]} ,
      communityId : {$arrayElemAt : ['$communityDetails._id' , 0]} ,
      totalComments : {$size : '$totalComments'} ,
    }} , 

    {$unwind: {path: '$author',preserveNullAndEmptyArrays: true} } ,
    
    {$project : {
      authorDetails : 0 ,
      totalLike : 0 ,
      userLike : 0 ,
      communityFollowIds : 0 ,
      userFollowIds : 0 ,
      communityDetails : 0 ,
      isDeleted : 0 ,
      UsersFollowing : 0 ,
      isPinned : 0
    }}

  ])
  
  return ResSuccess (res , 200 , posts)

} , 'fetchFeedPosts')
 
const fetchExplorePost = TryCatch(async(req , res) => {
  const {tab , page } = req.query ;
  const userId = req.user._id ;
  console.log(tab , page);
  if(!tab || (tab !== 'Trending' && tab !== 'Media' && tab !== 'Communities' && tab !== 'People')) return ResError(res , 400 , 'Invalid tab option provided.')

  let skip = (page - 1) * 10 ;
  
  const cutoff = new Date(Date.now() - 6 * 3600 * 1000) ;
  
  let posts ;
  switch (tab) {
    case 'People' :
      posts = await fetchPeople(req,res , skip) ;
      break ;
      default:
      posts = await fetchTrending(req , res , tab , skip) ;
      break;
  }
  
  return ResSuccess(res , 200 , posts) ;

} , 'fetchExplorePosts')

const fetchTrending = async(req, res , tab , skip) => {
  let cutoff = new Date(Date.now() - 7 * 24 * 3600 * 1000) ;
  const userId = req.user._id ;

  let andConditions = [{$eq : ['$_id' , '$$postId']}] ;
  
  switch (tab) {
    case 'Communities':
    andConditions.push( {$eq : ['$type' , 'community']}) ;
      break;
    case 'Media':
      andConditions.push({ $gte: [ 
        { $size: { $ifNull: ['$media', []] } }, 1 
      ]} )
      break ;
    default:
      break;
  }

  const posts = await Likes.aggregate([
    {
      $match : { createdAt : { $gte : cutoff }} ,
    },
    { $group : {
        _id : '$post' ,
        likeCount : { $sum : 1 } ,
      }
    } ,

    //simple lookup to filter posts based on tab
    {$lookup : {
      from : 'posts' ,
      let : { postId : '$_id'} ,
      pipeline : [
        {$match : {
          $expr : {
            $and : andConditions ,
          }
        }} ,
        {$project : { _id : 1}} 
      ] ,
      as : 'filteredPost'
    }} ,
    {$unwind : { path : '$filteredPost' , preserveNullAndEmptyArrays : false}} ,
    {$sort : {
      likeCount : -1 ,
      }
    } ,
    { $skip : skip} ,
    { $limit : 10} ,
    //post details
    { $lookup : {
        from : 'posts' ,
        let : { postId : '$_id'} ,
        pipeline : [
          { $match : {
            $expr : {
              $eq : ['$_id' , '$$postId']
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
          //likeStatus 
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
            as : 'likesArray' ,
          }} ,
          //totalComments
          {$lookup : {
            from : 'comments' ,
            localField : '_id' ,
            foreignField : 'post' ,
            as : 'totalComments' ,
          }} ,
          //bookmark status
          {$lookup : {
            from : 'bookmarks' ,
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
            as : 'userBookmark'
          }} ,
          {$addFields : {
            author : { $arrayElemAt: ['$authorDetails' , 0]} ,
            likeCount : {$size : '$likesArray'} ,
            commentCount : {$size : '$totalComments'} ,
            likeStatus : { $gt : [{ $size : '$userLike'} , 0 ]} ,
            bookmarkStatus : { $gt : [{ $size : '$userBookmark'} , 0 ]} ,
          }} ,
          {$project : {
            totalComments : 0 ,
            userLike : 0 ,
            likesArray : 0 ,
            authorDetails : 0 ,
            isDeleted : 0 ,
            userBookmark : 0 ,
          }}
        ] ,
        as : 'postDetails'
      }
    } ,
    { $unwind: { path: '$postDetails', preserveNullAndEmptyArrays: false } } ,
    {$project : {
      filteredPost : 0 ,
    }}
  ]) ;
  
  return posts ;
}
const fetchPeople = async(req ,res , skip) => {
  const cutoff = new Date(Date.now() - 6 * 24 * 3600 * 1000) ;
  const userId = req.user._id ;

  const results = await Following.aggregate([
    {$match : {
      createdAt : { $gte : cutoff } , 
    }} ,
    {$group : {
        _id : '$followedTo' ,
        followerCount : { $sum : 1 } ,
    }} ,
    {$sort : {
      followerCount : -1
    }} ,
    { $skip : skip} ,
    { $limit : 10} ,
    {$lookup : {
      from : 'users' ,
      let :  {userId : '$_id'} ,
      pipeline : [
        {$match : {
          $expr : {
            $eq : ['$_id' , '$$userId']
          }
        }} ,
        // isFollowing Stasus
        {$lookup : {
          from : 'followings' ,
          let : {personId : '$_id'} ,
          pipeline : [
            {$match : {
              $expr : {
                $eq : ['$followedBy' , new ObjectId(`${userId}`) ] , 
                $eq : ['$followedTo' , '$$personId']
              }}
            } ,
            { $project: { _id: 0, followedTo: 1 } }  
          ] ,
          as : 'IsFollowing' ,
        }} ,
        //following count
        {$lookup : {
          from : 'followings' ,
          localField : '_id' ,
          foreignField : 'followedTo' ,
          as : "followingCount"
        }} ,
        {$addFields : {
          isFollowing : {$gt : [{$size : '$IsFollowing'} , 0 ]} ,
          followers : {$size : '$followingCount'} ,
        }} ,
        {$project : {
          avatar : 1 ,
          username : 1 ,
          fullname : 1 ,
          bio : 1 ,
          isFollowing : 1 ,
          followers : 1 ,
          followers : 1 ,
        }}
      ] ,
      as : 'userDetails' ,
    }} ,
    {$unwind : { path : '$userDetails' , preserveNullAndEmptyArrays : false}}
  ]) ;
    
    return results ;
}

const increasePostViews = TryCatch (async(req , res) => {
  const {id} = req.params ;
  if(!ObjectId.isValid(id)) return ResError(res , 400 , 'Invalid post id.')
  const post = await Post.findByIdAndUpdate(id , {$inc : {views : 1}}) ;

  if(!post) return ResError(res , 404 , 'Post not found')
  return ResSuccess(res ,200 , null)

} , 'increasePostViews' )

export {
  createPost ,
  deletePost ,
  editPost ,
  getPost ,
  getUserPosts ,
  toggleOnPost ,

  fetchFeedPost ,
  fetchExplorePost ,

  increasePostViews ,
}