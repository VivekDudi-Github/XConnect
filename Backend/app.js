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

let worker, router, producerTransport, consumerTransport, producer, consumer;

const io = new Server(newServer ,{
   cors : {
     origin: 'http://localhost:5173',
     credentials : true 
   }
}) ;

io.use(checkSocketUser) ;

(async () => {
  worker = await mediasoup.createWorker();
  router = await worker.createRouter({
    mediaCodecs: [
      { kind: "audio", mimeType: "audio/opus", clockRate: 48000, channels: 2 },
      { kind: "video", mimeType: "video/VP8", clockRate: 90000 }
    ]
  });
})();


io.on('connection', async(socket) => {
  console.log(`New client connected: ${socket.id}`);
  // Store the user's socket ID

  if (socket.user) {
    const communities = await Following.find({followedBy : socket.user._id , followingCommunity : {$exists : true}}).select('followingCommunity')
    socket.join(`user:${socket.user._id}`)
    communities.forEach( c => {
      socket.join(`community:${c.followingCommunity}`)
    })
  }
  messageListener(socket , io) ;
  UserListener(socket , io) ;

  socket.on("getRtpCapabilities", (callback) => {
    callback(router.rtpCapabilities);
  });

    socket.on("createWebRtcTransport", async (callback) => {
    producerTransport = await router.createWebRtcTransport({
      listenIps: [{ ip: "0.0.0.0", announcedIp: "127.0.0.1" }],
      enableUdp: true,
      enableTcp: true
    });

    callback({
      id: producerTransport.id,
      iceParameters: producerTransport.iceParameters,
      iceCandidates: producerTransport.iceCandidates,
      dtlsParameters: producerTransport.dtlsParameters
    });
  });

  socket.on("connectProducerTransport", async ({ dtlsParameters }, callback) => {
    await producerTransport.connect({ dtlsParameters });
    callback();
  });

    socket.on("produce", async ({ kind, rtpParameters }, callback) => {
    console.log('producing', kind);
      producer = await producerTransport.produce({ kind, rtpParameters });
    callback({ id: producer.id });
  });

  socket.on("createConsumerTransport", async (callback) => {
    consumerTransport = await router.createWebRtcTransport({
      listenIps: [{ ip: "0.0.0.0", announcedIp: "127.0.0.1" }],
      enableUdp: true,
      enableTcp: true
    });

    callback({
      id: consumerTransport.id,
      iceParameters: consumerTransport.iceParameters,
      iceCandidates: consumerTransport.iceCandidates,
      dtlsParameters: consumerTransport.dtlsParameters
    });
  });

   socket.on("connectConsumerTransport", async ({ dtlsParameters }, callback) => {
    await consumerTransport.connect({ dtlsParameters });
    callback();
  });

  socket.on("consume", async ({ rtpCapabilities }, callback) => {
    if (!router.canConsume({ producerId: producer.id, rtpCapabilities })) {
      return callback({ error: "cannot consume" });
    }

    consumer = await consumerTransport.consume({
      producerId: producer.id,
      rtpCapabilities,
      paused: false
    });

    callback({
      id: consumer.id,
      producerId: producer.id,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters
    });
  });

  // Handle disconnection
  socket.on('disconnect', async() => {
    await User.findByIdAndUpdate(socket.user._id , {$set : {lastOnline : Date.now()}})
    console.log(`Client disconnected: ${socket.id}`)
  });
})

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