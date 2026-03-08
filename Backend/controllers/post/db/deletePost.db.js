import {Post} from '../../../models/post.model.js';
import {VideoUpload} from '../../../models/videoUpload.model.js';

export const findPostById = (id) => Post.findById(id);

export const softDeletePost = async (post) => {
  post.isDeleted = true;
  await post.save();
};

export const getThumbnails = async (videoIds) => {
  return VideoUpload.find({ public_id : {$in : videoIds.map(i => i.public_id) }} ).select('poster -_id');
}
