import { TryCatch ,ResError , ResSuccess  } from '../../../utils/extra.js';
import { validateTogglePost } from '../validator/toggleOnPost.validator.js';
import {
  togglePinService,
  toggleLikeService,
  toggleBookmarkService,
} from '../services/toggleOnPost.services.js';
import { Post } from '../../../models/post.model.js';
import { postIdParamSchema } from '../validator_Schema/Post.schema.js'; 

export const toggleOnPost = TryCatch(async (req, res) => {
  const valid = await validateTogglePost(req, res);
  if (valid !== true) return;

  const { option } = req.body;

  let operation;

  if (option === 'pin') {
    operation = await togglePinService({ post: req.post });
  }

  if (option === 'like') {
    operation = await toggleLikeService({
      post: req.post,
      user: req.user,
    });
  }

  if (option === 'bookmark') {
    operation = await toggleBookmarkService({
      postId: req.post._id,
      userId: req.user._id,
    });
  }

  return ResSuccess(res, 200, { operation });
}, 'ToggleOnPost');

export const increasePostViews = TryCatch(async (req, res) => {
  const valid = postIdParamSchema.parse(req.params);
  if (valid !== true) return;

  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: false }
  );

  if (!post) return ResError(res, 404, 'Post not found.');

  return ResSuccess(res, 200, null);
}, 'IncreasePostViews');