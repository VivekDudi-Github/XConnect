import { TryCatch , ResError , ResSuccess } from '../../../utils/extra.js';
import { communityFeedSchema } from '../validator_schema/community.schema.js';
import { communityFeedService } from '../services/communityFeed.services.js';

export const communityFeed = TryCatch(async (req, res) => {
  const parsed = communityFeedSchema.safeParse({ query: req.query });
  if (!parsed.success) return ResError(res, 400, 'Invalid pagination');

  const posts = await communityFeedService({
    userId: req.user._id,
    page : parsed.data.query.page,
  });

  return ResSuccess(res, 200, posts);
}, 'CommunityFeed');
