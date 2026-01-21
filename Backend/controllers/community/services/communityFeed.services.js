import { Preferance } from '../../../models/prefrence.model.js';
import { getCommunityFeedAggregation } from '../db/communityFeed.db.js';

export const communityFeedService = async ({ userId, limit }) => {
  const prefs = await Preferance.find({ user: userId }).select('hashtags -_id');
  const hashtags = prefs.map(p => p.hashtags);

  return getCommunityFeedAggregation({
    userId,
    hashtags,
    limit,
  });
};
