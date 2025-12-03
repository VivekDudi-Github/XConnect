import { Advertisement } from '../models/advertisement.model.js';
import { Post } from '../models/post.model.js';
import {TryCatch , ResError , ResSuccess} from '../utils/extra.js'
import {isValidObjectId} from 'mongoose';

const createAdCampaign = TryCatch(async(req , res) => {
  const {posts = [], banner = [] , comments = [] , price , tags = [] , start_date} = req.body ;

  if( Array.isArray(banner) && banner?.length){
    banner.filter(id => isValidObjectId(id) )
  }
  if( Array.isArray(posts) && posts?.length){
    posts.filter(id => isValidObjectId(id) )
  }
  if( Array.isArray(comments) && comments?.length){
    comments.filter(id => isValidObjectId(id) )
  }

  if(!comments?.length && !posts?.length && !banner?.length ) return ResError(res , 400 , 'There is no conent for the advertisement.')

  let doc = new Advertisement({price}) ;
  if(posts?.length) doc.posts = posts ;
  if(banner?.length) doc.banner = banner ;
  if(comments?.length) doc.comments = comments ;
  doc.start_date = start_date ? start_date : Date.now() ;
  
  if( Array.isArray(comments) && tags?.length){
    doc.tags = tags.slice(0 , 10) ;
  }else {
    doc.noTags = true ;
  }

  return ResSuccess(res , 200 , `Your Campaign is ${start_date ? 'scheduled' : 'running'}.`)
} , 'createAdCampaign')



const toggleAdvertisment = async(req , res) => {
  const {id , ad_Id , change} = req.params ;
  if(!ObjectId.isValid(id) || !ObjectId.isValid(ad_Id)) return ResError(res , 400 , 'Invalid post id.') ;
  
  const ad = await Advertisement.findById({_id : ad_Id}).select('creator') ;
  if(!ad) return ResError(res , 400 , 'Invalid ad id.') ;

  if(ad.creator.toString() !== req.user._id.toString()) return ResError(res , 403 , 'You are not authorized to edit this post.') ;

  const post = await Post.findByIdAndUpdate(id , {$set : {isAdvertisment : true}}) ;
  
  if(!post) return ResError(res , 404 , 'Post not found') ;
}

export {createAdCampaign}