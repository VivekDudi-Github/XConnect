import { fetchFeedPostsDB ,getUserPreferences } from '../db/fetchFeedPosts.db.js';
let limit = 10 ;

export const fetchFeedService = async ({ user ,page , tab }) => {
  const userId = user._id;
  
  let skip = (page - 1) * limit;

  const preferences = await getUserPreferences(userId);
  const hashtags = preferences.map(p => p.hashtags);

  const timeAgo = new Date();
  timeAgo.setDate(timeAgo.getDate() - 60);
  console.log('Fetching feed posts with the following parameters:' ,page , skip);
  return fetchFeedPostsDB({
    userId,
    hashtags,
    timeAgo,
    tab , 
    skip , 
    limit, 
  });
};
