
import {spawn} from 'child_process' ;
import path from 'path';
import fs from 'fs';
import {VideoUpload} from '../../models/videoUpload.model.js' ;

const STORAGE_DIR = path.resolve('uploads/storage') ;

function startFFmpegWorker(uploadId ){
  console.log('FFmpeg worker started for uploadId:', uploadId);
  
  const uploadDir = path.join(STORAGE_DIR, uploadId);
  const inputPath = path.join(uploadDir, "final.mp4");
  const hlsDir = path.join(uploadDir, "hsl");

  fs.mkdirSync(hlsDir , {recursive: true}) ;

  const args = [
      "-y",
    "-i", inputPath,

    "-filter_complex",
    `[0:v]split=3[v360][v480][v720];
      [v360]scale=w=640:h=360:force_original_aspect_ratio=decrease,
            pad=ceil(iw/2)*2:ceil(ih/2)*2[v360out];
      [v480]scale=w=854:h=480:force_original_aspect_ratio=decrease,
            pad=ceil(iw/2)*2:ceil(ih/2)*2[v480out];
      [v720]scale=w=1280:h=720:force_original_aspect_ratio=decrease,
            pad=ceil(iw/2)*2:ceil(ih/2)*2[v720out]
          `
    .replace(/\n/g, ""),


    "-map", "[v360out]", "-map", "0:a:0",
    "-map", "[v480out]", "-map", "0:a:0",
    "-map", "[v720out]", "-map", "0:a:0",


    "-c:v", "libx264",
    "-c:a", "aac",
    "-profile:v", "main",
    "-preset", "veryfast",
    "-crf", "20",
    "-g", "48",
    "-keyint_min", "48",
    "-sc_threshold", "0",


    "-maxrate:v:0", "856k", "-bufsize:v:0", "1200k",
    "-maxrate:v:1", "1498k", "-bufsize:v:1", "2100k",
    "-maxrate:v:2", "2996k", "-bufsize:v:2", "4200k",


    "-f", "hls",
    "-hls_time", "6",
    "-hls_playlist_type", "vod",
    "-hls_flags", "independent_segments",
    "-hls_segment_filename", path.join(hlsDir, "v%v/segment_%03d.ts"),

    "-var_stream_map", "v:0,a:0 v:1,a:1 v:2,a:2",

    path.join(hlsDir, "v%v/index.m3u8")
  ];


  const ffmpeg = spawn("ffmpeg", args);

  ffmpeg.stderr.on("data", data => {
    console.log('::' , data.toString());
  });

  ffmpeg.on('error' , (err) => {
    console.log(`FFMPEG error for uploadId ${uploadId}:`, err);
    // VideoUpload.updateOne(
    //   { uploadId },
    //   { status: "failed" } ,
    // ) ;
  })

  ffmpeg.on("close", async (code) => {
    if (code === 0) {
      console.log('creating master playlist');
      
      // Create master playlist manually
      createMasterPlaylist(hlsDir);

      await VideoUpload.updateOne(
        { uploadId },
        { status: "completed", finalPath: `/uploads/storage/${uploadId}/hls/master.m3u8` }
      );
    } else {
      console.log('ffmpeg error:' , code);
      
      await VideoUpload.updateOne(
        { uploadId },
        { status: "failed" }
      );
    }
  });
}


function createMasterPlaylist(hlsDir) {
    const content = `#EXTM3U
  #EXT-X-VERSION:3

  #EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
  v0/index.m3u8

  #EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=854x480
  v1/index.m3u8

  #EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720
  v2/index.m3u8
  `;

    fs.writeFileSync(path.join(hlsDir, "master.m3u8"), content);
  }


export {
  startFFmpegWorker
}