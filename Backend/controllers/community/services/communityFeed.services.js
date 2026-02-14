import { Preferance } from '../../../models/prefrence.model.js';
import { getCommunityFeedAggregation } from '../db/communityFeed.db.js';

let limit = 2;
export const communityFeedService = async ({ userId , page}) => {
  const prefs = await Preferance.find({ user: userId }).select('hashtags -_id');
  const hashtags = prefs.map(p => p.hashtags);
  
  const skip = (page-1) * limit ;

  return getCommunityFeedAggregation({
    userId,
    hashtags,
    limit,
    skip,
  });
};
