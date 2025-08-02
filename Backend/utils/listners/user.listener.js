import { UserRoomMeta } from "../../models/UserRoomMeta.model.js";

const UserListener = (socket , io) => {
  socket.on('User_Room_Meta_Update', async({room_id}) => {
    console.log('U') ; 
    if(!socket.user || !room_id) return ;
    
    await UserRoomMeta.findOneAndUpdate({
      room : room_id ,
      user : socket.user._id 
    } , {
      $set : {
        lastVisit : new Date() ,
      } , 
      $setOnInsert : {
        user : socket.user._id ,
        room : room_id ,
      }
    } , {upsert : true})
  } , );
}

export { UserListener} ;