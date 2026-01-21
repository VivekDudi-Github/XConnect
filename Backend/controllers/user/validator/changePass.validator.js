import { ResError } from '../../../utils/extra.js';
import {  changePasswordSchema} from '../validator_schema/user.schema.js';


export const validateChangePassword = (req, res) => {
  try {
    req.body = changePasswordSchema.parse(req.body);
    return true;
  } catch (err) {
    return ResError(res, 400, err.errors[0].message);
  }
};