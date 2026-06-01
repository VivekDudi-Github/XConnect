import {Queue} from 'bullmq' ;
import { configDotenv } from 'dotenv';

configDotenv();

const isProduction = process.env.NODE_ENV === 'PRODUCTION' ;

const connection = {
  host : isProduction ? process.env.REDIS_HOST : 'localhost' ,
  port : process.env.REDIS_PORT
}

const ffmpegQueue = new Queue('video_process', {connection}) ;

export {
  connection, 
  ffmpegQueue 
}