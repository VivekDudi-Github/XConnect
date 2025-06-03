import cookieParser from "cookie-parser";
import express from "express";
import dotenv from 'dotenv' ;


import connectDB from "./utils/connectDB.js";
import userRouter from "./routes/user.routes.js" ;


dotenv.config() ;

const app = express() ;



// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()) ;

app.use('/user' , userRouter )

app.listen(3000, () => {
  connectDB() ;
  console.log("Server is running on port 3000");
}); 