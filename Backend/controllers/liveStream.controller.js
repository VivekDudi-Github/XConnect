import {ResError , ResSuccess , TryCatch} from '../utils/extra.js'
import {User} from '../models/user.model.js'
import {LiveStream} from '../models/liveStream.model.js'
import { uploadFilesTOCloudinary } from '../utils/cloudinary.js';
import { LiveChat } from '../models/liveChats.model.js';
import mongoose from 'mongoose';
import { Following } from '../models/following.model.js';
import {io} from '../app.js'


let ObjectId = mongoose.Types.ObjectId ;

const createLiveStream = TryCatch(async (req , res) => {
    const {videoProducerId , audioProducerId} = req.body ;
    const {title , description } = req.body ;
    const {media} = req.files ;

    if(media) req.CreateMediaForDelete = [media?.[0]] ;

  if(!title || !description ) return ResError(res , 400 , 'All fields are required') ;
    
    const user = await User.findOne({_id : req.user._id}) ;
    if(!user) return ResError(res , 400 ,'User not found' ) ;
    
    // if(!videoProducerId || !videoConsumerId) return ResError(res , 400 , 'Video producer and consumer ids are required') ;

    let results = [] ;
    // if(media && media.length > 0){
    //   results = await uploadFilesTOCloudinary(media)
    // }

    const liveStream = new LiveStream({
        title ,
        description ,
        host : req.user._id ,
        hostName : req.user.username ,
        startedAt : Date.now() ,
        endedAt : Date.now() ,
        producers : {} ,
        isLive : false ,
    })

    if(results.length > 0) liveStream.thumbnail = {
      public_id : results[0].public_id ,
      url : results[0].url ,
    }
    if(videoProducerId) liveStream.producers.videoId = videoProducerId ;
    if(audioProducerId) liveStream.producers.audioId = audioProducerId ;
    
    await liveStream.save() ;
    return ResSuccess(res , 201 , liveStream)
} , 'createLiveStream')

const deleteLiveStream = TryCatch(async (req , res) => {
    const {id} = req.params

    const liveStream = await LiveStream.findOne({_id : id}) ;
    if(!liveStream) return ResError(res , 404 , 'Live stream not found') ;
    if(liveStream.host != req.user.username) return ResError(res , 403 , 'You are not the host of this live stream') ;

    await LiveChat.deleteMany({roomId : id}) ;

    await liveStream.delete() ;
    return ResSuccess(res , 200 , 'Live stream deleted successfully')
} , 'deleteLiveStream')

const updateLiveStream = TryCatch(async (req , res) => {
    const {id} = req.params;
    const liveStream = await LiveStream.findOne({_id : id}) ;
    
    if(!liveStream) return ResError(res , 404 , 'Live stream not found')
    if(liveStream.host != req.user._id) return ResError(res , 403 , 'You are not the host of this live stream')

    const {title , description  , startedAt , endedAt , videoId , audioId} = req.body ;

    if (title !== undefined) liveStream.title = title;
    if (description !== undefined) liveStream.description = description;
    if (startedAt !== undefined) liveStream.startedAt = startedAt;
    if (endedAt !== undefined) liveStream.endedAt = endedAt;
    if (videoId !== undefined) liveStream.producers.videoId = videoId;
    if (audioId !== undefined) liveStream.producers.audioId = audioId;

    io.to(`liveStream:${liveStream._id}`).emit('RECEIVE_LIVE_STREAM_DATA' , liveStream) ;
    await liveStream.save();
    
    return ResSuccess(res , 200 , 'Live stream updated successfully')
} , 'updateLiveStream')

const getLiveStream = TryCatch(async (req , res) => {
    const {id} = req.params ;
    console.log(id, 'line:91');
    
    if(!ObjectId.isValid(id)) return ResError(res , 400 , 'Invalid id') ;
    const liveStream = await LiveStream.findOne({_id : id}).populate('host' , 'username avatar name') ; 

    const followers = await Following.countDocuments({followedTo : liveStream?.host}) ; 
    const isFollowing = await Following.findOne({followedBy : req.user._id , followedTo : liveStream?.host}) ;

    console.log(followers);
    
    if(!liveStream) return ResError(res , 404 , 'Live stream not found') ;
    return ResSuccess(res , 200 , {...liveStream._doc , isFollowing , followers}) ;
} , 'getLiveStream')

const getUserLiveStreams = TryCatch(async (req , res) => {
  const {id} = req.params ;

    const {page = 1 , limit = 10} = req.query ;
    let skip = (page - 1) * limit ;

    const liveStreams = await LiveStream.find({host : id})
    .skip(skip) 
    .limit(limit)
    .populate('host' , 'avatar username')
    .sort({createdAt : -1})

    return ResSuccess(res , 200, liveStreams  ) ;
} , 'getLiveStreams')

const getLiveChats = TryCatch(async (req , res) => {
    const {id} = req.params ;
    const {limit = 10 , lastId } = req.query ;
    console.log(id , limit , lastId);
    
    let filter = {
        roomId : id ,
    }
    
    if(ObjectId.isValid(lastId)){
        filter._id =  { $lt: new ObjectId(`${lastId}`) } ;
    }

    const liveStream = await LiveStream.findOne({_id : id})
    if(!liveStream) return ResError(res  ,404 , 'Live stream not found') ;


    const liveChats = await LiveChat.find(filter)
    .sort({_id : -1})
    .limit(limit)
    .populate('sender' , 'name username avatar')
 
    return ResSuccess(res , 200 , {messages : liveChats.reverse()} )
} , 'getLiveChats')

export {
    createLiveStream ,
    deleteLiveStream ,
    updateLiveStream ,
    getLiveStream ,
    getUserLiveStreams ,
    getLiveChat
}