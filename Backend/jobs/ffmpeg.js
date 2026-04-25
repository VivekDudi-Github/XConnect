import {spawn , execFile} from 'child_process' ;
import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import {VideoUpload} from '../models/videoUpload.model.js' ;
import { fileTypeFromFile } from 'file-type';
import { uploadHLSFolder , walkDir } from '../utils/supabase.js';
import { uploadFilesTOCloudinary } from '../utils/cloudinary.js';


const STORAGE_DIR = path.resolve('uploads/storage') ;
const RENDITIONS = [
  {
    name: "360",
    maxW: 640,
    maxH: 360,
    maxrate: "856k",
    bufsize: "1200k"
  },
  {
    name: "480",
    maxW: 854,
    maxH: 480,
    maxrate: "1498k",
    bufsize: "2100k"
  },
  {
    name: "720",
    maxW: 1280,
    maxH: 720,
    maxrate: "2996k",
    bufsize: "4200k"
  }
];


async function mergeUploadAsync(public_id) {
  console.log('merge initalized');
    try {
      const uploadDoc = await VideoUpload.findOne({ public_id });
      if (!uploadDoc || uploadDoc.status !== "processing") {       
        throw new Error("Invalid upload state for merge");
      }

      const uploadDir = path.join(STORAGE_DIR, public_id);
      const outputPath = path.join(uploadDir, "final.mp4");

      const writeStream = await fsSync.createWriteStream(outputPath);

      for (let i = 0; i < uploadDoc.totalChunks; i++) {
        const chunkPath = path.join(uploadDir, `part-${i}`);
        const readStream = await fsSync.createReadStream(chunkPath);
        readStream.pipe(writeStream, { end: false });
        await new Promise((resolve, reject) => {
          readStream.on("end", resolve);
          readStream.on("error", reject);
        });
      }

      writeStream.end();

      await new Promise((resolve) => writeStream.on("finish", resolve));

      
      // type  check 
      let type = await fileTypeFromFile(outputPath);
      if(type.mime.startsWith('video/') === false){
        throw new Error("Merged file is not a valid video");
      }

      // Integrity check
      
      const finalSize = (await fs.stat(outputPath)).size; 
      if (finalSize !== uploadDoc.fileSize) {
        throw new Error("Final file size mismatch");
      }
      

      uploadDoc.finalPath = `${outputPath}`;
      await uploadDoc.save();
      

      // Cleanup chunks
      for (let i = 0; i < uploadDoc.totalChunks; i++) {
        await fs.unlink(path.join(uploadDir, `part-${i}`));
      }
      console.time(':: ffmpeg worker time') ;
      
      await startFFmpegWorker(public_id) ;
      console.timeEnd(':: ffmpeg worker time') ;

    } catch (err) {
      console.error("Merge failed:", err);
      await VideoUpload.updateOne(
        { public_id },
        { status: "failed" ,}
      );
      await fs.unlink(path.join(STORAGE_DIR, public_id, "final.mp4")); 
    }
}


function probeVideo(inputPath) {
  return new Promise((resolve, reject) => {
    execFile(
      "ffprobe",
      [
        "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height:format=duration",
        "-of", "json",
        inputPath
      ],
      (err, stdout) => {
        if (err) return reject(err);
        const data = JSON.parse(stdout);
        const { width, height } = data.streams[0];
        const { duration } = data.format;
        resolve({ width, height , duration });
      }
    );
  });
}
function buildFfmpegArgs(inputPath, hlsDir, probe) {
  const { width, height } = probe;

  // Keep only renditions that fit the source
  const enabled = RENDITIONS.filter(r =>
    width >= r.maxW || height >= r.maxH
  );

  // Always keep at least one rendition (source-limited)
  if (enabled.length === 0) {
    enabled.push(RENDITIONS[0]);
  }

  const splitCount = enabled.length;

  let filter = `[0:v]split=${splitCount}`;
  enabled.forEach((r, i) => filter += `[v${i}]`);
  filter += ";";

  enabled.forEach((r, i) => {
    filter +=
      `[v${i}]scale=` +
      `w=min(${r.maxW}\\,iw):` +
      `h=min(${r.maxH}\\,ih):` +
      `force_original_aspect_ratio=decrease,` +
      `pad=ceil(iw/2)*2:ceil(ih/2)*2` +
      `[v${i}out];`;
  });

  filter = filter.slice(0, -1); // remove trailing ;

  const args = [
    "-y",
    "-i", inputPath,

    "-filter_complex", filter,

    "-c:v", "libx264",
    "-c:a", "aac",
    "-profile:v", "main",
    "-preset", "veryfast",
    "-crf", "20",
    "-g", "48",
    "-keyint_min", "48",
    "-sc_threshold", "0",

    "-f", "hls",
    "-hls_time", "6",
    "-hls_playlist_type", "vod",
    "-hls_flags", "independent_segments",
    "-hls_segment_filename",
    path.join(hlsDir, "v%v/segment_%03d.ts")
  ];

  enabled.forEach((r, i) => {
    args.push(
      "-map", `[v${i}out]`,
      "-map", "0:a:0",
      `-maxrate:v:${i}`, r.maxrate,
      `-bufsize:v:${i}`, r.bufsize
    );
  });

  args.push(
    "-var_stream_map",
    enabled.map((_, i) => `v:${i},a:${i}`).join(" "),
    path.join(hlsDir, "v%v/index.m3u8")
  );

  return args;
}
function getVideoPoster(inputPath , posterPath , duration){
  return new Promise((resolve, reject) => {
    execFile(
      "ffmpeg",
      [
        "-v", "error",
        "-ss", duration.toString(),
        "-i", inputPath,
        "-strict", "unofficial",
        "-frames:v", "1",
        "-q:v", "2",
        posterPath
      ],
      (err , stdout, stderr) => {
        // console.log('POSTER STDOUT' , stdout);
        // console.log('POSTER STDERR' , stderr);
        if (err) {
          console.error('error in generating poster from video' ,err);
          return reject(null);
        } ;
        resolve(posterPath);
      }
    );
  });
}

