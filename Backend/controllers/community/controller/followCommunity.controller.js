import { TryCatch, ResError , ResSuccess } from '../../../utils/extra.js';
import { toggleFollowCommunityService, getFollowingCommunitiesService } from '../services/followCommunity.services.js';
import { followCommunitySchema } from '../validator_schema/community.schema.js';

export const getFollowingCommunities = TryCatch(async (req, res) => {
  const communities = await getFollowingCommunitiesService(req.user._id);
  return ResSuccess(res, 200, communities);
}, 'GetFollowingCommunities');

export const followCommunity = TryCatch(async (req, res) => {
  const parsed = followCommunitySchema.safeParse({ params: req.params });
  if (!parsed.success) return ResError(res, 400, parsed.error.errors[0].message);

  try {
    const result = await toggleFollowCommunityService({
      userId: req.user._id,
      communityId: parsed.data.params.id,
    });

    return ResSuccess(res, 200, {operation : result.operation});
  } catch (err) {
    if (err.message === 'SELF_FOLLOW') {
      return ResError(res, 400, 'You cannot unfollow your own community.');
    }
    throw err;
  }
}, 'FollowCommunity');
