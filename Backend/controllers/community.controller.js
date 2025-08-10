import { Community } from "../models/community.model.js";
import { Following } from "../models/following.model.js";
import { Post } from "../models/post.model.js";
import { deleteFilesFromCloudinary, uploadFilesTOCloudinary } from "../utils/cloudinary.js";
import { ResSuccess, TryCatch } from "../utils/extra.js";


const CreateCommunity = TryCatch(async(req , res) => {
  req.CreateMediaForDelete = [] ;

  const {name , descriptopn , rules , tags} = req.body ;
  const {avatar , banner} = req.files ;

  if(!name || typeof name !== 'string') return ResError(res , 400 , 'Name is required.') ;
  if(!descriptopn || typeof descriptopn !== 'string') return ResError(res , 400 , 'Description is required.') ;

  if(!rules || typeof rules !== 'array') return ResError(res , 400 , 'Rules is required.')
  if(!tags || typeof tags !== 'array') return ResError(res , 400 , 'Tags is required.')

  if(avatar && banner){
    avatar = uploadFilesTOCloudinary([avatar]) ;
    banner = uploadFilesTOCloudinary([banner]) ;
  }

  const community = await Community.create({
    name ,
    descriptopn ,
    rules ,
    tags ,
    avatar ,
    banner ,
    creator : req.user._id ,
  })
  if(!community) {
    deleteFilesFromCloudinary([avatar , banner])
    return ResError(res , 500 , 'Community could not be created.')
  }

  return ResSuccess(res , 200 , 'Community created successfully.')

} , 'CreateCommunity')

const GetCommunity = TryCatch(async(req , res) => {
  const _id = req.params.id ;

  if(!_id) return ResError(res , 400 , 'Community ID is required.')

    const community = await Community.findById(_id).populate('admins' , 'avatar fullname username') ;

    if(!community) return ResError(res , 404 , 'Community not found.')

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

  const posts = await Post
    .find({
      community : id ,
      isDeleted : false
    })
    .populate('author' , 'avatar username')
    .sort({createdAt : -1})
    .skip(skip)
    .limit(limit)
    .lean();
  
    return ResSuccess(res , 200  , posts) ;

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

export {
  CreateCommunity ,
  GetCommunity ,
  GetCommunities ,
  GetCommunityPosts ,
  GetCommunityFollowers ,
  getFollowingCommunities
}