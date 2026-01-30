import cookieParser from "cookie-parser";
import express from "express";
import dotenv from 'dotenv' ;
import cors from 'cors' ;


import {createServer} from 'http' ;
import {Server} from 'socket.io' ;


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

import path from "path";

dotenv.config() ;

const app = express() ;
const newServer = createServer(app) ;

app.use('/api/v1/stripe' , stripeWebhook);




const io = new Server(newServer, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
});

io.use(checkSocketUser);
// Middleware to parse JSON bodies
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true, 
}));
app.use('/serve/hsl' , express.static(path.resolve("uploads/storage")))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()) ;

app.use('/api/v1/health-check' , (req,res) => res.status(200).json({success : true})) ;

app.use('/api/v1/user' , userRouter ) ;
app.use('/api/v1/post' , postRouter) ;
app.use('/api/v1/comment' , commentRouter) ;
app.use('/api/v1/message' , messageRouter ) ;  
app.use('/api/v1/room' , roomRouter ) ;
app.use('/api/v1/community' , communityRouter) ;
app.use('/api/v1/live' , liveRouter) ;
app.use('/api/v1/stripe/payment' , stripeRouter) ;
app.use('/api/v1/search' , searchRouter) ;
app.use('/api/v1/analytics' , analyticsRouter) ;
app.use('/api/v1/videoUpload' , videoUploadRouter) ;

console.log('run');


export {io , newServer} ;
// export default newServer ;