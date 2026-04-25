import cron from 'node-cron'; 
import fs from 'fs/promises';
import path from 'path';
import pLimit, {} from 'p-limit'; 

const TARGET_DIR = path.resolve('uploads/storage');
const FILE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

let limit = pLimit(10); // Limit concurrent file operations to 10

const initCronJob = () => {
  cron.schedule('0 3 * * *', async() => {
      console.log('Running automated file cleanup...');
      try {

        let files = await fs.readdir(TARGET_DIR , { withFileTypes: true }); 
          
          const now = Date.now();
          console.log("timestamp :", now , "files Length:" ,files.length); 
          
          const prmoisedFiles = files.map( async(file) => {
              const filePath = path.join(TARGET_DIR, file.name);
              
              return limit(async () => {
                try {
                  let stats = await fs.stat(filePath);
                  
                    console.log(`Checking file: ${file.name} (Last modified: ${new Date(stats.mtimeMs)})`);
                    if (now - stats.mtimeMs > FILE_MAX_AGE_MS) {
                       await fs.rm(filePath, { recursive: true, force: true });
                       console.log(`Deleted file: ${file.name}`);
                      }
                } catch (error) {
                  console.error(`Error processing file during cleanup job: ${file.name}:`, error); 
                }
              }) ;
          });
          await Promise.allSettled(prmoisedFiles);
      } catch (error) {
        console.error('Error during file cleanup:', error);
      }
  });

}

export {
  initCronJob
}