import { ResError } from '../../../utils/extra.js';
import {
  deleteUserSchema,
} from '../validator_schema/user.schema.js';

export const validateDeleteUser = (req, res) => {
  try {
    req.body = deleteUserSchema.parse(req.body);
    return true;
  } catch (err) {
    throw err
  }
};