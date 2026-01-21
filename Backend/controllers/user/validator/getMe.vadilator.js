import { ResError } from '../../../utils/extra.js';
import { getMeSchema } from '../validator_schema/user.schema.js';

export const validateGetMe = (req, res) => {
  try {
    getMeSchema.parse({ userId: req.user?._id?.toString() });
    return true;
  } catch (err) {
    return ResError(res, 401, err.errors[0].message);
  }
};
