import fsSync from 'fs';
import fs from 'fs/promises'
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import {
  CHUNK_SIZE,
  STORAGE_DIR,
  VIDEO_STATUSES
} from '../../constants/video.constant.js';

import * as videoRepo from './video.db.js';
import { enqueueMerge } from "../../utils/mergeQueue.js";
import ApiError from '../../utils/ApiError.js';

export const initUpload = async ({ userId, fileSize, fileType }) => {
  const public_id = uuidv4();
  const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);
  if(fileSize > 1024 * 1024 * 25) return ApiError(400, 'File size exceeds the maximum allowed limit of 25 MB');

  await fs.mkdir(path.join(STORAGE_DIR, public_id), { recursive: true });
  console.log('init upload', totalChunks , fileSize, CHUNK_SIZE);
  
  const upload = await videoRepo.createUpload({
    public_id,
    user: userId,
    fileSize,
    fileType,
    uploadedChunks: [],
    totalChunks,
    status: VIDEO_STATUSES.UPLOADING
  });
  console.log(totalChunks, 'total chunks for the upload');  
  return {
    public_id,
    _id: upload._id,
    chunkSize: CHUNK_SIZE,
    totalChunks
  };
};

export const uploadChunk = async ({ public_id, chunkIdx, buffer }) => {
  const uploadDoc = await videoRepo.findByPublicId(public_id);

  if (!uploadDoc || uploadDoc.status !== VIDEO_STATUSES.UPLOADING) {
    throw new ApiError(400, 'Invalid upload id');
  }

  if (chunkIdx >= uploadDoc.totalChunks) {
    throw new ApiError(400, 'Invalid chunk index');
  }

  if (uploadDoc.uploadedChunks.includes(chunkIdx)) return;

  const chunkPath = path.join(
    STORAGE_DIR,
    public_id,
    `part-${chunkIdx}`
  );

  if (!fsSync.existsSync(chunkPath)) {
    await fs.writeFile(chunkPath, buffer);
    uploadDoc.uploadedChunks.push(chunkIdx);
    await videoRepo.saveUpload(uploadDoc);
  }
};

export const getUploadStatus = async (public_id) => {
  const uploadDoc = await videoRepo.findByPublicId(public_id);
  if (!uploadDoc) throw new ApiError(404, 'Upload not found');

  return {
    status: uploadDoc.status,
    totalChunks: uploadDoc.totalChunks,
    chunks: uploadDoc.uploadedChunks,
    size: uploadDoc.fileSize
  };
};

export const verifyUpload = async (public_id) => {
  const uploadDoc = await videoRepo.findByPublicId(public_id);

  if (!uploadDoc) throw new ApiError(400, 'Upload not found');
  if (uploadDoc.status === VIDEO_STATUSES.COMPLETED) return 'Video verified successfully';
  if (uploadDoc.status !== VIDEO_STATUSES.UPLOADING) {
    throw new ApiError(400, 'Invalid upload state');
  }

  const missingChunks = new Set();
  console.log(uploadDoc.totalChunks, 'total chunks for the upload');
  for (let i = 0; i < uploadDoc.totalChunks; i++) {
    const chunkPath = path.join(STORAGE_DIR, public_id, `part-${i}`);

    if (!fsSync.existsSync(chunkPath)) {
      missingChunks.add(i);
      uploadDoc.uploadedChunks.pull(i);
      continue;
    }

    const size = (await fs.stat(chunkPath)).size;

    if (
      (i < uploadDoc.totalChunks - 1 && size !== CHUNK_SIZE) ||
      (i === uploadDoc.totalChunks - 1 &&
        size !== uploadDoc.fileSize - CHUNK_SIZE * (uploadDoc.totalChunks - 1))
    ) {
      await fs.unlink(chunkPath);
      uploadDoc.uploadedChunks.pull(i);
      missingChunks.add(i);
    }
  }
  console.log(missingChunks, 'missing chunks after verification');
  if (missingChunks.size === 0) {
    uploadDoc.status = VIDEO_STATUSES.PROCESSING;
    await videoRepo.saveUpload(uploadDoc);
    enqueueMerge({ public_id });
    return 'Video verified successfully';
  }

  await videoRepo.saveUpload(uploadDoc);
  return {
    status: VIDEO_STATUSES.UPLOADING,
    missingChunks: [...missingChunks]
  };
};

export const getVideoDetails = async (public_id) => {
  const uploadDoc = await videoRepo.findByPublicId(public_id);
  
  if(!uploadDoc) throw new ApiError(404 ,'Video not found'); 

  return uploadDoc;
};
