import fs from 'fs';
import path from 'path';
import {VideoUpload} from "../models/videoUpload.model.js";


const ResError = (res , statusCode , message) => {
  return res.status(statusCode).json({
      success : false ,
      message
  })
}
const ResSuccess = (res ,statusCode , data) => {
  res.status(statusCode).json({
      success: true,
      data: data
  })
} 

const TryCatch = (func , funcName ) => {
  return async function (req, res, next) {
      try {
          await func(req, res, next);
      } catch (error) {
          console.log(`Error in ${funcName}:`, error);
          return ResError(res, 500, `Internal Server Error`);
      } finally {
        
        if(Array.isArray( req.CreateMediaForDelete) && req.CreateMediaForDelete.length > 0){
          await Promise.allSettled(
            req.CreateMediaForDelete.map(f => fs.unlink(f.path).catch(err => console.error('Cleanup error:', err)))
          )
        }
      }
  }
}


const STORAGE_DIR = path.resolve("uploads/storage");

function mergeUploadAsync(uploadId) {
  console.log('merge initalized');
  
  setImmediate(async () => {
    try {
      console.log("merge started");
      const uploadDoc = await VideoUpload.findOne({ uploadId });
      if (!uploadDoc || uploadDoc.status !== "processing") return;

      const uploadDir = path.join(STORAGE_DIR, uploadId);
      const outputPath = path.join(uploadDir, "final.mp4");

      const writeStream = fs.createWriteStream(outputPath);

      for (let i = 0; i < uploadDoc.totalChunks; i++) {
        const chunkPath = path.join(uploadDir, `part-${i}`);
        const buffer = fs.readFileSync(chunkPath);
        writeStream.write(buffer);
      }

      writeStream.end();

      await new Promise((resolve) => writeStream.on("finish", resolve));

      // Integrity check
      const finalSize = fs.statSync(outputPath).size;
      if (finalSize !== uploadDoc.fileSize) {
        throw new Error("Final file size mismatch");
      }

      uploadDoc.status = "completed";
      uploadDoc.finalPath = outputPath;
      await uploadDoc.save();

      // Cleanup chunks
      for (let i = 0; i < uploadDoc.totalChunks; i++) {
        fs.unlinkSync(path.join(uploadDir, `part-${i}`));
      }

    } catch (err) {
      console.error("Merge failed:", err);
      await VideoUpload.updateOne(
        { uploadId },
        { status: "failed" ,}
      );
    }
  });
}




export { 
  TryCatch ,
  ResError ,
  ResSuccess ,
  mergeUploadAsync ,
}