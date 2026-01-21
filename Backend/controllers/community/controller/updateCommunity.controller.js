import { TryCatch , ResError , ResSuccess } from '../../../utils/extra.js';
import { updateCommunitySchema } from '../validator_schema/community.schema.js';
import { updateCommunityService } from '../services/updateCommunity.services.js';


export const updateCommunity = TryCatch(async (req, res) => {
  const parsed = updateCommunitySchema.safeParse({
    params: req.params,
    body: req.body,
  });

  if (!parsed.success) {
    return ResError(res, 400, parsed.error.errors[0].message);
  }

  const { id } = parsed.data.params;
  const updates = parsed.data.body;
  const files = req.files;

  if (
    !Object.keys(updates).length &&
    !files?.avatar &&
    !files?.banner
  ) {
    return ResError(res, 400, 'At least one field must be updated');
  }

  try {
    await updateCommunityService({
      communityId: id,
      updates,
      files,
    });

    return ResSuccess(res, 200, 'Community updated successfully');
  } catch (err) {
    if (err.message === 'NOT_FOUND') {
      return ResError(res, 404, 'Invalid community id');
    }
    throw err;
  }
}, 'updateCommunity');
