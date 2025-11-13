import mongoose from "mongoose";
import { Community } from "../models/community.model.js";
import { Following } from "../models/following.model.js";
import { Post } from "../models/post.model.js";
import { deleteFilesFromCloudinary, uploadFilesTOCloudinary } from "../utils/cloudinary.js";
import { ResSuccess, TryCatch , ResError } from "../utils/extra.js";
import { Preferance } from "../models/prefrence.model.js";
import {io} from '../app.js'
import { emitEvent } from "../utils/socket.js";
import { Notification } from "../models/notifiaction.model.js";

const ObjectId = mongoose.Types.ObjectId ;

const CreateCommunity = TryCatch(async(req , res) => {
  req.CreateMediaForDelete = [] ;

  const {name , description , rules , tags} = req.body ;
  let {avatar , banner} = req.files ;
  

  if(!banner) return ResError(res , 400 , 'Banner is required.') ;
  if(!avatar) return ResError(res , 400 , 'Avatar is required.') ;

  if(!name || typeof name !== 'string') return ResError(res , 400 , 'Name is required.') ;
  

  if(!description || typeof description !== 'string') return ResError(res , 400 , 'Description is required.') ;

  if(!tags || Array.isArray(tags) === false) return ResError(res , 400 , 'Tags is required.')
  if(!rules || Array.isArray(rules) === false) return ResError(res , 400 , 'Rules is required.')


  if(avatar && banner  ){   
    avatar = await uploadFilesTOCloudinary(avatar) ;
    banner = await uploadFilesTOCloudinary(banner) ;
  }
  console.log(avatar , banner);
  
  const community = await Community.create({
    name ,
    description ,
    rules ,
    tags ,
    avatar : avatar[0] ,
    banner : banner[0] ,
    creator : req.user._id ,
  })
  if(!community) {
    deleteFilesFromCloudinary([avatar , banner])
    return ResError(res , 500 , 'Community could not be created.')
  }

  await Following.create({
    followingCommunity : community._id ,
    followedBy : req.user._id ,
  })

  return ResSuccess(res , 200 , 'Community created successfully.')

} , 'CreateCommunity')

const GetCommunity = TryCatch(async(req , res) => {
  const _id = req.params.id ;

  if(!_id) return ResError(res , 400 , 'Community ID is required.')

    const community = await Community.findById(_id).populate('admins' , 'avatar fullname username').lean() ;
    const isFollowing = await Following.exists({
      followedBy : req.user._id ,
      followingCommunity : _id
    })
    const totalCommunityFollowers = await Following.countDocuments({
      followingCommunity : _id ,
    }) ;
    if(!community) return ResError(res , 404 , 'Community not found.')

    community.isFollowing = isFollowing ;
    community.totalFollowers = totalCommunityFollowers ;
    return ResSuccess(res , 200 , community)

} , 'GetCommunity')

const GetCommunities = TryCatch(async(req , res) => {
  
} , 'GetCommunities')

const GetCommunityPosts = TryCatch(async(req , res) => {
  const id = req.params.id ;
  const {page = 1 , limit = 10} = req.query ;
  
  const skip = (page - 1) * limit ;

  if(isNaN(skip) || isNaN(limit)) return ResError(res , 400 , 'Invalid page or limit.') ;
  if(skip < 0 || limit <= 0) return ResError(res , 400 , 'Page and limit must be positive numbers.') ;

  if(!id) return ResError(res , 400 , 'Community ID is required.') ;

  const totalPages = await Post.countDocuments({community : id , isDeleted : false}) ;

  const posts = await Post
    .find({
      community : id ,
      isDeleted : false
    })
    .populate('author' , 'avatar username')
    .populate('community' , 'name avatar')
    .sort({createdAt : -1})
    .skip(skip)
    .limit(limit)
    .lean();
  
    return ResSuccess(res , 200  ,{posts , totalPages}) ;

} , 'GetCommunityPosts')

const GetCommunityFollowers = TryCatch(async(req , res) => {
  
} , 'GetCommunityFollowers')

const getFollowingCommunities = TryCatch( async(req , res) => {
  const followings = await Following.find({
    followedBy : req.user._id ,
    followingCommunity : { $exists: true }
  }).select('followingCommunity').populate('followingCommunity' , 'name avatar').lean();

  const communities = followings.map(following => following.followingCommunity) ;
  
  return ResSuccess(res , 200 , communities) ;
} , 'GetFollowingCommunities')

