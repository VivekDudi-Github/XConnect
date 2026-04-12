import { getCommunityPostsSchema } from '../validator_schema/community.schema.js';
import { ResError } from '../../../utils/extra.js';
export const validateGetCommunityPosts = (req, res) => {
  try {
    const parsed = getCommunityPostsSchema.parse({
      params: req.params,
      query: req.query,
    });

    req.parsedParams = parsed.params;
    req.parsedQuery = parsed.query;

    return true;
  } catch (err) {
    throw err ;
  }
};
