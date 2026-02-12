
let BufferTime = 1000 * 60 * 5 ; // 5 minutes
const liveHosts = new Map();

export const StreamListener = (socket , io) => {
  // CHECK ROOM JOINED OR NOT
  socket.on('CHECK_ROOM_JOINED' , (room , roomId , cb) => {
    let joined = io.sockets.adapter.rooms.get(`${room}:${roomId}`)?.has(socket.id) ;
    cb && cb(joined)
  })

  socket.on('ADD_LIVE_HOST' , ({roomId }) => {
    console.log('emit live host');
    
    liveHosts.set(socket.user._id , {roomId , lastUpdate : Date.now() , isDisconnected : false}) ;
  })

  socket.on('REJOIN_LIVE_STREAM' , ({roomId} , cb) => {
    let hostRoom = liveHosts.get(socket.user._id) ;  
    if(hostRoom){
      liveHosts.set(socket.user._id , {...hostRoom ,lastUpdate : Date.now() , isDisconnected : false })
      socket.join(`liveStream:${roomId}`) ;
    }
    cb && cb(!!hostRoom) ;  
  })

  socket.on('CHECK_AND_UPDATE_LIVE_HOST' , ({roomId} , cb) => {
    const hostRoom = liveHosts.get(socket.user._id) ; 
    let isAvailableTime = false ;
    if(hostRoom){
      isAvailableTime = BufferTime - (Date.now() - hostRoom.lastUpdate ) ;
      liveHosts.set(socket.user._id , {  ...hostRoom ,lastUpdate : Date.now(),}) ;
    }
    cb && cb({isAvailableTime : isAvailableTime , roomId : hostRoom?.roomId}) ;
  })

  socket.on('REMOVE_LIVE_HOST' , () => {
    liveHosts.delete(socket.user._id) ;
  })
  socket.on('END_BROADCAST' , ({roomId}) => {
    liveHosts.delete(socket.user._id) ;
    io.to(`liveStream:${roomId}`).emit('BROADCAST_ENDED') ;
  })

}


export const LiveStreamCleanup = (socket , io) => {
  // handle live stream cleanup on host disconnect
  let hostRoom = liveHosts.get(socket.user._id) ;
  if(hostRoom && (Date.now() - hostRoom.lastUpdate < BufferTime)){
    liveHosts.set(socket.user._id , { ...hostRoom ,lastUpdate : Date.now() , isDisconnected : true }) ;

    setTimeout(() => {
      const hostRoom = liveHosts.get(socket.user._id);
      if (!hostRoom) return;

      const inactiveTooLong = Date.now() - hostRoom.lastUpdate > BufferTime;
      if (hostRoom.isDisconnected && inactiveTooLong)  liveHosts.delete(socket.user._id);
    } , BufferTime) ;

  }else {
    liveHosts.delete(socket.user._id) ;
  }


}

