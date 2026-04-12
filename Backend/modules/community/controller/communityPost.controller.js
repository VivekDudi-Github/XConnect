import { TryCatch , ResError , ResSuccess } from '../../../utils/extra.js';
import { validateGetCommunityPosts } from '../validator/communityPost.validator.js';
import { getCommunityPostsService } from '../services/communityPost.services.js';

export const GetCommunityPosts = TryCatch(async (req, res) => {
  const valid = validateGetCommunityPosts(req, res);
  if (valid !== true) return;

  const { id } = req.parsedParams;
  const { page } = req.parsedQuery;
  const result = await getCommunityPostsService({
    communityId: id,
    page,
  });

  return ResSuccess(res, 200, result);
}, 'GetCommunityPosts');
