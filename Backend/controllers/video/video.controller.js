import * as videoService from './video.service.js';

export const InitVideoUpload = TryCatch(async (req, res) => {
  const result = await videoService.initUpload({
    userId: req.user._id,
    ...req.body
  });

  return ResSuccess(res, 200, result);
}, 'InitVideoUpload');

export const uploadVideoChunk = TryCatch(async (req, res) => {
  await videoService.uploadChunk({
    ...req.body,
    buffer: req.file.buffer
  });

  return ResSuccess(res, 200, null);
}, 'uploadVideoChunk');

export const uploadStatusCheck = TryCatch(async (req, res) => {
  const result = await videoService.getUploadStatus(req.params.public_id);
  return ResSuccess(res, 200, result);
}, 'uploadStatusCheck');

export const verifyUpload = TryCatch(async (req, res) => {
  const result = await videoService.verifyUpload(req.params.public_id);
  return ResSuccess(res, 200, result);
}, 'verifyUpload');