const communityFeed = TryCatch( async(req , res) => {
  const userId = req.user._id ;

  const {page = 1 , limit = 10} = req.query ;
  const skip = (page - 1) * Number(limit) ;
  
  const tags = await Preferance.find({user : userId }).select(' hashtags -_id') ;  
  const hashtags = tags.map(t => t.hashtags ) ;

  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 4);



  const posts = await Post.aggregate([
    // lookuo ffor the following communities
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

      //match posts
      {$match : {
          $expr : {
            $and : [
              // {$gte: ['$createdAt', threeDaysAgo] } ,
              {$eq : ['$isDeleted' , false]} ,
              {$eq : ['$type' , 'community']} ,
              // {$in : ['$community', '$communityFollowIds'] },
              {$or : [
                { $gte: ['$createdAt', threeDaysAgo] },
                { $in: ['$author', '$userFollowIds'] },
                { $in: ['$hashtags', hashtags] }
              ]}
            ]
          }
        }
      } ,
      // {$skip : skip} ,
      
      //random sample 9350872
      {$sample : { size : Number(limit)}} ,
  
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
            username : 1 ,
          }}
        ] ,
        as : 'authorDetails'
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
  
      {$addFields : {
        author : {$cond : {
          if : { $eq : ['$isAnonymous' , true] } ,
          then : 'Anonymous' ,
          else : '$authorDetails' ,
        }} ,
        likeStatus : { $gt : [{ $size : '$userLike'} , 0 ]}  ,
        likeCount : {$size : '$totalLike'} ,
        commentCount : {$size : '$totalComments'} ,
        community : {$arrayElemAt : ['$communityDetails.name' , 0]} ,
        communityId : {$arrayElemAt : ['$communityDetails._id' , 0]} ,
      }} ,
  
      {$unwind: {path: '$author',preserveNullAndEmptyArrays: true} } ,
      
      {$project : {
        authorDetails : 0 ,
        totalLike : 0 ,
        userLike : 0 ,
        communityFollowIds : 0 ,
        userFollowIds : 0 ,
        UsersFollowing : 0 ,
        communityDetails : 0 ,
        isDeleted : 0 ,
      }}
  
    ])

  return ResSuccess(res , 200 , posts) 
    
} , 'CommunityFeed')

const followCommunity = TryCatch(async(req , res) => {
  const {id} = req.params ;

  if(!id) return ResError(res , 400 , 'Community ID is required')

  const communityAuthor = await Community.findById(id).select('creator')

  if(communityAuthor.creator.equals(req.user._id)) return ResError(res , 400 , 'You cannot unfollow your own community.') ;

  const isExistFollowing = await Following.exists({followingCommunity : id , followedBy : req.user._id})
  if(isExistFollowing){
    await Following.findOneAndDelete({followingCommunity : id , followedBy : req.user._id})
    return ResSuccess(res , 200 , {operation : false} )
  } else {
    await Following.create({
      followingCommunity : id ,
      followedBy : req.user._id ,
    })
    return ResSuccess(res , 200 , {operation : true} )
  }

} , 'followCommiunity')

const updateCommunity = TryCatch( async(req , res) => {
    req.CreateMediaForDelete = [] ;

    const {name , description , rules , tags} = req.body ;
    const {id} = req.params ;
    const {banner , avatar} = req.files ;
  console.log(rules);
  
    if(banner) req.CreateMediaForDelete.push(banner) ;
    if(avatar) req.CreateMediaForDelete.push(avatar) ;

    if(!name && !description && !rules && !tags && !banner && !avatar) return ResError(res , 400 , 'Atleast provide a field to be changed')

    if ( name && (name.length < 3 || name.length > 20)) return ResError(res , 400 , "name must be between 3 and 20 characters long") ;
    if( description && typeof description !== 'string' ) return ResError(res , 400 , "invalid description type") ;  

    if(tags && Array.isArray(tags) === false) return ResError(res , 400 , 'Tags is required')
    if(rules && Array.isArray(rules) === false) return ResError(res , 400 , 'Rules is required')

    const existingCommuntiy = await Community.findById(id) ;

    if(!existingCommuntiy) return ResError(res , 400 , 'Invalid community id')


    let avatarResults ;
    if(avatar) {
        avatarResults = await uploadFilesTOCloudinary(avatar) ;
        if (avatarResults?.length) {
          await deleteFilesFromCloudinary([existingCommuntiy.avatar]);
        }
    }
 
    let bannerResults  ;
    if(banner) {
        bannerResults =  await uploadFilesTOCloudinary(banner) ;
        if (bannerResults?.length) {
          await deleteFilesFromCloudinary([existingCommuntiy.banner]);
        }
    }

    existingCommuntiy.name = name || existingCommuntiy.name ;
    existingCommuntiy.description = description || existingCommuntiy.description ;
    existingCommuntiy.rules = rules || existingCommuntiy.rules ;
    existingCommuntiy.tags = tags || existingCommuntiy.tags ;
    existingCommuntiy.avatar = avatarResults ? avatarResults[0] : existingCommuntiy.avatar ;
    existingCommuntiy.banner = bannerResults ? bannerResults[0] : existingCommuntiy.banner ;
    await existingCommuntiy.save(); 

    return ResSuccess(res , 200 , 'Community updated successfully')

} , 'updateCommunity')

