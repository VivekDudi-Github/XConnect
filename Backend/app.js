import cookieParser from "cookie-parser";
import express from "express";
import dotenv from 'dotenv' ;
import cors from 'cors'

import connectDB from "./utils/connectDB.js";
import userRouter from "./routes/user.routes.js" ;
import postRouter from './routes/post.routes.js'
import { v2 as cloudinary } from "cloudinary";

dotenv.config() ;

const app = express() ;



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

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

app.listen(3000, () => {
  connectDB() ;
  console.log("Server is running on port 3000");
}); 