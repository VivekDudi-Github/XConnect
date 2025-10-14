import {ResError , ResSuccess , TryCatch} from '../utils/extra.js'
import {User} from '../models/user.model.js'
import {LiveStream} from '../models/liveStream.model.js'
import { uploadFilesTOCloudinary } from '../utils/cloudinary.js';
import { LiveChat } from '../models/liveChats.model.js';

let map = new Map() ;

const createLiveStream = TryCatch(async (req , res) => {
    const {videoProducerId , audioProducerId} = req.body ;
    const {title , description } = req.body ;
    const {media} = req.files ;

    if(media) req.CreateMediaForDelete = [media?.[0]] ;

  if(!title || !description ) return ResError(res , 400 , 'All fields are required') ;
    console.log(media , 'media');
    
    const user = await User.findOne({_id : req.user._id}) ;
    if(!user) return ResError(res , 400 ,'User not found' ) ;
    
    // if(!videoProducerId || !videoConsumerId) return ResError(res , 400 , 'Video producer and consumer ids are required') ;

    let results = [] ;
    // if(media && media.length > 0){
    //   results = await uploadFilesTOCloudinary(media)
    // }

    const liveStream = {
        _id : '68ee77506ffc2b3a7b4f17c5' ,
        title ,
        description ,
        host : req.user._id ,
        startedAt : Date.now() ,
        endedAt : Date.now() ,
        producers : {} ,
    }

    if(results.length > 0) liveStream.thumbnail = {
      public_id : results[0].public_id ,
      url : results[0].url ,
    }
    if(videoProducerId) liveStream.producers.videoId = videoProducerId ;
    if(audioProducerId) liveStream.producers.audioId = audioProducerId ;
    
    map.set(liveStream._id.toString() , liveStream) ;
    // await liveStream.save() ;
    return ResSuccess(res , 201 , liveStream)
})

const deleteLiveStream = TryCatch(async (req , res) => {
    const {id} = req.params

    const liveStream = await LiveStream.findOne({_id : id}) ;
    if(!liveStream) return ResError(res , 404 , 'Live stream not found') ;
    if(liveStream.host != req.user.username) return ResError(res , 403 , 'You are not the host of this live stream') ;

    await LiveChat.deleteMany({roomId : id}) ;

    await liveStream.delete() ;
    return ResSuccess(res , 200 , 'Live stream deleted successfully')
})

const updateLiveStream = TryCatch(async (req , res) => {
    const {id} = req.params

    // const liveStream = await LiveStream.findOne({_id : id}) ;
    const liveStream = map.get(id) ;
    if(!liveStream) return ResError(res , 404 , 'Live stream not found')
    if(liveStream.host != req.user._id) return ResError(res , 403 , 'You are not the host of this live stream')

    const {title , description  , startedAt , endedAt , videoId , audioId} = req.body ;

    if (title !== undefined) liveStream.title = title;
    if (description !== undefined) liveStream.description = description;
    if (startedAt !== undefined) liveStream.startedAt = startedAt;
    if (endedAt !== undefined) liveStream.endedAt = endedAt;
    if (videoId !== undefined) liveStream.producers.videoId = videoId;
    if (audioId !== undefined) liveStream.producers.audioId = audioId;

    // await liveStream.save();
    console.log(map);
    
    return ResSuccess(res , 200 , 'Live stream updated successfully')
})

const getLiveStream = TryCatch(async (req , res) => {
    const {id} = req.params ;

    // const liveStream = await LiveStream.findOne({_id : id}) ;
    const liveStream = map.get(id) ;
    if(!liveStream) return ResError(res , 404 , 'Live stream not found')

    return ResSuccess(res , 200 , liveStream) ;
})

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
})

const getLiveChats = TryCatch(async (req , res) => {
    const {id} = req.params ;
    const {page = 1 , limit = 10} = req.query ;

    let skip = (page - 1) * limit ;

    const liveStream = await LiveStream.findOne({_id : id})
    if(!liveStream) return ResError(res  ,404 , 'Live stream not found')

    const liveChats = await LiveChat.find({roomId : id})
    .sort({createdAt : -1})
    .skip(skip)
    .limit(limit)
    .populate('sender' , 'name username avatar')
 
    return ResSuccess(res , 200 , liveChats )
})

export {
    createLiveStream ,
    deleteLiveStream ,
    updateLiveStream ,
    getLiveStream ,
    getUserLiveStreams ,
    getLiveChats
}