import fs from 'fs/promises';
import path from 'path';

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

const mergeChunks = async(uploadId , totalChunks , STORAGE_DIR , type) => {
  const outputPath = path.join(path.resolve('/uploads/processed') , `${uploadId}.${type}` )
  
  // path.join(STORAGE_DIR, uploadId, `${uploadId}.mp4`);
  const dir = path.join(STORAGE_DIR, uploadId);

  const writeStream = fs.createWriteStream(outputPath);

  for (let i = 0 ; i < totalChunks; i++) {
    const chunkPath = path.join(dir, `part-${i}`);
    const buffer = fs.readFileSync(chunkPath);
    writeStream.write(buffer);
  }

  writeStream.end();
}



export {
  TryCatch ,
  ResError ,
  ResSuccess ,
  mergeChunks ,
}