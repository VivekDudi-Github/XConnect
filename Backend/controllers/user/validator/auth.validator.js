import ApiError from '../../../utils/ApiError.js';
import { loginSchema } from '../validator_schema/user.schema.js';

export const validateLoginBody = (req, res) => {
  try {
    if(req.body.email === undefined && req.body.username === undefined) {
      return new ApiError(400 ,'Email or Username is required');
    }
    req.body = loginSchema.parse(req.body);
    return true;
  } catch (err) {
    throw err ;
  }
};
