

export const StreamListener = (socket , io) => {
  // CHECK ROOM JOINED OR NOT
  socket.on('CHECK_ROOM_JOINED' , (room , roomId , cb) => {
    let joined = io.sockets.adapter.rooms.get(`${room}:${roomId}`).has(socket.id) ;
    cb && cb(joined)
  })
  //stream rjoin event handler
  // accidental disconnect handling
  //
}