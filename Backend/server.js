import {io , newServer} from "./app.js";
import { configDotenv } from "dotenv";
import * as mediasoup from "mediasoup";
import connectDB from "./utils/connectDB.js";
import { v2 as cloudinary } from 'cloudinary' ;
import { RateLimiterMemory } from "rate-limiter-flexible";

import {publicIp} from 'public-ip' ;
import {ip} from 'address';

import messageListener from "./listeners/message.listener.js";
import { MediaSoupCleanup, MediaSoupListener } from "./listeners/mediasoup.listeners.js";

import { User } from "./models/user.model.js";
import { UserListener } from "./listeners/user.listener.js";
import { Following } from "./models/following.model.js";
import { LiveStreamCleanup, StreamListener } from "./listeners/liveStream.listeners.js";

import fs from "fs";
import path from "path";

const transportsBySocket = new Map();  // socket.id → array of transports
const participants = new Map(); // roomId → array of userIds

configDotenv();


const isProduction = process.env.NODE_ENV === 'PRODUCTION' ;

const roomMap = new Map();
let worker, router , webRtcServer;

(async () => {
  let publicIpAddress = await publicIp() ;
  let localIpAddress = await ip() ;
  let announcedIp = isProduction ? publicIpAddress : localIpAddress ;
  try {
    worker = await mediasoup.createWorker();
    webRtcServer = await worker.createWebRtcServer({
      listenInfos:[{
        protocol : 'udp' ,
        ip: '0.0.0.0' , 
        announcedAddress: announcedIp,
        portRange: {
          min: 40000,
          max: 49999
        }
      } , {
        protocol : 'tcp' ,
        ip : '0.0.0.0' ,
        announcedAddress : announcedIp,
        portRange: { 
          min: 40000, 
          max: 40100 
        }
      }] ,
    })
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
      }
    );
    await StartServer() ;
  } catch (error) {
    console.error('mediasoup worker error ::' ,error);
  }
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
    
    // await connectDB() ;
    
    newServer.listen(process.env.PORT, async() => {
      console.log("Server is running on port "+process.env.PORT);
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

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise);
  console.error("Reason:", reason);
});

export {webRtcServer}
