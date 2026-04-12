import { getAnotherUserSchema } from '../validator_schema/user.schema.js';
import { ResError } from '../../../utils/extra.js';

export const validateGetAnotherUser = (req, res) => {
  try {
    req.params = getAnotherUserSchema.parse(req.params);
    return true;
  } catch (err) {
    return ResError(res, 400, err.issues[0].message);
  }
};
