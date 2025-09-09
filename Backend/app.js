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

dotenv.config() ;

const app = express() ;
const newServer = createServer(app)


let worker, router;

const transportsBySocket = new Map();  // socket.id → array of transports
const producersBySocket  = new Map();  // socket.id → array of producers
const consumersBySocket  = new Map();  // socket.id → array of consumers
const consumersById      = new Map();  // consumer.id → consumer

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

  socket.on("getRtpCapabilities", (callback) => {
    callback(router.rtpCapabilities);
    console.log('rtpCapabilities : ', router.rtpCapabilities);
    
  });

  socket.on("createWebRtcTransport", async (callback) => {
    const transport = await router.createWebRtcTransport({
      listenIps: [{ ip: "0.0.0.0", announcedIp: "10.170.156.15" }], // change to public IP later
      enableUdp: true,
      enableTcp: true
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

  socket.on("connectProducerTransport", async ({ dtlsParameters, transportId }, callback) => {
    const transports = transportsBySocket.get(socket.id) || [];
    const transport = transports.find(t => t.id === transportId);
    if (transport) {
      await transport.connect({ dtlsParameters });
    }
    callback();
  });

  socket.on("produce", async ({ kind, rtpParameters, transportId }, callback) => {
    const transports = transportsBySocket.get(socket.id) || [];
    
    const transport = transports.find(t => t.id === transportId);
    // console.log(!!transport , transport);
    if (!transport) return;

    const producer = await transport.produce({ kind, rtpParameters });

    let producers = producersBySocket.get(socket.id) || [];
    producers.push(producer);
    producersBySocket.set(socket.id, producers);
    console.log("producerId : " ,producer.id);
    
    callback({ id: producer.id });
  });

//   socket.on("produce", async ({ kind, rtpParameters, transportId }, callback) => {
//   const transport = transportsBySocket.get(transportId);
//   if (!transport) {
//     return callback({ error: "transport not found" });
//   }

//   const producer = await transport.produce({ kind, rtpParameters });
//   producersById.set(producer.id, producer);
//   console.log("New producer:", producer.id, "kind:", kind);

//   callback({ id: producer.id });
// });

// ✅ New handler here

socket.on("getProducers", (data, callback) => {
  const list = [];
  for (const [id, producer] of producersBySocket.entries()) {
    list.push({ id, kind: producer.kind });
  }
  callback(list);
});

  socket.on("createConsumerTransport", async (callback) => {
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

  socket.on("consume", async ({ rtpCapabilities, producerId, transportId }, cb) => {
    if (!router.canConsume({ producerId, rtpCapabilities })) {
      return cb({ error: "Cannot consume" });
    }
    console.log('transportId : ' ,transportId);
    
    const transports = transportsBySocket.get(socket.id) || [];
    const transport = transports.find(t => t.id === transportId);
    if (!transport) return cb({ error: "No consumer transport" });

    const consumer = await transport.consume({
      producerId,
      rtpCapabilities,
      paused : false 
    });
    console.log('consuming', consumer.id);
    consumer.requestKeyFrame().catch(() => {console.log('error requesting key frame');
    });
    let consumers = consumersBySocket.get(socket.id) || [];
    consumers.push(consumer);
    consumersBySocket.set(socket.id, consumers);

    consumersById.set(consumer.id, consumer);

    cb({
      id: consumer.id,
      producerId,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters
    });
  });

  socket.on("resumeConsumer", async ({ consumerId }) => {
    const consumer = consumersById.get(consumerId);
    console.log('consumer to resume:', consumerId, !!consumer);
    
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

    // cleanup producers
    const producers = producersBySocket.get(socket.id) || [];
    producers.forEach(p => p.close());
    producersBySocket.delete(socket.id);

    // cleanup consumers
    const consumers = consumersBySocket.get(socket.id) || [];
    consumers.forEach(c => {
      consumersById.delete(c.id);
      c.close();
    });
    consumersBySocket.delete(socket.id);
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












// let worker, router, producerTransport, consumerTransport, producer, consumer;

// const transportsBySocket = new Map();  // socket.id → array of transports
// const producersBySocket  = new Map();  // socket.id → array of producers
// const consumersBySocket  = new Map();  // socket.id → array of consumers

// const consumersById = new Map();       


// const io = new Server(newServer ,{
//    cors : {
//      origin: 'http://localhost:5173',
//      credentials : true 
//    }
// }) ;

// io.use(checkSocketUser) ;

// (async () => {
//   worker = await mediasoup.createWorker();
//   router = await worker.createRouter({
//     mediaCodecs: [
//       { kind: "audio", mimeType: "audio/opus", clockRate: 48000, channels: 2 },
//       { kind: "video", mimeType: "video/VP8", clockRate: 90000 }
//     ]
//   });
// })();


// io.on('connection', async(socket) => {
//   console.log(`New client connected: ${socket.id}`);
//   // Store the user's socket ID

//   if (socket.user) {
//     const communities = await Following.find({followedBy : socket.user._id , followingCommunity : {$exists : true}}).select('followingCommunity')
//     socket.join(`user:${socket.user._id}`)
//     communities.forEach( c => {
//       socket.join(`community:${c.followingCommunity}`)
//     })
//   }
//   messageListener(socket , io) ;
//   UserListener(socket , io) ;

//   socket.on("getRtpCapabilities", (callback) => {
//     callback(router.rtpCapabilities);
//   });

//     socket.on("createWebRtcTransport", async (callback) => {
//     producerTransport = await router.createWebRtcTransport({
//       listenIps: [{ ip: "0.0.0.0", announcedIp: "127.0.0.1" }],
//       enableUdp: true,
//       enableTcp: true
//     });

//     callback({
//       id: producerTransport.id,
//       iceParameters: producerTransport.iceParameters,
//       iceCandidates: producerTransport.iceCandidates,
//       dtlsParameters: producerTransport.dtlsParameters
//     });
//   });

//   socket.on("connectProducerTransport", async ({ dtlsParameters }, callback) => {
//     await producerTransport.connect({ dtlsParameters });
//     callback();
//   });

//     socket.on("produce", async ({ kind, rtpParameters }, callback) => {
//     console.log('producing', kind);
//       producer = await producerTransport.produce({ kind, rtpParameters });
//     callback({ id: producer.id });
//   });

//   socket.on("createConsumerTransport", async (callback) => {
//     consumerTransport = await router.createWebRtcTransport({
//       listenIps: [{ ip: "0.0.0.0", announcedIp: "127.0.0.1" }],
//       enableUdp: true,
//       enableTcp: true
//     });

//     callback({
//       id: consumerTransport.id,
//       iceParameters: consumerTransport.iceParameters,
//       iceCandidates: consumerTransport.iceCandidates,
//       dtlsParameters: consumerTransport.dtlsParameters
//     });
//   });

//    socket.on("connectConsumerTransport", async ({ dtlsParameters }, callback) => {
//     await consumerTransport.connect({ dtlsParameters });
//     callback();
//   });

//   socket.on("consume", async ({ rtpCapabilities, producerId }, cb) => {
//   if (!router.canConsume({ producerId, rtpCapabilities })) {
//     return cb({ error: "Cannot consume" });
//   }

//   const transport =  router.getConsumerTransport(socket.id);

//   const consumer = await transport.consume({
//     producerId,
//     rtpCapabilities,
//     paused: true // start paused
//   });

//   // Save it
//   let consumers = consumersBySocket.get(socket.id) || [];
//   consumers.push(consumer);
//   consumersBySocket.set(socket.id, consumers);

//   consumersById.set(consumer.id, consumer); // 🔑 so resume/close can find it later

//   cb({
//     id: consumer.id,          // consumer.id
//     producerId,               // the producer we subscribed to
//     kind: consumer.kind,
//     rtpParameters: consumer.rtpParameters
//   });
// });

  
//   socket.on("resumeConsumer", async ({ consumerId }) => {
//     const consumer = consumersById.get(consumerId);
//     await consumer.resume();
//   });

//   // Handle disconnection
//   socket.on('disconnect', async() => {
//     await User.findByIdAndUpdate(socket.user._id , {$set : {lastOnline : Date.now()}})
//     console.log(`Client disconnected: ${socket.id}`)
//   });
// })