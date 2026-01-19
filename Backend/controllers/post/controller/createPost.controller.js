import {ResError , ResSuccess ,TryCatch} from '../../../utils/extra.js';
import { createPostService } from '../services/createPost.services.js';
import { validateCreatePost } from '../vadilator/createPost.validator.js';

export const createPost = TryCatch(async (req, res) => {
  req.CreateMediaForDelete = [];

  const media = req.files?.media || [];
  media.forEach(file => req.CreateMediaForDelete.push(file));

  const valid = await validateCreatePost(req, res);
  if (!valid) return;

  const post = await createPostService({
    user: req.user,
    body: req.body,
    files: req.files,
  });

  if (!post) return ResError(res, 500, 'Post could not be created.');

  ResSuccess(res, 200, post);
}, 'CreatePost');


// const createPost = TryCatch( async(req , res) => {
//   req.CreateMediaForDelete = [] ;
//   const {content , hashtags = [] , title , community  , isCommunityPost = false,  repost , mentions= [] , scheduledAt , category ,isAnonymous , videoIds } = req.body ;
  
  

//   await createPostService() ;

//   const {media} = req.files ;
//   if(media) media.forEach(file => req.CreateMediaForDelete.push(file)) ;
  
//   if(content && typeof content !== 'string' ) return ResError(res , 400 , 'There should be some text for context.') ;  

//   if( media && !Array.isArray(media)) return ResError(res , 400 , "Media's data is invalid.") ;
//   if(!Array.isArray(hashtags)) return ResError(res , 400 , "Hastags' data is invalid.") ;
//   if(!Array.isArray(mentions)) return ResError(res , 400 , "Mentions' data is invalid.") ;

//   if(scheduledAt && !moment(scheduledAt).isValid()) return ResError(res , 400 , 'Invalid scheduled date.') ;
//   if(new Date(scheduledAt).getTime() < new Date().getTime()) return ResError(res , 400 , 'Past dates are not allowed.') ;

//   if(repost && !ObjectId.isValid(repost)) return ResError(res , 400 , "Repost's data is invalid.") ;  

//   if(isCommunityPost){
//     if(category && typeof category !== 'string') return ResError(res , 400 , 'Category is required.') ;
//     if([ 'general' , 'question' , 'feedback' , 'showcase'].includes(category) === false) return ResError(res , 400 , 'Invalid category.') ; 
//     if(!title || typeof title !== 'string') return ResError(res , 400 , 'Title is required.') ;
//     if(!category || typeof category !== 'string') return ResError(res , 400 , 'Category is required.') ;
//     if(!ObjectId.isValid(community)) return ResError(res , 400 , 'Invalid community id.') ;
//     const IsCommunityExist = await Community.exists({_id : community}) ;
//     if(!IsCommunityExist) return ResError(res , 400 , 'Invalid community id.') ;
//   }

//   let cloudinaryResults = [] ;  
//   if(media && media.length > 0) {
//     cloudinaryResults = await uploadFilesTOCloudinary(media) ;
//   }

//   let videos = [] ;
//   if(videoIds && videoIds?.length > 0){
//     for(let i = 0 ; i < videoIds.length ; i++){
//       const videoUpload = await VideoUpload.exists({public_id : videoIds[i] , user : req.user._id});
//       if(!videoUpload) continue ;
//       videos.push({
//         type : 'video' , 
//         url : `/${videoIds[i]}/hsl/master.m3u8` ,
//         public_id : videoIds[i] ,
//       })
//     }
//   }

//   const post = await Post.create({
//     author : req.user._id ,
//     content : content ,
//     media : [...cloudinaryResults , ...videos] || [] ,
//     hashtags : hashtags || [] ,
//     repost : repost || null ,
//     scheduledAt : scheduledAt ||  null ,
//     mentions : mentions || [] ,
//     community : isCommunityPost ? community : null ,
//     title : isCommunityPost ? title : null ,
//     isAnonymous : isAnonymous || false ,
//     category : category || null ,
//     type : isCommunityPost ? 'community' : 'post' ,
//   })

//   if(!post) return ResError(res , 500 , 'Post could not be created.')
    
//   ResSuccess(res , 200 , post)


//   if(mentions.length > 0){
//     const user = await User.find({username : {
//       $in : mentions
//     }}).select('_id')
  
//     const mentionsIds = user
//     .map(u => u._id.toString())
//     .filter(id => id !== req.user._id.toString()) ;
    
//     const ops = mentionsIds.map(mentionId => ({
//       insertOne: {
//         document: {
//           type: 'mention',
//           post: post._id,
//           sender: req.user._id,
//           receiver: mentionId,
//         }
//       }
//     }));
  
//     await Notification.bulkWrite(ops , { ordered : false})
    
//     mentionsIds.forEach(userId => {
//       emitEvent('notification:receive' , `user` , [`${userId}`] , {
//         type : 'mention' ,
//         post : post._id ,
//         sender : {
//           avatar : req.user.avatar ,
//           username : req.user.username ,
//           _id : req.user._id ,
//         } ,
//       })
//     })

//   }

//   if(hashtags.length){
//     const ops = hashtags.map(h => {
//       return {
//         updateOne: {
//           filter: { name: h },
//           update: { $inc: { count: 1 } },
//           upsert : true
//         }
//       }
//     })

//     await Hashtag.bulkWrite(ops)
//   }

//   return ;

// } , 'CreatePost' ) 
