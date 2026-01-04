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
import liveRouter from './routes/live.routes.js' ;
import searchRouter from './routes/search.routes.js' ;
import commentRouter from './routes/comment.routes.js' ;
import messageRouter from './routes/message.routes.js' ;
import communityRouter from './routes/community.routes.js' ;
import analyticsRouter from './routes/analytics.routes.js' ;
import stripeRouter from './routes/stripePayment.routes.js' ;
import stripeWebhook from './routes/stripeWebhook.routes.js' ;
import videoUploadRouter from './routes/videoUpload.routes.js' ;

import { checkSocketUser } from "./utils/chekAuth.js";

import messageListener from "./utils/listners/message.listener.js";
import { MediaSoupCleanup, MediaSoupListener } from "./utils/listners/medisaoup.listeners.js";

import { User } from "./models/user.model.js";
import { UserListener } from "./utils/listners/user.listener.js";
import { Following } from "./models/following.model.js";
import bodyParser from "body-parser";
import Stream from "stream";
import { LiveStreamCleanup, StreamListener } from "./utils/listners/liveStream.listeners.js";
import path from "path";

dotenv.config() ;

const app = express() ;
const newServer = createServer(app) ;

app.use('/api/v1/stripe' , stripeWebhook);


let worker, router;

const transportsBySocket = new Map();  // socket.id → array of transports
const participants = new Map(); // roomId → array of userIds


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
      {
        kind: "video",
        mimeType: "video/H264",
        clockRate: 90000,
        parameters: {
          "packetization-mode": 1,
          "profile-level-id": "42e01f", // baseline
          "level-asymmetry-allowed": 1
        }
      }
    ]
  }) ;
})();
 
// Middleware to parse JSON bodies
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true, 
}));
app.use('/serve/hsl' , express.static(path.resolve("uploads/storage")))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()) ;

app.use('/api/v1/user' , userRouter )
app.use('/api/v1/post' , postRouter) ;
app.use('/api/v1/comment' , commentRouter) ;
app.use('/api/v1/message' , messageRouter ) ;  
app.use('/api/v1/room' , roomRouter ) ;
app.use('/api/v1/community' , communityRouter)
app.use('/api/v1/live' , liveRouter)
app.use('/api/v1/stripe/payment' , stripeRouter)
app.use('/api/v1/search' , searchRouter) ;
app.use('/api/v1/analytics' , analyticsRouter) ;
app.use('/api/v1/videoUpload' , videoUploadRouter) ;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,

})

async function StartServer(){
  try {
    await connectDB() ;

    newServer.listen(3000, () => {
      console.log("Server is running on port 3000");
    });

    io.on("connection", async (socket) => {
      console.log(`New client connected: ${socket.id}`);
      if(!socket.user) return ;
      // join rooms 
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
      MediaSoupListener(socket , io , roomMap, participants , transportsBySocket , router); 
      StreamListener(socket , io ) ;

      socket.on('JOIN_SOCKET_ROOM' , async({roomId , room}) => {
        if(!room || !roomId) return ;
        socket.join(`${room}:${roomId}`) ;
        console.log('joined room' , room , roomId);
      })

      socket.on('LEAVE_SOCKET_ROOM' , async({roomId , room}) => {
        if(!room || !roomId) return ;
        socket.leave(`${room}:${roomId}`) ;
      })
      socket.on('CHECK_ROOM_ACTIVE' , async({room , roomId} , cb) => {
        if(!room || !roomId) return ;
        let isRoom = io.sockets.adapter.rooms.get(`${room}:${roomId}`) ;
        let active = isRoom?.size || 0 ;
        
        cb && cb({active , isRoom : !!isRoom }) ;
      }) ;

      socket.on('ping-check', (cb) => {
        cb && cb( 'pong');
      });

      // === cleanup ===
      socket.on("disconnect", async () => {
        await User.findByIdAndUpdate(socket.user._id, { $set: { lastOnline: Date.now() } });
        LiveStreamCleanup(socket , io ) ;
        console.log(`Client disconnected: ${socket.id}`);
        MediaSoupCleanup(socket , io , roomMap , participants , transportsBySocket);
      });
    });


  } catch (error) {
    console.log('error while starting server' , error);
    process.exit(1) ;
  }
}
StartServer() ;

export {io} ;