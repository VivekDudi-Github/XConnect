import {ResError , ResSuccess , TryCatch } from '../../../utils/extra.js';
import { validateDeletePost } from '../validator/deletePost.validator.js';
import { deletePostService } from '../services/deletePost.services.js';

export const deletePost = TryCatch(async (req, res) => {
  const valid = await validateDeletePost(req, res);
  if (!valid) return;

  await deletePostService({
    post: req.post,
  });

  return ResSuccess(res, 200, 'Post deleted successfully.');
}, 'DeletePost');
