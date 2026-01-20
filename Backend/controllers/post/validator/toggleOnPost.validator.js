import { ObjectId } from 'mongodb';
import { ResError } from '../../../utils/extra.js';
import { findPostById, findUserPost } from '../db/toggleOnPost.db.js';

export const validateTogglePost = async (req, res) => {
  const { id } = req.params;
  const { option } = req.body;

  if (!ObjectId.isValid(id))
    return ResError(res, 400, 'Invalid post id.');

  if (!['pin', 'like', 'bookmark'].includes(option))
    return ResError(res, 400, 'Invalid option.');

  if (option === 'pin') {
    const post = await findUserPost(id, req.user._id);
    if (!post) return ResError(res, 404, 'Post not found.');
    req.post = post;
    return true;
  }

  const post = await findPostById(id);
  if (!post) return ResError(res, 404, 'Post not found.');

  req.post = post;
  return true;
};
