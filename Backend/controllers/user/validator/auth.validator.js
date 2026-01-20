import { ResError } from '../../../utils/extra.js';
import { loginSchema } from '../validator_schema/user.schema.js';

export const validateLoginBody = (req, res) => {
  try {
    req.body = loginSchema.parse(req.body);
    return true;
  } catch (err) {
    return ResError(res, 400, err.errors[0].message);
  }
};
