import { ResError } from '../../../utils/extra.js';
import { fetchFeedSchema } from '../validator_Schema/Post.schema.js';

export const validateFetchFeed = (req, res) => {
  try {
    const parsed = fetchFeedSchema.parse(req.query);

    req.feed = {
      tab: parsed.tab,
      page: parsed.page,
      limit: 10,
      skip: (parsed.page - 1) * 10,
    };

    return true;
  } catch (err) {
    return ResError(res, 400, err.errors[0].message);
  }
};
