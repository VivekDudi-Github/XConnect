import { ObjectId } from 'mongodb';
import { ResError } from '../../../utils/extra.js';
import { getPostMeta } from '../db/getPost.db.js';

export const validateGetPost = async (req, res) => {
  const { id } = req.params;

  if (!id) return ResError(res, 400, 'Post ID is required.');
  if (!ObjectId.isValid(id)) return ResError(res, 400, 'Invalid Post ID.');

  const post = await getPostMeta(id);
  if (!post || post.isDeleted)
    return ResError(res, 404, 'Post not found.');

  if (
    !post.author.equals(req.user._id) &&
    post.scheduledAt &&
    new Date(post.scheduledAt).getTime() < Date.now()
  ) {
    return ResError(res, 403, 'The post is private.');
  }

  req.postMeta = post;
  return true;
};