const inviteMods = TryCatch( async(req, res) => {
  const {mods = [] , communityId  } = req.body ;

  if(mods?.length === 0) return ResError(res , 400 , 'No moderators to invite.') ;

  const community = await Community.findById(communityId) ;
  if(!community) return ResError(res , 400 , 'Invalid community ID.') ;
  if(!community.creator.equals(req.user._id) ) return ResError(res , 403 , 'Only community creator can invite moderators.') ;

  const notifs = await Notification.insertMany(
    mods.map(modId => {
      if(community.admins.includes(modId)) return null ;  
      return ({
        receiver : modId ,
        sender : req.user._id ,
        type : 'modInvite' ,
        community : {
          _id : community._id ,
          name : community.name ,
        } ,
        createdAt : new Date() ,
      })})
  ) ;
  
  ResSuccess(res , 200 , 'Moderators invited successfully.') ;
  notifs.forEach( notif => {
    emitEvent(
    'notification:receive' ,
    'user' , 
    [notif.receiver.toString()] ,
     {...notif._doc , sender : {
      _id : req.user._id ,
      username : req.user.username ,
      avatar : req.user.avatar ,
     }}
    )
  })
  
} , 'inviteMods')

const getCommunityIsInvited = TryCatch( async(req , res) => { 
  const {id} = req.params ;
  
  const userId = req.user._id ;
  
  if(!id) return ResError(res , 400 , 'Community ID is required') ;

  const community = await Community.findById(id).select('creator') ;

  if(!community) return ResError(res , 400 , 'Invalid community ID') ;

  const notification = await Notification.findOne({
    receiver : userId ,
    sender : community.creator ,
    type : 'modInvite' ,
    'community._id' : community._id ,
  })

  if(!notification) return ResError(res , 404 , 'there was no invite found') ;
  
  return ResSuccess(res , 200 , {isInvited : true}) ;

} , 'getCommunityIsInvited')

const toggleJoinMod = TryCatch( async(req , res) => {
  const {id} = req.params ;
  
  const isExisitMod = await Community.findById(id).select('admins creator') ;
  if(!isExisitMod) return ResError(res , 404 , 'Invalid community ID') ;

  if(isExisitMod.admins.includes(req.user._id)){
    isExisitMod.admins.pull(req.user._id) ;
    await isExisitMod.save() ;
    let notif = await Notification.create({
      sender : req.user._id ,
      receiver : isExisitMod.creator ,
      type : 'modLeft' ,
      'community._id' : isExisitMod._id ,
    })
    emitEvent('notification:recieve' , 'user' , [isExisitMod.creator] , notif)
    return ResSuccess(res , 200 , {operation : false}) ;
  }else {
    const notif = await Notification.findOne({
      sender : isExisitMod.creator ,
      receiver : req.user._id ,
      type : 'modInvite' ,
      'community._id' : isExisitMod._id ,
    }) ;

    if(!notif) return ResError(res , 400 , 'You are not invited as moderator') ;
    isExisitMod.admins.push(req.user._id) ;
    await isExisitMod.save() ;
    await notif.deleteOne() ;
    return ResSuccess(res , 200 , {operation : true}) ;
  }
} , 'toggleJoinMod')
//accept or reject
//fetch isInvited mod


export {
  CreateCommunity ,
  GetCommunity ,
  GetCommunities ,
  GetCommunityPosts ,
  GetCommunityFollowers ,
  getFollowingCommunities ,
  
  communityFeed ,
  followCommunity ,
  updateCommunity ,
  
  inviteMods ,
  getCommunityIsInvited ,
  toggleJoinMod ,
}