import {
  fetchTrendingDB,
  fetchPeopleDB,
} from '../db/explore.db.js';

export const fetchExploreService = async ({
  tab,
  page,
  userId,
}) => {
  const skip = (page - 1) * 10;

  if (tab === 'People') {
    return fetchPeopleDB({ skip, userId });
  }

  return fetchTrendingDB({ tab, skip, userId });
};
