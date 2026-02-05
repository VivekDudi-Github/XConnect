import { ResError } from '../../../utils/extra.js';
import { findPostById } from '../db/deletePost.db.js';
import { ObjectId } from 'mongodb';

export const validateDeletePost = async (req, res) => {
  const { id } = req.params;

  if (!id) return ResError(res, 400, 'Post ID is required.');

  if (!ObjectId.isValid(id))
    return ResError(res, 400, 'Invalid Post ID.');

  const post = await findPostById(id);
  if (!post) return ResError(res, 404, 'Post not found.');
  
  if (!post.author.equals(req.user._id))
    return ResError(res, 403, 'You are not authorized to delete this post.');

  req.post = post;

  return true;
};
