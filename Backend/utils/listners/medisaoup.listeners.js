import { v4 } from "uuid";

import {webRtcServer} from '../../server.js'
import {CREATE_MEETING, JOIN_MEETING, NEW_MESSAGE_TO_MEETING , NEW_USER_TO_MEETING , REMOVE_USER_FROM_MEETING, USER_LEFT_FROM_MEETING} from '../constants/meeting.socket.constants.js'
import { CONNECT_CONSUMER_TRANSPORT, CONNECT_PRODUCER_TRANSPORT, CONSUME, CONSUME_STREAM, CREATE_CONSUMER_TRANSPORT, CREATE_WEBRTC_TRANSPORT, GET_PRODUCERS, GET_RTP_CAPABILITIES, PRODUCE, PRODUCE_STREAM, RESUME_CONSUMER } from "../constants/mediasoup.socket.constant.js";
import {ADD_MESSAGE, GET_ALL_MESSAGES} from '../constants/messages.socket.constant.js' ;

let streamConsumers = new Map() ;


export const MediaSoupListener = (socket , io , roomMap, participants , transportsBySocket , router) => {
  
    socket.on(JOIN_MEETING, async ({roomId , password = ''} , callback) => {
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
  
    socket.on(CREATE_MEETING, async ({password} , callback) => {
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
  
    socket.on(ADD_MESSAGE , async({message , roomId } , callback) => {
      const room = roomMap.get(roomId) ;
      if(!room) return callback({error : "Room doesn't exist"}) ;

      const user = room.users.get(socket.user._id) ;
      if(!user|| user.blocked) return  callback({error : 'You are not currently active in meeting.'})
        
        const newObj = {
        message , 
        id : v4() ,
        user : {
          userId : socket.user._id ,
          username : socket.user.username ,
        } , 
        timeStamp : new Date().toUTCString() ,
      } 
      
      room.chat.push(newObj) ;
      
      room.users.forEach((_) => {
        if(!_.blocked){
          io.to(_.socketId).emit(NEW_MESSAGE_TO_MEETING , { message : newObj , roomId }) ;  
        }
      })
      callback() ;
    })

    socket.on(GET_ALL_MESSAGES , async({roomId} , callback) => {
      const room = roomMap.get(roomId) ;
      if(!room) return callback({error : "Room doesn't exist"})
        
      const user = room.users.get(socket.user._id) ;
      if(!user|| user.blocked) return  callback({error : 'You are not currently active in meeting.'})
            
      return callback({chat : room.chat}) ;
    })

    socket.on(GET_RTP_CAPABILITIES, (callback) => {
      console.log('rtp connection tried');
      
      callback(router.rtpCapabilities);
    });
  
    socket.on(CREATE_WEBRTC_TRANSPORT, async (callback) => {
      if(!webRtcServer) return callback({error : 'server loading , please wait.'}) ;
      const transport = await router.createWebRtcTransport({
        webRtcServer,
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

    socket.on(CONNECT_PRODUCER_TRANSPORT, async ({ dtlsParameters, transportId }, callback) => {
      const transports = transportsBySocket.get(socket.id) || [];
      const transport = transports.find(t => t.id === transportId);
      if (transport) {
        await transport.connect({ dtlsParameters });
      }
      callback();
    });
   
    socket.on(PRODUCE, async ({ kind, rtpParameters, transportId , roomId }, callback) => {    
      const transports = transportsBySocket.get(socket.id) || [];
      
      const transport = transports.find(t => t.id === transportId);
      // console.log(!!transport , transport);
      if (!transport) {
        return callback({error : 'Transport not found'});
      };
  
      const producer = await transport.produce({ kind, rtpParameters });
      console.log('prdducer encodings' ,producer?.rtpParameters?.encodings);
      
      const room = roomMap.get(roomId) ;
      if(!room) return callback({error : 'Room not found'}) ;
  
  
      let producers = room.producers.get(socket.user._id) || [] ;
  
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
          
          io.to(_.socketId).emit(NEW_USER_TO_MEETING , { user : userObj , p : producers }) ;  
        }
      })
    
    });

    socket.on(PRODUCE_STREAM, async ({ kind, rtpParameters, transportId  }, callback) => {
      const transports = transportsBySocket.get(socket.id) || [];

      const transport = transports.find(t => t.id === transportId);
      // console.log(!!transport , transport);
      if (!transport) {
        return callback({error : 'Transport not found'});
      };
      const producer = await transport.produce({ kind, rtpParameters });
      console.log('prdducer encodings' ,producer?.rtpParameters?.encodings);

      callback({ id: producer.id }) ;

    })
  
    socket.on(GET_PRODUCERS, (roomId, callback) => {
      const list = [];
      let room = roomMap.get(roomId) ;
      if(!room) return callback(list);
  
      room.producers.forEach((p , userId )=> {
        if(userId === socket.user._id) return ;
        
        let user =  room.users.get(p[0].userId) ;
  
        if(user?.blocked || user?.muted) return ;  
        
        list.push({p , user}) ;  
      })
      
      callback(list);
    });
  
    socket.on(CREATE_CONSUMER_TRANSPORT, async (callback) => {
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
  
    socket.on( CONNECT_CONSUMER_TRANSPORT, async ({ dtlsParameters, transportId }, callback) => {
      const transports = transportsBySocket.get(socket.id) || [];
      const transport = transports.find(t => t.id === transportId);
      
      if (transport) {
        await transport.connect({ dtlsParameters });
      }else {
        console.log('Consumer transport not found:', transportId);
      }
      transport.on('dtlsstatechange', (state) => {
        console.log(`DTLS state [${transport.id}]:`, state);
      });
      transport.on('icestatechange', (state) => {
        console.log(`ICE state [${transport.id}]:`, state);
      });
      callback();
    });
  
    socket.on(CONSUME, async ({ rtpCapabilities, producerId, transportId , roomId }, callback) => {
      if (!router.canConsume({ producerId, rtpCapabilities })) {
        return callback({ error: "Cannot consume" });
      }
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
      console.log('consumer encodings :' ,consumer?.rtpParameters?.encodings);
      // consumer.requestKeyFrame().catch(() => {console.log('error requesting key frame');});
      
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

    socket.on(CONSUME_STREAM , async({rtpCapabilities , producerId , transportId } , callback) => {
      if (!router.canConsume({ producerId, rtpCapabilities })) {
        return callback({ error: "Cannot consume" });
      }

      const transports = transportsBySocket.get(socket.id) || [];
      const transport = transports.find(t => t.id === transportId);
      if (!transport) return callback({ error: "No consumer transport" });

      const consumer = await transport.consume({
        producerId,
        rtpCapabilities,
        paused : false 
      });

      const consumers = streamConsumers.get(socket.user._id) || [] ;
      consumers.push(consumer);
      streamConsumers.set(socket.user._id , consumers ) ;

      callback({
        id: consumer.id,
        producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters
      });

    })
  
    socket.on(RESUME_CONSUMER, async ({ consumerId , roomId }) => {
      let consumer = roomMap.get(roomId)?.consumers?.get(socket.user._id)?.find(c => c.id === consumerId);
      
      if(!consumer){
        consumer = streamConsumers.get(socket.user._id)?.find(c => c.id === consumerId) ;
      }
      if(!consumer) return console.log('no consumer found');
      if (consumer) {await consumer.resume();  console.log(consumer?.kind);
      } else { console.log('no consumer found');
      }
    });
  
    socket.on(USER_LEFT_FROM_MEETING , async ({ roomId}) => {
      const room = roomMap.get(roomId);
      if(!room) return ;
      
      const transports = transportsBySocket.get(socket.id) || [];
      transports.forEach(t => t.close());
      transportsBySocket.delete(socket.id);
  
      if(room && room?.users?.get(socket.user._id)){  
        room.users.forEach((_ , key) => {
          if(socket.user._id !== key) io.to(_?.socketId).emit(REMOVE_USER_FROM_MEETING , {userId : socket.user._id} )
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

export const MediaSoupCleanup = (socket , io , roomMap , participants , transportsBySocket , router) => {
  // cleanup transports
        const transports = transportsBySocket.get(socket.id) || [];
        transports.forEach(t => t.close());
        transportsBySocket.delete(socket.id);

        let roomId = participants.get(socket.user._id) ;
        let room = roomMap.get(roomId) ;

        if(room && room?.users?.get(socket.user._id)){  
          room.users.forEach((_ , key) => {
            if(socket.user._id !== key) io.to(_?.socketId).emit(REMOVE_USER_FROM_MEETING , {userId : socket.user._id} )
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
}