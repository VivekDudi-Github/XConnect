import { Community } from "../models/community.model";
import { deleteFilesFromCloudinary, uploadFilesTOCloudinary } from "../utils/cloudinary";
import { ResSuccess, TryCatch } from "../utils/extra";


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
  
} , 'GetCommunityPosts')

const GetCommunityFollowers = TryCatch(async(req , res) => {
  
} , 'GetCommunityFollowers')

const GetCommunityFollowing = TryCatch(async(req , res) => {
  
} , 'GetCommunityFollowing')

const GetCommunityAdmins = TryCatch(async(req , res) => {
  
} , 'GetCommunityAdmins')

const GetCommunityMembers = TryCatch(async(req , res) => {
  
} , 'GetCommunityMembers')

export {
  CreateCommunity ,
  GetCommunity ,
  GetCommunities ,
  GetCommunityPosts ,
  GetCommunityFollowers ,
  GetCommunityFollowing ,
  GetCommunityAdmins ,
  GetCommunityMembers ,
}