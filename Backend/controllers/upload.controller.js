import { TryCatch , ResError , ResSuccess, mergeUploadAsync } from "../utils/extra.js";
import { v4 as uuidv4 } from 'uuid';
import { VideoUpload } from '../models/videoUpload.model.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from "url"; 



const CHUNK_SIZE = 1024*1024*2 ; // for production - 1024*1024*2 ; 
const STORAGE_DIR = path.resolve("uploads/storage");
 

const InitVideoUpload = TryCatch(async(req , res) => {
  const {fileSize , fileType } = req.body ;
  const userId = req.user._id ;
  console.log(fileSize , fileType);
  
  if(!fileSize || !fileType ) return ResError(res , 400 , 'Invalid request body.')
  if(isNaN(fileSize)) return ResError(res , 400 , 'invalid filesize type')

  if(!['video'].includes(fileType)) return ResError(res , 400 , 'Invalid File type') ; 

  const uploadId = uuidv4() ;

  let totalChunks = Math.ceil(fileSize/CHUNK_SIZE) ;

  console.log(path.join(STORAGE_DIR, uploadId) , 'join');
  
  fs.mkdirSync(path.join(STORAGE_DIR, uploadId), { recursive: true });

  const videoUpload = await VideoUpload.create({
    uploadId ,
    user : userId ,
    fileSize ,
    fileType ,
    uploadedChunks : [] ,
    totalChunks ,
    status : 'uploading' , // uploading > processing > completed
  })

  return ResSuccess(res , 200 , {uploadId , _id : videoUpload._id  , chunkSize : CHUNK_SIZE , totalChunks}) ;
} , 'InitVideoUpload')


const uploadVideoChunk = TryCatch(async( req , res) => {
  const {uploadId , chunkIdx} = req.body ;
  if(!req.file.buffer) return ResError(res , 400 , 'Invalid request body.');

  const uploadDoc = await VideoUpload.findOne({ uploadId : uploadId }); 
  
  if (!uploadDoc || uploadDoc.status !== "uploading") return ResError(res , 400 , 'Invalid upload id');
  
  if (chunkIdx < 0 || chunkIdx >= uploadDoc.totalChunks) return ResError(res , 400 , 'Invalid chunk index');
  if(uploadDoc.uploadedChunks.includes(chunkIdx)) return ResSuccess(res , 200 , 'Chunk already uploaded');

  const chunkPath = path.join(
    STORAGE_DIR,
    uploadId,
    `part-${chunkIdx}`
  );
  
  if (!fs.existsSync(chunkPath)) {
    await fs.promises.writeFile(chunkPath, req.file.buffer);
    uploadDoc.uploadedChunks.push(chunkIdx);
    await uploadDoc.save();
  }
  return ResSuccess(res , 200 , null);
} , 'uploadVideoChunk')



const uploadStatusCheck = TryCatch(async(req , res) => {
  const {uploadId} = req.params ;
  
  const uploadDoc = await VideoUpload.findOne({ uploadId });
  
  if (!uploadDoc) {
    return ResError(res , 404 , 'Upload Not Found');
  }
  
  return ResSuccess(res , 200 , {
    status : uploadDoc.status , 
    totalChunks : uploadDoc.totalChunks , 
    chunks : uploadDoc.uploadedChunks ,
    size : uploadDoc.fileSize ,
  });
} , 'uploadStatusCheck')



const verifyUpload = TryCatch(async(req , res) => {
  const { uploadId } = req.params;
  console.log('verifying..');
  

  const uploadDoc = await VideoUpload.findOne({ uploadId });
  if (!uploadDoc) return ResError(res, 400, "Upload Not found");

  if (uploadDoc.status === "completed")
    return ResSuccess(res, 200, "Video already uploaded");

  if (uploadDoc.status !== "uploading")
    return ResError(res, 400, "Invalid upload state");


  let totalChunks = uploadDoc.totalChunks ;
  let missingChunks = new Set() ;

  for (let i = 0; i < totalChunks; i++) {
    const chunkPath = path.join(STORAGE_DIR, uploadId, `part-${i}`);

    if (!fs.existsSync(chunkPath)) {
      missingChunks.add(i);
      uploadDoc.uploadedChunks.pull(i);
      continue;
    }

    const size = fs.statSync(chunkPath).size;

    if (i < totalChunks - 1 && size !== CHUNK_SIZE) {
      console.log(i , size , CHUNK_SIZE);
      
      missingChunks.add(i);
      uploadDoc.uploadedChunks.pull(i);
      fs.unlinkSync(chunkPath);
      continue;
    }

    if (i === totalChunks - 1) {
      const expectedLastChunkSize =
        uploadDoc.fileSize - CHUNK_SIZE * (totalChunks - 1);
      console.log(i , size , expectedLastChunkSize);
      

      if (size !== expectedLastChunkSize) {
        missingChunks.add(i);
        uploadDoc.uploadedChunks.pull(i);
        fs.unlinkSync(chunkPath);
        continue;
      }
    }

    if (!uploadDoc.uploadedChunks.includes(i)) {
      uploadDoc.uploadedChunks.push(i);
    }
  }
  
  if(missingChunks.size === 0) {
    uploadDoc.status = 'processing' ;
    mergeUploadAsync(uploadId) ;
    await uploadDoc.save();
    return ResSuccess(res , 200 , 'Video has been verified successfully.');
  }

  await uploadDoc.save();
  return ResSuccess(res , 200 , {status : 'uploading' , missingChunks : Array.from(missingChunks) }); 
} , 'verifyUpload') ;

export {
  InitVideoUpload ,
  uploadVideoChunk ,
  uploadStatusCheck ,
  verifyUpload ,
}