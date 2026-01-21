import { ResError } from '../../../utils/extra.js';
import { updateUserSchema } from '../validator_schema/user.schema.js';

export const validateUpdateUser = (req, res) => {
  try {
    req.body = updateUserSchema.parse(req.body);
    return true;
  } catch (err) {
    return ResError(res, 400, err.errors[0].message);
  }
};
