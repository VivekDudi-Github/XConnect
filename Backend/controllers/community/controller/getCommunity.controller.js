import { TryCatch , ResError , ResSuccess } from '../../../utils/extra.js';

import { validateGetCommunity } from '../validator/getCommunity.validator.js';
import { getCommunityService } from '../services/getCommunity.services.js';

export const GetCommunity = TryCatch(async (req, res) => {
  const valid = validateGetCommunity(req, res);
  if (valid !== true) return;

  const { id } = req.params;

  const community = await getCommunityService({
    communityId: id,
    userId: req.user._id,
  });

  if (!community) {
    return ResError(res, 404, 'Community not found');
  }

  return ResSuccess(res, 200, community);
}, 'GetCommunity');
