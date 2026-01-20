import { fetchFeedPostsDB ,getUserPreferences } from '../db/fetchFeedPosts.db.js';


export const fetchFeedService = async ({ user }) => {
  const userId = user._id;

  const preferences = await getUserPreferences(userId);
  const hashtags = preferences.map(p => p.hashtags);

  const timeAgo = new Date();
  timeAgo.setDate(timeAgo.getDate() - 7);

  return fetchFeedPostsDB({
    userId,
    hashtags,
    timeAgo,
  });
};
