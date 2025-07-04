import cookieParser from "cookie-parser";
import cookie from 'cookie'
import express from "express";
import dotenv from 'dotenv' ;
import cors from 'cors'

import {createServer} from 'http' ;
import {Server} from 'socket.io' ;

import connectDB from "./utils/connectDB.js";
import userRouter from "./routes/user.routes.js" ;
import postRouter from './routes/post.routes.js' ;
import commentRouter from './routes/comment.routes.js' ;
import { v2 as cloudinary } from "cloudinary";

dotenv.config() ;

const app = express() ;
const newServer = createServer(app)

const io = new Server(newServer ,{
   cors : {
     origin: 'http://localhost:5173',
     credentials : true 
   }
})

io.use((socket , next) => {
  const token = cookie.parse(socket.request.headers.cookie) ;

    if(!token.accessToken){
      return next(new Error('No token provided'));
    }

    jwt.verify(token.accessToken , process.env.ACCESS_TOKEN_SECRET , (err , decoded) => {
      if(err){
        return next(new Error('Invalid token'));
      }
      socket.user = decoded;
      next();
    })
})

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', 

  credentials: true, // Allow cookies to be sent
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

app.listen(3000, () => {
  connectDB() ;
  console.log("Server is running on port 3000");
}); 