import mongoose from "mongoose";
import {Room} from "../../models/room.model.js";
import {User} from "../../models/user.model.js";

const ObjectId = mongoose.Types.ObjectId;

export const findOneOnOneRoom = (members) =>
  Room.findOne({
    type: "one-on-one",
    members: { $all: members },
  });

export const createRoomRepo = (data) => Room.create(data);

export const findRoomById = (id) => Room.findById(id);

export const getValidUsersByIds = (ids) =>
  User.find({ _id: { $in: ids } }).select("_id");

export const getRoomsAggregation = (userId) => [
    {$match : {
      members : {$in : [ new ObjectId(`${userId}`)]}
    }} , 
    //usermeta
    {$lookup : {
      from : 'userroommetas' ,
      let : {roomId : '$_id'} ,
      pipeline : [
        {$match : {
          $expr : {
            $and : [
              {$eq : ['$room' , '$$roomId']} ,
              {$eq : ['$user' , new ObjectId(`${userId}`)]}
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
    //last messages
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
    // messages
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
    //lookup members
    {$lookup: {
        from: 'users',
        let: {
          memberIds: '$members' ,
          roomId : '$_id'
          },
        pipeline: [
          { $match: { $expr: { $in: ['$_id', '$$memberIds'] } } },
          {$lookup : {
            from: 'userroommetas',
            let: { userId: '$_id', roomId: '$$roomId' },
            pipeline: [
              { $match: { $expr: { $and: [ { $eq: ['$user', '$$userId'] }, { $eq: ['$room', '$$roomId'] } ] } } },
              { $project: { lastVisit: 1 } }
            ],
            as : 'userMeta'
          }} ,
          { $unwind: { path: '$userMeta', preserveNullAndEmptyArrays: true } },
          { $addFields: { lastVisit: '$userMeta.lastVisit' } },
          { $project: { username: 1, avatar: 1, fullname: 1 , lastOnline :  '$lastVisit' } }
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
  ]