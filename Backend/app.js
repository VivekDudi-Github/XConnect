import cookieParser from "cookie-parser";
import cookie from 'cookie'
import express from "express";
import dotenv from 'dotenv' ;
import cors from 'cors' ;
import jwt from 'jsonwebtoken' ;

import {createServer} from 'http' ;
import {Server} from 'socket.io' ;

import connectDB from "./utils/connectDB.js";
import userRouter from "./routes/user.routes.js" ;
import postRouter from './routes/post.routes.js' ;
import commentRouter from './routes/comment.routes.js' ;
import { v2 as cloudinary } from "cloudinary";
import { checkSocketUser } from "./utils/chekAuth.js";

dotenv.config() ;

const app = express() ;
const newServer = createServer(app)
const userSocketIDs = new Map ;

const io = new Server(newServer ,{
   cors : {
     origin: 'http://localhost:5173',
     credentials : true 
   }
}) ;

io.use(checkSocketUser) ;



io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);
  // Store the user's socket ID
  if (socket.user) {
    socket.join(`user:${socket.user._id}`)
  }

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
  });

  // Handle custom events here, e.g., chat messages, notifications, etc.
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