async function startFFmpegWorker(public_id ){
  console.log('FFmpeg worker started for public_id:', public_id);
  
  const uploadDir = path.join(STORAGE_DIR, public_id);
  const inputPath = path.join(uploadDir, "final.mp4");
  const hlsDir = path.join(uploadDir, "hls");
  
  
  await fs.mkdir(hlsDir , {recursive: true}) ;
  
  const probe = await probeVideo(inputPath);
  const args = buildFfmpegArgs(inputPath, hlsDir, probe);
  const ffmpeg = spawn("ffmpeg", args);


  ffmpeg.stderr.on("data", data => {
    // console.log('::' , data.toString());
  });

  ffmpeg.on('error' , (err) => {
    console.log(`FFMPEG error for public_id ${public_id}:`, err);
    VideoUpload.updateOne(
      { public_id },
      { status: "failed" } ,
    ) ; 
  })

  ffmpeg.on("close", async (code) => {
    if (code === 0) {
      try {
        const posterPath = path.join(uploadDir , "poster.jpg") ;
        
        await getVideoPoster(inputPath , posterPath , probe.duration*0.2);
        console.log('generated poster at :' , posterPath); 
        
        console.log('creating master playlist');
        let uploadedPoster ;
        try {
          if (fsSync.existsSync(posterPath) === false){
            throw new Error("Poster file does not exist");
          }
          uploadedPoster = await uploadFilesTOCloudinary([{path : posterPath , type : 'image'}]) 
        } catch (err) {
          console.error('error in uploading the poster files')
          uploadedPoster = null ;
        };
          

        // Create master playlist manually
        createMasterPlaylist(hlsDir , probe);
        await fs.unlink(inputPath) ;
        console.log("Uploading HLS folder");
        
        let masterPlaylist = await uploadHLSFolder(public_id) ;          
        await VideoUpload.findOneAndUpdate({public_id : public_id}  , {
          url : masterPlaylist , 
          status : "completed" ,
          poster : uploadedPoster?.[0] ? {
            url : uploadedPoster[0].url ,
            public_id : uploadedPoster[0].public_id ,
          } : null 
        }) ;

      } catch (error) {
          console.log('ffmpeg catch block error :' ,error);     
          let paths = await walkDir(uploadDir) ;

          await VideoUpload.updateOne(
            { public_id },
            { status: "failed" }
          );

          for(const path of paths){
            await fs.unlink(path) ;
          }
          let posterPath = path.join(uploadDir , "poster.jpg") ;
           fsSync.existsSync(inputPath) ? await fs.unlink(inputPath) : null ; 
           fsSync.existsSync(posterPath) ? await fs.unlink(posterPath) : null;
           fsSync.existsSync(uploadDir) ? await fs.rm(uploadDir , {recursive : true}) : null ;
        }
        
    } else {
      console.log('ffmpeg error:' , code);
      let paths = await walkDir(uploadDir) ;

      await VideoUpload.updateOne(
        { public_id },
        { status: "failed" }
      );

      for(const path of paths){
        await fs.unlink(path) ;
      }
      let posterPath = path.join(uploadDir , "poster.jpg") ;
       fsSync.existsSync(inputPath) ? await fs.unlink(inputPath) : null ; 
       fsSync.existsSync(posterPath) ? await fs.unlink(posterPath) : null;
       fsSync.existsSync(uploadDir) ? await fs.rm(uploadDir , {recursive : true}) : null ;

      await VideoUpload.updateOne(
        { public_id },
        { status: "failed" }
      );
    }
  });
}


async function createMasterPlaylist(hlsDir, probe) {
  const { height, width } = probe;

  let content = `#EXTM3U
    #EXT-X-VERSION:3

    #EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
    v0/index.m3u8
    `;

      if (width >= RENDITIONS[1].maxW || height >= RENDITIONS[1].maxH) {
        content += `
    #EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=854x480
    v1/index.m3u8
    `;
      }

      if (width >= RENDITIONS[2].maxW || height >= RENDITIONS[2].maxH) {
        content += `
    #EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720
    v2/index.m3u8
    `;
      }

      await fs.writeFile(path.join(hlsDir, "master.m3u8"), content.trim());
}

  

export {
  startFFmpegWorker ,
  mergeUploadAsync
}