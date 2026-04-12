import {Post} from '../../../models/post.model.js';

export const findEditablePostById = (id) =>
  Post.findById(id).NoDelete();

export const saveEditedPost = async (post, updates) => {
  Object.assign(post, updates);
  await post.save();
};
