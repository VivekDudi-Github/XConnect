import {VideoUpload} from '../../models/videoUpload.model.js'

export const createUpload = (data) => {
  return VideoUpload.create(data);
};

export const findByPublicId = (public_id) => {
  return VideoUpload.findOne({ public_id });
};

export const saveUpload = (doc) => doc.save();
