
module.exports = (socket , io) => {
  
  socket.on('SEND_MESSAGE' ,  ({message , memberIds = [] , room_id}) => {
    const memebers = memberIds.filter(id => id !== socket.user._id.toString()) ;
    const {_id , username , avatar} = socket.user ;
    if(memebers.length > 0){
      memebers.forEach(member => {
        io.to(`user:${member}`).emit('RECEIVE_MESSAGE' , {
          message ,
          sender : {
            _id ,
            username ,
            avatar ,
            room_id ,
          }
        })
      })
      return ;
    }
    } ) ;
}




