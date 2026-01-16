import { mergeUploadAsync } from "./child process/ffmpeg.js";

const queue = [];
let activeJobs = 0;

const MAX_CONCURRENT_JOBS = 2;

export function enqueueMerge(job) {
  queue.push(job);
  processQueue();
}

function processQueue() {
  if (activeJobs >= MAX_CONCURRENT_JOBS) return;
  if (queue.length === 0) return;

  const job = queue.shift();
  activeJobs++;

  runJob(job)
    .catch(err => {
      console.error("Merge job failed", err);
    })
    .finally(() => {
      activeJobs--;
      processQueue(); 
    });
}


async function  runJob(job) {
  const {public_id} = job ;
  await mergeUploadAsync(public_id) ;
}
