import { ResError } from '../../../utils/extra.js';
import {exploreQuerySchema} from '../validator_Schema/Post.schema.js';

export const validateExploreQuery = (req, res) => {
  try {
    req.query = exploreQuerySchema.parse(req.query);
    return true;
  } catch (err) {
    return ResError(res, 400, err.errors[0].message);
  }
};


