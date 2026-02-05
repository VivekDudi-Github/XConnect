import { createPostSchema } from '../validator_Schema/Post.schema.js';
import { ResError } from '../../../utils/extra.js';
import moment from 'moment';
import {Community} from '../../../models/community.model.js';
import { ObjectId } from 'mongodb';

export const validateCreatePost = async (req, res) => {

  try {
    req.body = createPostSchema.parse(req.body);
  } catch (err) {
    return ResError(res, 400, err.issues[0].message); 
  }

  const {
    isCommunityPost,
    title,
    category,
    community,
    scheduledAt,
    repost,
  } = req.body;

  if (scheduledAt && moment(scheduledAt).isBefore(moment()))
    return ResError(res, 400, 'Past dates are not allowed.');

  if (repost && !ObjectId.isValid(repost))
    return ResError(res, 400, 'Invalid repost id.');

  if (isCommunityPost) {
    if (!title || !category)
      return ResError(res, 400, 'Title and category are required.');

    if (!ObjectId.isValid(community))
      return ResError(res, 400, 'Invalid community id.');

    const exists = await Community.exists({ _id: community });
    if (!exists) return ResError(res, 400, 'Invalid community id.');
  }

  return true;
};


