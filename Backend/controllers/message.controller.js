import mongoose from 'mongoose';
import {TryCatch , ResError , ResSuccess} from '../utils/extra.js'

import { Message } from '../models/messages.model.js'
import { User } from '../models/user.model.js'
import { Room } from '../models/Room.model.js';
import { deleteFilesFromCloudinary, uploadFilesTOCloudinary } from '../utils/cloudinary.js';


const ObjectId = mongoose.Types.ObjectId;

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

  const messageObj = new Message({
    from : req.user._id ,
    room : room ,
    attachments : cloudinaryResults || [] ,
    message : message ,
  })
  await messageObj.save() ;
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
    .populate('room' , )

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

const createRoom = TryCatch(async (req , res) => {
  const {name , description , type , members} = req.body ;

  if(!Array.isArray(members) || members.length === 0) return ResError(res , 400 , 'Invalid members')


  if(type !== 'group' && type !== 'one-on-one') return ResError(res , 400 , 'Invalid type')
  if( type === 'group' && (!name || !description)) return ResError(res , 400 , 'Invalid name or description')


  const validMemberIds = members.filter(id => (
    mongoose.isValidObjectId(id) && id.toString() !== req.user._id.toString() 
  )) ;

  if (type === 'one-on-one' && validMemberIds.length !== 1) {
    return ResError(res, 400, 'one-on-one room must have exactly one member');
  }
  
  if (type === 'group' && validMemberIds.length < 1) {
    return ResError(res, 400, 'Group must have at least one member besides the owner');
  }

  if(type === 'one-on-one'){
    const roomExists = await Room.findOne({
      type  : 'one-on-one' ,
      members : {
        $all : [...validMemberIds , req.user._id] , 
      } , 
    });
    if(roomExists && roomExists.members.length === 2) return ResError(res , 400 , roomExists)
  }

  const users = await User.find({_id : {$in : validMemberIds}}) ;
  const validUsers = users.map(user => user._id)
  
  let room ;
  if(type === 'one-on-one'){
    room = new Room({
      owner : req.user._id ,
      members : [...validUsers , req.user._id] ,
      type ,
    })
  }else{
    room = new Room({
      name ,
      description,
      owner : req.user._id ,
      members : [...validUsers , req.user._id] ,
      type ,
      admins : [req.user._id] ,
    })
  }


  await room.save() ;
  return ResSuccess( res , 200 , room)
} , 'createRoom')

const updateGroup = TryCatch(async (req , res) => {
  const {id , name , description , members  , removeMembers , promotions} = req.body ;

  if(!id) return ResError(res , 400 , 'Room ID is required.')

  if(!name && !description  && !members && !removeMembers && !promotions) return ResError(res , 400 , 'Atleast provide a field to be changed')

  
  const room = await Room.findById(id) ;
  if(!room) return ResError(res , 404 , 'Room not found')
  if(!room.owner.equals(req.user._id)) return ResError(res , 403 , 'You are not the owner of this room')
  
  if (name) room.name = name;
  if (description) room.description = description;
  
  
  let removeMembersIds = [] ;
  if(Array.isArray(removeMembers) && removeMembers.length > 0){
    removeMembersIds = removeMembers.filter(member => mongoose.isValidObjectId(member)) ;
    room.members =  room.members.filter(member => !removeMembersIds.some(id => member.equals(id))) ;
    room.admins = room.admins.filter(member => !removeMembersIds.some(id => member.equals(id))) ;
  }
  let validUsers = [] ;

  if(Array.isArray(promotions) && promotions.length > 0 && removeMembersIds.length === 0){
    let validMemberIds = promotions.filter(member => mongoose.isValidObjectId(member)) ;
    validMemberIds = validMemberIds.filter(id => room.members.some(member => member.equals(id)) ) ;
    validMemberIds = validMemberIds.filter(id => !room.admins.some(member => member.equals(id))) ;  
    room.admins = [...validMemberIds , ...room.admins] ;
  }

  if(Array.isArray(members) && members.length > 0 && removeMembersIds.length === 0){

    const validMemberIds = members.filter(member => mongoose.isValidObjectId(member)) ; 
    const users = await User.find({_id : {$in : validMemberIds}}) ;
    validUsers = users.map(user => user._id)
    validUsers = validUsers.filter(id => !room.members.some(member => member.equals(id))) ;  
  
    room.members = [...validUsers, ...room.members] ;

  }


  await room.save() ;     
  return ResSuccess( res , 200 , 'Room updated successfully')
} , 'updateGroup')

export {
  createMessage ,
  getMessages ,
  deleteMessage
}