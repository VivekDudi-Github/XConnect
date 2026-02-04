import { ResError } from '../../../utils/extra.js';
import { getCommunitySchema } from '../validator_schema/community.schema.js';

export const validateGetCommunity = (req, res) => {
  try {
    req.params = getCommunitySchema.parse(req.params);
    return true;
  } catch (err) {
    throw err ;
  }
};
