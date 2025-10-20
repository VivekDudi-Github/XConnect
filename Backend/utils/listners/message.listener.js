import { LiveChat } from "../../models/liveChats.model.js";
import { Message } from "../../models/messages.model.js";
import {Types} from 'mongoose' ;
import { v4 as uuidv4 } from 'uuid';

const ObjectId = Types.ObjectId ;
const MessageListener = (socket , io) => {
  
  socket.on('SEND_MESSAGE' ,  async({message , memberIds = [] , room_id}) => {
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

      memberIds.forEach(member => {
        io.to(`user:${member}`).emit('RECEIVE_MESSAGE' ,messageObj )
      })
      try {
        await Message.create(messageObj) ;
      } catch (error) {
        console.log('error while saving the message in socket' , error);
      }
      
    }
    

    }) ;

  socket.on('SEND_LIVE_MESSAGE' , async({message , isSuperChat = false, roomId , amount = 0 }) => {  

    const Obj = await new LiveChat({
      sender :  socket.user._id ,
      message ,
      roomId ,
      isSuperChat ,
      amount ,
    }).save() ;

    io.to(`liveStream:${roomId}`).emit('RECEIVE_LIVE_MESSAGE' , {Obj})

  })
}
export default MessageListener ;




