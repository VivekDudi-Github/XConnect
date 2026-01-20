import {Post} from '../../../models/post.model.js';

export const findPostById = (id) => Post.findById(id);

export const softDeletePost = async (post) => {
  post.isDeleted = true;
  await post.save();
};
