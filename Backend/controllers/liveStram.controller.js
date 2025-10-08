import {ResError , ResSuccess , TryCatch} from '../utils/extra.js'
import {User} from '../models/user.model.js'
import {LiveStream} from '../models/liveStream.model.js'
import { uploadFilesTOCloudinary } from '../utils/cloudinary.js';
// import {liveChat} from '../models/liveChats.model.js'

// create live stream 
// delete , update live
// get the list of live streams
// get the list of live chats
// 

const createLiveStream = TryCatch(async (req , res) => {
    const {videoProducerId , videoConsumerId} = req.body ;
    const {title , description } = req.body ;
    const {media} = req.files ;

    req.CreateMediaForDelete = [media[0]] ;

  if(!title || !description || !thumbnail  ) return ResError('All fields are required' , 400 , res) ;

    const user = await User.findOne({username : req.user.host}) ;
    if(!user) return ResError('User not found' , 404 , res) ;
    
    if(!host || host != user.username) return ResError('Host is required and should be the same as the logged in user' , 400 , res) ;

    if(!videoProducerId || !videoConsumerId) return ResError('Video producer and consumer ids are required' , 400 , res) ;

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
            audioId : videoConsumerId ,
        }
    })

    await liveStream.save()
    return ResSuccess(liveStream , 201 , res)
})

const deleteLiveStream = TryCatch(async (req , res) => {
    const {id} = req.params

    const liveStream = await LiveStream.findOne({_id : id})
    if(!liveStream) return ResError('Live stream not found' , 404 , res)
    if(liveStream.host != req.user.username) return ResError('You are not the host of this live stream' , 403 , res)

    await liveStream.delete()
    return ResSuccess('Live stream deleted successfully' , 200 , res)
})

const updateLiveStream = TryCatch(async (req , res) => {
    const {id} = req.params

    const liveStream = await LiveStream.findOne({_id : id})
    if(!liveStream) return ResError('Live stream not found' , 404 , res)
    if(liveStream.host != req.user.username) return ResError('You are not the host of this live stream' , 403 , res)

    const {title , description  , startedAt , endedAt} = req.body


    await liveStream.updateOne({
        title ,
        description ,
        startedAt ,
        endedAt ,
    })

    return ResSuccess('Live stream updated successfully' , 200 , res)
})

const getLiveStream = TryCatch(async (req , res) => {
    const {id} = req.params
    const user = await User.findOne({username : req.user.username})
    if(!user) return ResError('User not found' , 404 , res)

    const liveStream = await LiveStream.findOne({_id : id})
    if(!liveStream) return ResError('Live stream not found' , 404 , res)
    if(liveStream.host != user.username) return ResError('You are not the host of this live stream' , 403 , res)

    return ResSuccess(liveStream , 200 , res)
})

const getLiveStreams = TryCatch(async (req , res) => {
  const {id} = req.params ;

    const liveStreams = await LiveStream.find({host : id})
    
    return ResSuccess(res , 200, liveStreams  )
})

const getLiveChats = TryCatch(async (req , res) => {
    const {id} = req.params ;

    const liveStream = await LiveStream.findOne({_id : id})
    if(!liveStream) return ResError(res  ,404 , 'Live stream not found')

    const liveChats = await liveStream.getLiveChats()
    return ResSuccess(res , 200 , liveChats )
})

export {
    createLiveStream ,
    deleteLiveStream ,
    updateLiveStream ,
    getLiveStream ,
    getLiveStreams ,
    getLiveChats
}