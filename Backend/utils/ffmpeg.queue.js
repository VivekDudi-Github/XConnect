import {Queue} from 'bullmq' ;
import { configDotenv } from 'dotenv';

configDotenv();

const isProduction = process.env.NODE_ENV === 'PRODUCTION' ;

const connection = {
  host : isProduction ? 'redis' : 'localhost' ,
  port : 6379
}

const ffmpegQueue = new Queue('video_process', {connection}) ;

export {
  connection, 
  ffmpegQueue 
}