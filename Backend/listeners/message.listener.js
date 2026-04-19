import { LiveChat } from "../models/liveChats.model.js";
import { Message } from "../models/messages.model.js";
import {Types} from 'mongoose' ;
import { v4 as uuidv4 } from 'uuid';
import { LIVESTREAM_ROOM } from "../constants/livestream.socket.constant.js";
import { RECEIVE_LIVE_MESSAGE, RECEIVE_MESSAGE , SEND_LIVE_MESSAGE , SEND_MESSAGE } from "../constants/messages.socket.constant.js";

const ObjectId = Types.ObjectId ;
const MessageListener = (socket , io) => {
  
  socket.on(SEND_MESSAGE ,  async({message , memberIds = [] , room_id}) => {
    console.log(message , memberIds , room_id);
    const {_id , username , avatar} = socket.user ;

    if(memberIds.length > 0){
      const messageObj = {
        _id : new ObjectId() ,
        message ,
        room : room_id ,
        createdAt : new Date() ,
        sender : {
          _id ,
          username ,
          avatar ,
        }
      }

      
      try {
        await Message.create(messageObj) ;
        memberIds.forEach(member => {
          io.to(`user:${member}`).emit(RECEIVE_MESSAGE ,messageObj )
        })
      } catch (error) {
        console.log('error while saving the message in socket' , error);
        io.to(`user:${_id}`).emit('ERROR_MESSAGE' , {
          error : 'Failed to send the message. Please try again later.' ,
          content : message ,
        }) ;
      }
      
    }
    

    }) ;

  socket.on(SEND_LIVE_MESSAGE , async({message , isSuperChat = false, roomId , amount = 0 } , cb) => {  
    if(!message) return cb({error : 'no message content'}) ;
    if(!roomId) return cb({error : 'no room Id found'}) ;

    const Obj = await new LiveChat({
      sender :  socket.user._id ,
      message ,
      roomId ,
      isSuperChat : false ,
      amount : 0 ,
    }).save() ;
    console.log(socket?.rooms , 'rooms');
    
    io.to(`${LIVESTREAM_ROOM}:${roomId}`).emit(RECEIVE_LIVE_MESSAGE, {
      ...Obj._doc , 
      sender : {
        _id : socket.user._id , 
        username : socket.user.username , 
        avatar : socket.user.avatar
    }}) ;
    cb && cb() ;

  })
 

}
export default MessageListener ;




