import mongoose from 'mongoose';
import {TryCatch , ResError , ResSuccess} from '../utils/extra.js'

import { Message } from '../models/messages.model.js'
import { Room } from '../models/Room.model.js';
import { deleteFilesFromCloudinary, uploadFilesTOCloudinary } from '../utils/cloudinary.js';



const createMessage = TryCatch(async (req , res) => {
  req.CreateMediaForDelete = [] ;
  const {room , message } = req.body ;
  const {media} = req.files ;

  if(media) media.forEach(file => req.CreateMediaForDelete.push(file)) ;

  const IsRoom = await Room.findById(room) ;
  if(!IsRoom) return ResError(res , 404 ,'Room not found' )

  if(media && media.length > 0){
    cloudinaryResults = await uploadFilesTOCloudinary(media)
  }

  const messageObj = await Message.create({
    from : req.user._id ,
    room : room ,
    attachments : cloudinaryResults || [] ,
    message : message ,
  })

  return ResSuccess(res , 200 ,'Message created successfully')

} , 'createMessage')

const getMessages = TryCatch(async (req , res) => {
  const {room , page , limit} = req.query ;

  const IsRoom = await Room.findById(room) ;
  if(!IsRoom) return ResError(res , 404 , 'Room not found' )

  const messages = await Message.find({room : room})
    .sort({createdAt : -1})
    .skip(limit * (page - 1))
    .limit(limit)
    .populate('from' , 'fullname avatar username')

  return ResSuccess( res , 200 , messages)
} , 'getMessages')

const deleteMessage = TryCatch(async (req , res) => {
  const {id} = req.params ;

  const message = await Message.findById(id) ;
  if(!message) return ResError(res , 404 , 'Message not found')
  if(!message.from.equals(req.user._id)) return ResError(res , 403 , 'You are not the owner of this message' ) 
  
  if(message.attachment.length > 0){
    await deleteFilesFromCloudinary(message.attachment)
  }

  message.isDeleted = true ;
  message.message = 'this message was deleted by sender' ;
  await message.save() ;
  return ResSuccess(  res , 200 ,  'Message deleted successfully')
} , 'deleteMessage')



export {
  createMessage ,
  getMessages ,
  deleteMessage
}