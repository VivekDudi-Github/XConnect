import {ResError , ResSuccess , TryCatch} from '../utils/extra.js'
import {User} from '../models/user.model.js'
import {LiveStream} from '../models/liveStream.model.js'
import { uploadFilesTOCloudinary } from '../utils/cloudinary.js';
import { LiveChat } from '../models/liveChats.model.js';


const createLiveStream = TryCatch(async (req , res) => {
    const {videoProducerId , audioProducerId} = req.body ;
    const {title , description } = req.body ;
    const {media} = req.files ;

    req.CreateMediaForDelete = [media[0]] ;

  if(!title || !description || !thumbnail  ) return ResError(res , 400 , 'All fields are required') ;

    const user = await User.findOne({username : req.user.host}) ;
    if(!user) return ResError('User not found' , 404 , res) ;
    
    if(!host || host != user.username) return ResError(res , 400 , 'Host is required and should be the same as the logged in user') ;

    if(!videoProducerId || !videoConsumerId) return ResError(res , 400 , 'Video producer and consumer ids are required') ;

    let res = [] ;
    if(media && media.length > 0){
      res = await uploadFilesTOCloudinary(media)
    }


    const liveStream = new LiveStream({
        title ,
        description ,
        thumbnail : {
          public_id : res[0].public_id ,
          url : res[0].url ,
        } ,
        host : req.user._id ,
        startedAt : Date.now() ,
        endedAt : Date.now() ,
        producers : {
            videoId : videoProducerId ,
            audioId : audioProducerId ,
        }
    })

    await liveStream.save()
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

    const liveStream = await LiveStream.findOne({_id : id}) ;
    if(!liveStream) return ResError(res , 404 , 'Live stream not found')
    if(liveStream.host != req.user._id) return ResError(res , 403 , 'You are not the host of this live stream')

    const {title , description  , startedAt , endedAt} = req.body ;

    if (title !== undefined) liveStream.title = title;
    if (description !== undefined) liveStream.description = description;
    if (startedAt !== undefined) liveStream.startedAt = startedAt;
    if (endedAt !== undefined) liveStream.endedAt = endedAt;

    await liveStream.save();

    return ResSuccess(res , 200 , 'Live stream updated successfully')
})

const getLiveStream = TryCatch(async (req , res) => {
    const {id} = req.params ;

    const liveStream = await LiveStream.findOne({_id : id}) ;
    if(!liveStream) return ResError(res , 404 , 'Live stream not found')
    if(liveStream.host != req.user._id) return ResError(res , 403 , 'You are not the host of this live stream')

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