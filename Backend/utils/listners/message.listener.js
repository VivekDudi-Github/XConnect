import { Message } from "../../models/messages.model.js";
import { v4 as uuidv4 } from "uuid";

const MessageListener = (socket , io) => {
  
  socket.on('SEND_MESSAGE' ,  async({message , memberIds = [] , room_id}) => {
    console.log(message , memberIds , room_id);
    const {_id , username , avatar} = socket.user ;
    
    if(memberIds.length > 0){
      memberIds.forEach(member => {
        io.to(`user:${member}`).emit('RECEIVE_MESSAGE' , {
          _id : uuidv4() ,
          message ,
          room_id ,
          sender : {
            _id ,
            username ,
            avatar ,
          }
        })
      })
      return ;
    }
    await Message.create({
      from : socket.user._id ,
      message ,
      room : room_id ,
    })

    } ) ;
}

export default MessageListener ;




