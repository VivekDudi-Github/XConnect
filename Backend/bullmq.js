import {Worker} from 'bullmq';
import { mergeUploadAsync } from './jobs/ffmpeg.js' ;
import {connection} from './utils/ffmpeg.queue.js' ;
import path from 'path';
import fs from 'fs/promises' ;
import fsync from 'fs' ;

const STORAGE_DIR = path.resolve('uploads/storage') ;

const ffmpegWorker = new Worker(
    'video_process', 
    async (job) => {
      const {public_id} = job.data ;
      try {
        console.log('bullmq starting process ')
        await mergeUploadAsync(public_id) ;
      } catch (err) {
        console.error("Error processing job", err); 
        throw err ;
      }
    },
    {connection , 
      settings : {
        maxStalledCount : 2 ,
        stalledDelay : 10000 , // 10 seconds 
      }
    } ,
)

ffmpegWorker.on('completed', async(job) => {
  console.log(`video processing job with id ${job.id} & videoId with ${job?.data?.public_id || 'id error'}  has completed!`);  
  await cleanupFunc(job.data.public_id , job.data.totalChunks) ;  
});

ffmpegWorker.on('failed', async(job, err) => {
  console.log(`video processing job with id ${job.id} & videoId with ${job?.data?.public_id || 'id error'}  has failed with ${job.attemptsMade} attempts !`, err);  
  if(job && job.attemptsMade >= (job?.opts?.attempts || 3)){
    await cleanupFunc(job.data.public_id , job.data.totalChunks) ;
  }
});

const cleanupFunc = async (public_id, totalChunks) => {
    const uploadDir = path.join(STORAGE_DIR, public_id);
    try {
      await fs.rm(uploadDir, { recursive: true, force: true });
    } catch (error) {
      console.log('error in cleaning up the video chunks' , error);
    }
    
}

export {
  ffmpegWorker
}