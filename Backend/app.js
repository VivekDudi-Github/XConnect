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
import { MediaSoupListener } from "./utils/listners/medisaoup.listeners.js";

import { User } from "./models/user.model.js";
import { UserListener } from "./utils/listners/user.listener.js";
import { Following } from "./models/following.model.js";

dotenv.config() ;

const app = express() ;
const newServer = createServer(app)


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
  MediaSoupListener(socket , io , roomMap, participants , transportsBySocket , router); 


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