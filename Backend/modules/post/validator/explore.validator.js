import { ResError } from '../../../utils/extra.js';
import {exploreQuerySchema} from '../validator_Schema/Post.schema.js';

export const validateExploreQuery = (req, res) => {
  try {
    req.queries = exploreQuerySchema.parse(req.query);
    return true;
  } catch (err) {
    throw err ;
  }
};


