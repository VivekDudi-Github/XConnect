import { ResError } from '../../../utils/extra.js';
import { registerSchema } from '../validator_schema/user.schema.js' ;

export const validateRegisterBody = (req, res) => {
  try {
    req.body = registerSchema.parse(req.body);
    return true;
  } catch (err) {
    throw err ;
  }
};
