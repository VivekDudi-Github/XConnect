import { TryCatch , ResSuccess } from '../../../utils/extra.js';
import {validateExploreQuery} from '../validator/explore.validator.js';
import { fetchExploreService } from '../services/explore.services.js';

export const fetchExplorePost = TryCatch(async (req, res) => {
  const valid = validateExploreQuery(req, res);
  if (valid !== true) return;

  const { tab, page } = req.query;

  const posts = await fetchExploreService({
    tab,
    page,
    userId: req.user._id,
  });

  return ResSuccess(res, 200, posts);
}, 'FetchExplorePosts');


