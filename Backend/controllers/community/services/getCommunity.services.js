import {
  findCommunityById,
  isUserFollowingCommunity,
  countCommunityFollowers,
} from '../db/getCommunity.db.js';

export const getCommunityService = async ({
  communityId,
  userId,
}) => {
  const community = await findCommunityById(communityId);

  if (!community) {
    return null;
  }

  const [isFollowing, totalFollowers] = await Promise.all([
    isUserFollowingCommunity({ userId, communityId }),
    countCommunityFollowers(communityId),
  ]);

  return {
    ...community,
    isFollowing: Boolean(isFollowing),
    totalFollowers,
  };
};
