import { TryCatch , ResError , ResSuccess } from "../utils/extra";
import { v4 as uuidv4 } from 'uuid';
import { VideoUpload } from '../models/videoUpload.model.js';
import fs from 'fs';
import path from 'path';

const chunkSize = 1024*100 ;
const STORAGE_DIR = path.join(__dirname , "uploads/storage/"); 

const InitVideoUpload = TryCatch(async(req , res) => {
  const {fileSize , fileType } = req.body ;
  const userId = req.user._id ;

  if(!fileSize || !fileType ) return ResError(res , 400 , 'Invalid request body.')
  if(isNaN(fileSize)) return ResError(res , 400 , 'invalid filesize type')

  const uploadId = uuidv4() ;

  let totalChunks = Math.ceil(fileSize/chunkSize) ;

  fs.mkdirSync(path.join(STORAGE_DIR, uploadId), { recursive: true });

  const videoUpload = await VideoUpload.create({
    uploadId ,
    user : userId ,
    uploadedChunks : [] ,
    totalChunks ,
    status : 'pending' ,
  })

  return ResSuccess(res , 200 , {uploadId , _id : videoUpload._id  , chunkSize , totalChunks}) ;
} , 'InitVideoUpload')

const uploadVideoChunk = TryCatch(async( req , res) => {
  const {uploadId , chunkIdx} = req.body ;

  
    const uploadDoc = await VideoUpload.findOne({ uploadId }); 
    if (!uploadDoc || uploadDoc.status !== "uploading") {
      return ResError(res , 400 , 'Invalid upload id');
    }

    if (chunkIdx < 0 || chunkIdx >= uploadDoc.totalChunks) { 
      return ResError(res , 400 , 'Invalid chunk index');
    }

    const chunkPath = path.join(
      STORAGE_DIR,
      uploadId,
      `part-${chunkIdx}`
    );
    
    if (!fs.existsSync(chunkPath)) {
      fs.writeFileSync(chunkPath, req.file.buffer);
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
  
  return ResSuccess(res , 200 , {status : uploadDoc.status , chunks : uploadDoc.uploadedChunks});
} , 'uploadStatusCheck')

export {
  InitVideoUpload ,
  uploadVideoChunk ,
  uploadStatusCheck
}