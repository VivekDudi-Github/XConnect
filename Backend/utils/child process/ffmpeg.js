import {spawn , execFile} from 'child_process' ;
import path from 'path';
import fs from 'fs';
import {VideoUpload} from '../../models/videoUpload.model.js' ;

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


function probeVideo(inputPath) {
  return new Promise((resolve, reject) => {
    execFile(
      "ffprobe",
      [
        "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height",
        "-of", "json",
        inputPath
      ],
      (err, stdout) => {
        if (err) return reject(err);
        const data = JSON.parse(stdout);
        const { width, height } = data.streams[0];
        resolve({ width, height });
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

async function startFFmpegWorker(uploadId ){
  console.log('FFmpeg worker started for uploadId:', uploadId);
  
  const uploadDir = path.join(STORAGE_DIR, uploadId);
  const inputPath = path.join(uploadDir, "final.mp4");
  const hlsDir = path.join(uploadDir, "hsl");
  
  // console.log(fs.statSync(inputPath));
  
  fs.mkdirSync(hlsDir , {recursive: true}) ;
  
  const probe = await probeVideo(inputPath);
  const args = buildFfmpegArgs(inputPath, hlsDir, probe);
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
      createMasterPlaylist(hlsDir , probe);

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


function createMasterPlaylist(hlsDir , probe) {
  const {height , width} = probe ;
    const content = `#EXTM3U
  #EXT-X-VERSION:3

  #EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
  v0/index.m3u8

  ${width >= RENDITIONS[1].maxW || height >= RENDITIONS[1].maxH ? `#EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=854x480 v1/index.m3u8` : '' }

  ${width >= RENDITIONS[1].maxW || height >= RENDITIONS[1].maxH ? `#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720  v2/index.m3u8` : '' }

  `;

  fs.writeFileSync(path.join(hlsDir, "master.m3u8"), content);
  }


export {
  startFFmpegWorker
}