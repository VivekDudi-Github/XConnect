import { getCommunityPostsSchema } from '../validator_schema/community.schema.js';
import { ResError } from '../../../utils/extra.js';
export const validateGetCommunityPosts = (req, res) => {
  try {
    const parsed = getCommunityPostsSchema.parse({
      params: req.params,
      query: req.query,
    });

    req.params = parsed.params;
    req.query = parsed.query;

    return true;
  } catch (err) {
    return ResError(res, 400, err.errors[0].message);
  }
};
