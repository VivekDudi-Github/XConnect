import {io , newServer} from "./app.js";
import { configDotenv } from "dotenv";
import * as mediasoup from "mediasoup";
import connectDB from "./utils/connectDB.js";
import { v2 as cloudinary } from 'cloudinary' ;
import { RateLimiterMemory } from "rate-limiter-flexible";

import messageListener from "./utils/listners/message.listener.js";
import { MediaSoupCleanup, MediaSoupListener } from "./utils/listners/medisaoup.listeners.js";

import { User } from "./models/user.model.js";
import { UserListener } from "./utils/listners/user.listener.js";
import { Following } from "./models/following.model.js";
import { LiveStreamCleanup, StreamListener } from "./utils/listners/liveStream.listeners.js";

import path from "path";
import { execFile } from "child_process";

const STORAGE_DIR = path.resolve('uploads/storage') ;
const transportsBySocket = new Map();  // socket.id → array of transports
const participants = new Map(); // roomId → array of userIds

configDotenv();

const roomMap = new Map();
let worker, router;


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


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const rateLimiter = new RateLimiterMemory({
  points: 50, // 50 points
  duration: 1, // 1 second
});

async function StartServer(){
  try {
    console.log('starting server');
    await connectDB() ;
    
    newServer.listen(process.env.PORT, async() => {
      console.log("Server is running on port "+process.env.PORT);
      // let inputPath = path.join(STORAGE_DIR ,'702f7348-650b-4d7f-9dc4-7cc0ae873550' , 'final.mp4') ;
      // let posterPath = path.join(STORAGE_DIR ,'702f7348-650b-4d7f-9dc4-7cc0ae873550' , 'poster.jpg') ;
      // await getVideoPoster(inputPath , posterPath , 4) ;
    });



    io.on("connection", async (socket) => {
      console.log(`New client connected: ${socket.id}`);
      if(!socket.user) return ;
      
      socket.use(async( packet , next) => {
        try {
          await rateLimiter.consume(socket.user._id)
          next() ;
        } catch (error) {
          io.to(socket.id).emit('RATE_LIMIT_EXCEEDED') ;
        }
        
      })

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
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise);
  console.error("Reason:", reason);
});


function getVideoPoster(inputPath , posterPath , duration){

  return new Promise((resolve, reject) => {
    execFile(
      "ffmpeg",
      [
        "-v", "error",
        "-ss", duration.toString(),
        "-i", inputPath,
        "-strict", "unofficial",
        "-frames:v", "1",
        "-q:v", "2",
        posterPath
      ],
      (err , stdout, stderr) => {
        console.log('POSTER STDOUT' , stdout);
        console.log('POSTER STDERR' , stderr);
        if (err) {
          console.error('error in generating poster from video' ,err);
          return reject(null);
        } ;
        resolve(posterPath);
      }
    );
  });
}