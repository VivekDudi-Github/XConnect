import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import express from "express";
import dotenv from 'dotenv' ;
import cors from 'cors' ;
import mongoSanitizer from '@exortek/express-mongo-sanitize';
import helmet from 'helmet' ;

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
import videoUploadRouter from './routes/video.routes.js' ;

import { checkSocketUser } from "./utils/checkAuth.js";

import { swaggerSpec } from "./swagger.js" ;
import swaggerUi from "swagger-ui-express" ;

import { initCronJob } from "./jobs/cleanUpJob.js";

dotenv.config() ;
const isDevelopment = process.env.NODE_ENV !== 'PRODUCTION' ;


const app = express() ;
const newServer = createServer(app) ;

initCronJob() ;

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 500
});

app.use('/api/', limiter);
app.use(helmet()) ;
app.disable('x-powered-by')

const io = new Server(newServer, {
  cors: {
    origin: [
      isDevelopment ? 'http://localhost:5173' : process.env.CLIENT_URL, 
    ] ,
    credentials: true
  }
});

io.use(checkSocketUser);
app.use('/api/v1/stripe' , stripeWebhook);

app.use(cors({
  origin: [
    isDevelopment ? 'http://localhost:5173' : process.env.CLIENT_URL ,
    isDevelopment ? 'http://localhost:3000' : process.env.BACKEND_URL ,
  ], 
  credentials: true, 
  optionsSuccessStatus : 200 
}));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()) ;

app.use(mongoSanitizer()) ;

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({ success: false, message: err.message || 'Internal Server Error' });
});

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
app.use('/api/v1/video' , videoUploadRouter) ;


export {io , newServer} ;