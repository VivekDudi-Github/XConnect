import { TryCatch , ResError , ResSuccess } from '../../../utils/extra.js';
import { validateCreateCommunity } from '../validator/community.validator.js';
import { createCommunityService } from '../services/createCommunity.services.js';


export const CreateCommunity = TryCatch(async (req, res) => {
  const valid = validateCreateCommunity(req, res);
  if (!valid) return;

  try {
    const community = await createCommunityService({
      userId: req.user._id,
      body: req.body,
      files: req.files,
    });

    return ResSuccess(res, 201, community);
  } catch (err) {
    return ResError(res, 500, 'Community could not be created');
  }
}, 'CreateCommunity');
