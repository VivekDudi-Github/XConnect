import path from 'path';

export const CHUNK_SIZE = 1024 * 1024 * 1; // prod: *2
export const STORAGE_DIR = path.resolve('uploads/storage');

export const VIDEO_STATUSES = {
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  TRANSCODING: 'transcoding',
  COMPLETED: 'completed'
};
