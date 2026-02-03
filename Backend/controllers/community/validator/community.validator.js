import { ResError } from '../../../utils/extra.js';
import { createCommunitySchema } from '../validator_schema/community.schema.js';

export const validateCreateCommunity = (req, res) => {
  try {
    req.body = createCommunitySchema.parse(req.body);

    if (!req.files?.avatar?.length && process.env.NODE_ENV !== 'TEST') {
      return ResError(res, 400, 'Avatar is required');
    }

    if (!req.files?.banner?.length && process.env.NODE_ENV !== 'TEST') {
      return ResError(res, 400, 'Banner is required');
    }

    return true;
  } catch (err) {
    throw err ;
  }
};
