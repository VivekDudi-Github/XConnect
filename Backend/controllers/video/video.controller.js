import { TryCatch, ResSuccess } from '../../utils/extra.js';
import * as videoService from './video.services.js';
import { validate } from '../../middlewares/validate.js'; 
import * as schema from './video.validator.js';

export const InitVideoUpload = TryCatch(async (req, res) => {
  validate(schema.initVideoUploadSchema, req);
  const result = await videoService.initUpload({
    userId: req.user._id,
    ...req.body
  });

  return ResSuccess(res, 200, result);
}, 'InitVideoUpload');

export const uploadVideoChunk = TryCatch(async (req, res) => {
  console.log(req?.body , req?.params , req?.query);
  
  validate(schema.uploadChunkSchema , req)
  await videoService.uploadChunk({
    ...req.body,
    buffer: req.file.buffer
  });

  return ResSuccess(res, 200, null);
}, 'uploadVideoChunk');

export const uploadStatusCheck = TryCatch(async (req, res) => {
  validate(schema.publicIdParamSchema, req);
  const result = await videoService.getUploadStatus(req.params.public_id);
  return ResSuccess(res, 200, result);
}, 'uploadStatusCheck');

export const verifyUpload = TryCatch(async (req, res) => {
  validate(schema.publicIdParamSchema, req);
  const result = await videoService.verifyUpload(req.params.public_id);
  return ResSuccess(res, 200, result);
}, 'verifyUpload');
