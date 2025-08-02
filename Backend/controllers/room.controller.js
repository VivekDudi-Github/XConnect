import mongoose from 'mongoose';
import {TryCatch , ResError , ResSuccess} from '../utils/extra.js'

import { User } from '../models/user.model.js'
import { Room } from '../models/Room.model.js';
import { UserRoomMeta } from '../models/UserRoomMeta.model.js';

const ObjectId = mongoose.Types.ObjectId ;

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
    if(roomExists && roomExists.members.length === 2) return ResSuccess(res , 200 , roomExists)
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
  const {id , name , description , members  , removeMembers , demotionMembers , promotions} = req.body ;

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

const deleteRoom = TryCatch(async (req , res) => {
  const {id} = req.params ;

  const room = await Room.findById(id) ;
  if(!room) return ResError(res , 404 , 'Room not found')
  if(!room.owner.equals(req.user._id)) return ResError(res , 403 , 'You are not the owner of this room')
  
  room.isDeleted = true ;
  await room.save() ;
  return ResSuccess( res , 200 , 'Room deleted successfully')
} , 'deleteRoom')

const getRooms = TryCatch(async (req , res) => {

  const rooms = await Room.aggregate([
    {$match : {
      members : {$in : [ new ObjectId(`${req.user._id}`)]}
    }} , 
    {$lookup : {
      from : 'userroommetas' ,
      let : {roomId : '$_id'} ,
      pipeline : [
        {$match : {
          $expr : {
            $and : [
              {$eq : ['$room' , '$$roomId']} ,
              {$eq : ['$user' , new ObjectId(`${req.user._id}`)]}
            ]
          }
        }} ,
      ] ,
      as : 'userMeta' 
    }} ,
    {$unwind: {
        path: '$userMeta',
        preserveNullAndEmptyArrays: true
      }
    },
    {$addFields: {
        lastVisit: '$userMeta.lastVisit'
      }
    },
    {$lookup : {
      from : 'messages' ,
      let : {roomId : '$_id' , 
            lastVisit : '$lastVisit' ,
      } ,
      pipeline : [
        {$match : {
          $expr : {
            $and : [
              {$eq : ['$room' , '$$roomId']} ,
              {$eq : ['$isDeleted' , false]} ,
              
              {$cond: {
                if: { $ifNull: ['$$lastVisit', false] },
                then: { $gt: ['$createdAt', '$$lastVisit'] },
                else: false ,
              }}
            ]
          }
        }} ,
        {$project : {
          message : 1 ,
          createdAt : 1 ,
        }}, 
        {$sort : {createdAt : -1}} ,
      ] , 
      as : 'lastMessages'
    }} ,
    {$lookup : {
      from : 'messages' ,
      let : {roomId : '$_id'},
      pipeline : [
        {$match : {
          $expr : {
            $and : [
              {$eq : ['$room' , '$$roomId']} ,
              {$eq : ['$isDeleted' , false]} ,
            ]
          }
        }} ,
        {$sort : {createdAt : -1}} ,
        {$limit : 1} ,
        {$project : {
          message : 1 ,
          createdAt : 1 ,
        }} ,
      ] ,
      as : 'lastMessage'
    }} ,
    {$addFields : {
      lastMessage : {$arrayElemAt : ['$lastMessage' , 0]} ,
      unseenMessages : {$size : '$lastMessages'}
    }} ,

    {$sort : {'unseenMessages' : -1}} ,
    {$lookup: {
        from: 'users',
        let: { memberIds: '$members' },
        pipeline: [
          { $match: { $expr: { $in: ['$_id', '$$memberIds'] } } },
          { $project: { username: 1, avatar: 1, fullname: 1 , lastOnline : 1} }
        ],
        as: 'members'
      }
    } , 
    {$project : {
      name : 1 ,
      description : 1 ,
      type : 1 ,
      owner : 1 ,
      members : 1 ,
      admins : 1 ,
      lastMessage : 1 ,
      unseenMessages : 1 ,
      createdAt : 1 ,
    }}
  ])
console.log(rooms);

  return ResSuccess( res , 200 , rooms)
} , 'getRooms')

const getSingleRoom = TryCatch(async (req , res) => {
  const {id} = req.params ;
  const room = await Room.findById(id) ;
  if(!room) return ResError(res , 404 , 'Room not found')
  return ResSuccess( res , 200 , room)
} , 'getSingleRoom')

export {
  updateGroup ,
  createRoom ,
  getSingleRoom ,
  getRooms ,
  deleteRoom ,
}