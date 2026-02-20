import { ResError , ResSuccess , TryCatch } from '../../../utils/extra.js';
import { validateGetUserPosts } from '../validator/getUserPosts.validator.js'; 
import { getUserPostsService } from '../services/getUserPosts.services.js';
let limit = 10;

export const getUserPosts = TryCatch(async (req, res) => {
  const valid = await validateGetUserPosts(req, res);
  if (valid !== true) return;

  const {
    page = 1,
    tab = 'Posts',
  } = req.query;

  const skip = (page - 1) * limit;

  let data;
  try {
    data = await getUserPostsService({
      tab,
      viewerId: req.user._id,
      authorId: req.targetUserId,
      limit: Number(limit),
      skip,
    });
  } catch (err) {
    if (err.message === 'INVALID_TAB') {
      return ResError(res, 400, 'Invalid tab option provided.');
    }
    throw err;
  }

  if (!data || !data.posts?.length) {
    return ResSuccess(res, 200, { posts: [], totalPages: 0 });
  }

  return ResSuccess(res, 200, {
    posts: data.posts,
    totalPages: data.totalPages,
  });
}, 'GetUserPosts');
