import { v4 } from "uuid";

export const MediaSoupListener = (socket , io , roomMap, participants , transportsBySocket , router) => {
  
    socket.on('joinMeeting', async ({roomId , password = ''} , callback) => {
      const room = roomMap.get(roomId);
      
      if (!room) return callback({error : 'Room not found'});
      // io.sockets.adapter.rooms.keys
      console.log(room.password , password);
      
      if( room.password[1] !== password ) return callback({error : 'Wrong password'});
      
  
      participants.set(socket.user._id , roomId) ;
  
      const getUser = room.users.get(socket.user._id) ; 
      if(getUser && getUser?.blocked) return callback({error : 'You are blocked from this room'});
  
      room.users.set(socket.user._id, { 
        userId: socket.user._id, 
        username: socket.user.username,  
        muted: false, 
        avatar: socket.user.avatar ,
        socketId : socket.id , 
      });
      callback({success : true});
    })
  
    socket.on("createMeeting", async ({password} , callback) => {
      const roomId = v4() ;
      roomMap.set(roomId , { 
        users : new Map() ,      
        producers : new Map() ,
        consumers : new Map() ,
        chat : [] ,
        password : [] ,
      });
  
      roomMap.get(roomId).users.set(socket.user._id , { 
          userId: socket.user._id, 
          username: socket.user.username,  
          muted: false, 
          avatar: socket.user.avatar,
          socketId : socket.id ,
      }) ;
      roomMap.get(roomId).password = [socket.user._id , password ? password : ''] ;
      participants.set(socket.user._id , roomId) ;
      console.log('line:147 , createMeeting' ,roomMap );
      
      return callback( { roomId , success : true});
  
    })
  
    socket.on("getRtpCapabilities", (callback) => {
      callback(router.rtpCapabilities);
    });
  
    socket.on("createWebRtcTransport", async (callback) => {
      const transport = await router.createWebRtcTransport({
        listenIps: [{ ip: '0.0.0.0' , announcedIp: process.env.IP_ADDRESS }], // change to public IP later 
        enableUdp: true,
        enableTcp: true,
        preferUdp: true
      });
      
      // store it
      let transports = transportsBySocket.get(socket.id) || [];
      transports.push(transport);
      transportsBySocket.set(socket.id, transports);
  
      callback({
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters
      });
    });
  
    socket.on("connectProducerTransport", async ({ dtlsParameters, transportId , roomId}, callback) => {
      const transports = transportsBySocket.get(socket.id) || [];
      const transport = transports.find(t => t.id === transportId);
      if (transport) {
        await transport.connect({ dtlsParameters });
      }
      callback();
    });
  
    // fix the error handling here , missing room 
    socket.on("produce", async ({ kind, rtpParameters, transportId , roomId }, callback) => {
      console.log('produce');
      
      
      const transports = transportsBySocket.get(socket.id) || [];
      
      const transport = transports.find(t => t.id === transportId);
      // console.log(!!transport , transport);
      if (!transport) {
        return callback({error : 'Transport not found'});
      };
  
      const producer = await transport.produce({ kind, rtpParameters });
  
      const room = roomMap.get(roomId) ;
      if(!room) return callback({error : 'Room not found'}) ;
  
  
      let producers = room.producers.get(socket.user._id) || [] ;
  
  
      const stats = await producer.getStats();
      console.log("Producer packetsSent:", stats); 
  
      producers.push({
        userId : socket.user._id ,
        id: producer.id,
        kind: producer.kind,
        type: producer.type, // "simple", "simulcast", "svc"
        paused: producer.paused,
        appData: producer.appData,
        instance : producer ,
      });
      room.producers.set(socket.user._id , producers)
      console.log("producerId : " ,producer.id);
  
      producer.on("transportclose", () => {
        console.log("Producer closed because transport closed");
      });
  
      producer.on("trackended", () => {
        console.log("Producer track ended (user stopped camera/mic)");
      });
      
      callback({ id: producer.id });
      let userObj = room.users.get(socket.user._id) ;
      room.users.forEach((_ , userId) => {
        console.log('new User emitted');
        
        if(userId !== socket.user._id && !_.blocked){
          console.log(_.username , 'user obj');
          
          io.to(_.socketId).emit("NewUserToMeeting" , { user : userObj , p : producers }) ;  
        }
      })
    
    });
  
    socket.on("getProducers", (roomId, callback) => {
      const list = [];
      let room = roomMap.get(roomId) ;
      if(!room) return callback(list);
  
      room.producers.forEach((p , userId )=> {
        if(userId === socket.user._id) return ;
        
        let user =  room.users.get(p[0].userId) ;
  
        if(user?.blocked || user?.muted) return ;  
        
        list.push({p , user}) ;  
        console.log(p);
      })
      
      callback(list);
    });
  
    socket.on("createConsumerTransport", async (callback) => {
      const transport = await router.createWebRtcTransport({
        listenIps: [{ ip: "0.0.0.0", announcedIp: process.env.IP_ADDRESS  }],
        enableUdp: true,
        enableTcp: true
      });
      console.log("consumer transportId :" ,transport?.id);
      
      let transports = transportsBySocket.get(socket.id) || [];
      transports.push(transport);
      transportsBySocket.set(socket.id, transports);
  
      
      callback({
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters
      });
    });
  
    socket.on("connectConsumerTransport", async ({ dtlsParameters, transportId }, callback) => {
      console.log('transportId : ' ,transportId);
      
      const transports = transportsBySocket.get(socket.id) || [];
      const transport = transports.find(t => t.id === transportId);
      
      if (transport) {
        console.log('Connecting consumer transport:', transportId);
        await transport.connect({ dtlsParameters });
      }else {
        console.log('Consumer transport not found:', transportId);
      }
      callback();
    });
  
    socket.on("consume", async ({ rtpCapabilities, producerId, transportId , roomId }, callback) => {
      if (!router.canConsume({ producerId, rtpCapabilities })) {
        return callback({ error: "Cannot consume" });
      }
      console.log('transportId : ' ,transportId);
      if(!roomMap.has(roomId)) return callback({ error: "Room not found" });  
  
      const transports = transportsBySocket.get(socket.id) || [];
      const transport = transports.find(t => t.id === transportId);
      if (!transport) return callback({ error: "No consumer transport" });
      console.log('----socket id' ,socket.id , );
      
      const consumer = await transport.consume({
        producerId,
        rtpCapabilities,
        paused : false 
      });
      console.log('rtp capablities', consumer?.rtpParameters?.encodings); 
      consumer.requestKeyFrame().catch(() => {console.log('error requesting key frame');});
      
      // let consumers = consumersBySocket.get(socket.id) || [];
      // consumers.push(consumer);
  
      let consumers = roomMap.get(roomId).consumers.get(socket.user._id) || [] ;
      consumers.push(consumer);
  
      roomMap.get(roomId).consumers.set(socket.user._id , consumers) ;
  
      callback({
        id: consumer.id,
        producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters
      });
    });
  
    socket.on("resumeConsumer", async ({ consumerId , roomId }) => {
      const consumer = roomMap.get(roomId).consumers.get(socket.user._id)?.find(c => c.id === consumerId);
      
      if (consumer) {await consumer.resume();  console.log(consumer?.kind);
      } else { console.log('no consumer found');
      }
    });
  
    socket.on('userLeftFromMeeting' , async ({ roomId}) => {
      const room = roomMap.get(roomId);
      if(!room) return ;
      
      const transports = transportsBySocket.get(socket.id) || [];
      transports.forEach(t => t.close());
      transportsBySocket.delete(socket.id);
  
      if(room && room?.users?.get(socket.user._id)){  
        room.users.forEach((_ , key) => {
          if(socket.user._id !== key) io.to(_?.socketId).emit('removeUserFromMeeting' , {userId : socket.user._id} )
        })
      }
    
      if(room && room.producers.has(socket.user._id)){
        const producer = room.producers.get(socket.user._id)
        producer.forEach(p => p.instance?.close());
        room.producers.delete(socket.user._id) ;
      }
      if(room && room.consumers.has(socket.user._id)){
        const consumers = room.consumers.get(socket.user._id)
        consumers.forEach(p => p?.close());
        room.consumers.delete(socket.user._id) ;
      }
      if(room && room.producers.size === 0 && room.consumers.size === 0){
        roomMap.delete(roomId) ;
      }
  
      if(room && room.users.get(socket.user._id)) room.users.delete(socket.user._id) ;
      console.log(roomMap);
      
      participants.delete(socket.user._id) ;
      
      console.log('user left meeting' , room.users);
    })
 }