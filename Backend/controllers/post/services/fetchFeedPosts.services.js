import { fetchFeedPostsDB ,getUserPreferences } from '../db/fetchFeedPosts.db.js';
let limit = 10 ;

export const fetchFeedService = async ({ user ,page , tab }) => {
  const userId = user._id;
  
  let skip = (page - 1) * limit;

  const preferences = await getUserPreferences(userId);
  const hashtags = preferences.map(p => p.hashtags);

  const timeAgo = new Date();
  timeAgo.setDate(timeAgo.getDate() - 7);

  return fetchFeedPostsDB({
    userId,
    hashtags,
    timeAgo,
    tab , 
    skip , 
    limit, 
  });
};
