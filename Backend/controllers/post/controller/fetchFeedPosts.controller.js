import { TryCatch , ResSuccess } from '../../../utils/extra.js';
import { validateFetchFeed } from '../validator/fetchFeedPosts.validator.js'
import { fetchFeedService } from '../services/fetchFeedPosts.services.js';

export const fetchFeedPost = TryCatch(async (req, res) => {
  const valid = validateFetchFeed(req, res);
  if (!valid) return;  
  const posts = await fetchFeedService({
    user: req.user,
    ...req.query,
  });

  return ResSuccess(res, 200, posts);
}, 'FetchFeedPosts');
