import { editPostSchema } from '../validator_Schema/Post.schema.js'
import { ResError } from '../../../utils/extra.js';
import { ObjectId } from 'mongodb';
import { findEditablePostById } from '../db/editPost.db.js';

export const validateEditPost = async (req, res) => {
  const { id } = req.params;

  if (!id) return ResError(res, 400, 'Post ID is required.');
  if (!ObjectId.isValid(id))
    return ResError(res, 400, 'Invalid Post ID.');

  try {
    req.body = editPostSchema.parse(req.body);
  } catch (err) {
    return ResError(res, 400, err.errors[0].message);
  }

  const media = req.files?.media || [];
  if (!Array.isArray(media))
    return ResError(res, 400, "Media's data is invalid.");

  const post = await findEditablePostById(id);
  if (!post) return ResError(res, 404, 'Post not found.');

  if (!post.author.equals(req.user._id))
    return ResError(res, 403, 'You are not authorized to edit this post.');

  req.post = post;
  req.media = media;

  return true;
};
