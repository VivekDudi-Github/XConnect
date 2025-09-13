import cookieParser from "cookie-parser";
import cookie from 'cookie'
import express from "express";
import dotenv from 'dotenv' ;
import cors from 'cors' ;
import jwt from 'jsonwebtoken' ;
import * as mediasoup from "mediasoup";

import {createServer} from 'http' ;
import {Server} from 'socket.io' ;

import { v2 as cloudinary } from "cloudinary";

import connectDB from "./utils/connectDB.js";
import userRouter from "./routes/user.routes.js" ;
import postRouter from './routes/post.routes.js' ;
import roomRouter from './routes/room.routes.js' ;
import commentRouter from './routes/comment.routes.js' ;
import messageRouter from './routes/message.routes.js' ;
import communityRouter from './routes/community.routes.js' ;

import { checkSocketUser } from "./utils/chekAuth.js";

import messageListener from "./utils/listners/message.listener.js";

import { User } from "./models/user.model.js";
import { UserListener } from "./utils/listners/user.listener.js";
import { Following } from "./models/following.model.js";
import { setInterval } from "timers/promises";
import { error } from "console";
import { v4 } from "uuid";

dotenv.config() ;

const app = express() ;
const newServer = createServer(app)


let worker, router;

const transportsBySocket = new Map();  // socket.id → array of transports
const participants = new Map(); // roomId → array of userIds

// rooms = {
//   "room123": {
//     producers: Map(socket.id → [producers]),
//     consumers: Map(socket.id → [consumers]),
//     chat: [ { senderId, message, timestamp } ]
//     users: [ { userId , avatar , blocked , name, muted } ]
//   }
// }

// first join room → create room -> send back the uuid
// 
// then get the rtpCapabilities & create the transport -> which is stored in the room with socket Id.
// and produce -> store the producerId in the room with socket Id.

const roomMap = new Map();


const io = new Server(newServer, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
});

io.use(checkSocketUser);

(async () => {
  worker = await mediasoup.createWorker();
  router = await worker.createRouter({
    mediaCodecs: [
      { kind: "audio", mimeType: "audio/opus", clockRate: 48000, channels: 2 },
      { kind: "video", mimeType: "video/VP8", clockRate: 90000 }
    ]
  });
})();

io.on("connection", async (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // join rooms (your existing logic)
  if (socket.user) {
    const communities = await Following.find({
      followedBy: socket.user._id,
      followingCommunity: { $exists: true }
    }).select("followingCommunity");

    socket.join(`user:${socket.user._id}`);
    communities.forEach((c) => {
      socket.join(`community:${c.followingCommunity}`);
    });
  }

  messageListener(socket, io);
  UserListener(socket, io);

  // === mediasoup signaling ===

  socket.on('joinMeeting', async (roomId , callback) => {
    const room = roomMap.get(roomId);
    if (!room) return callback({error : 'Room not found'});
    // io.sockets.adapter.rooms.keys
    participants.set(socket.user._id , roomId) ;

    const getUser = room.users.get(socket.user._id) ; 
    if(getUser && getUser?.blocked) return callback({error : 'You are blocked from this room'});

    room.users.set(socket.user._id, { 
      userId: socket.user._id, 
      username: socket.user.username,  
      muted: false, 
      avatar: socket.user.avatar 
    });
    callback({success : true});
  })

  socket.on("createMeeting", async (callback) => {
    const roomId = v4() ;
    roomMap.set(roomId , { 
      users : new Map() , 
      producers : new Map() ,
      consumers : new Map() ,
      chat : [] ,
    });

    roomMap.get(roomId).users.set(socket.user._id , { 
        userId: socket.user._id, 
        username: socket.user.username,  
        muted: false, 
        avatar: socket.user.avatar
    }) ;
    participants.set(socket.user._id , roomId) ;
    
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
    console.log('transportId : ' ,transportId);
    
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
    producers.push({
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

    setInterval(async () => {
      const stats = await producer.getStats();
      console.log("Producer packetsSent:", stats); 
    } , 3000);
  
  });

  socket.on("getProducers", (data, callback) => {
    const list = [];
    for (const [id, producer] of producersBySocket.entries()) {
      list.push({ id, kind: producer });
    }
    callback(list);
  });

  socket.on("createConsumerTransport", async (roomId , callback) => {
    const transport = await router.createWebRtcTransport({
      listenIps: [{ ip: "0.0.0.0", announcedIp: "10.170.156.15" }],
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

  socket.on("consume", async ({ rtpCapabilities, producerId, transportId , roomId }, cb) => {
    if (!router.canConsume({ producerId, rtpCapabilities })) {
      return cb({ error: "Cannot consume" });
    }
    console.log('transportId : ' ,transportId);
    if(!roomMap.has(roomId)) return cb({ error: "Room not found" });  

    const transports = transportsBySocket.get(socket.id) || [];
    const transport = transports.find(t => t.id === transportId);
    if (!transport) return cb({ error: "No consumer transport" });

    const consumer = await transport.consume({
      producerId,
      rtpCapabilities,
      paused : false 
    });
    console.log('consuming', consumer.id);
    consumer.requestKeyFrame().catch(() => {console.log('error requesting key frame');});
    
    let consumers = consumersBySocket.get(socket.id) || [];
    consumers.push(consumer);

    roomMap.get(roomId).consumers.set(socket.user._id , consumers) ;

    cb({
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

  // === cleanup ===
  socket.on("disconnect", async () => {
    await User.findByIdAndUpdate(socket.user._id, { $set: { lastOnline: Date.now() } });
    console.log(`Client disconnected: ${socket.id}`);

    // cleanup transports
    const transports = transportsBySocket.get(socket.id) || [];
    transports.forEach(t => t.close());
    transportsBySocket.delete(socket.id);

    let roomId = participants.get(socket.user._id) ;
    let room = roomMap.get(roomId) ;
  
    if(room && room.producers.has(socket.user._id)){
      const producer = room.producers.get(socket.user._id)
      producer.forEach(p => p?.close());
      room.producer.delete(socket.user._id) ;
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

    participants.delete(socket.user._id) ;

  });
});


// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true, 
}));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()) ;

app.use('/api/v1/user' , userRouter )
app.use('/api/v1/post' , postRouter) ;
app.use('/api/v1/comment' , commentRouter) ;
app.use('/api/v1/message' , messageRouter ) ;  
app.use('/api/v1/room' , roomRouter ) ;
app.use('/api/v1/community' , communityRouter)

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

newServer.listen(3000, () => {
  connectDB() ;
  console.log("Server is running on port 3000");
}); 

export {io}