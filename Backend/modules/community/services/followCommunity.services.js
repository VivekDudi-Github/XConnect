import {
  getUserFollowedCommunities,
  getCommunityCreator,
  findFollowRelation,
  createFollow,
  removeFollow,
} from '../db/followCommunity.db.js';

export const getFollowingCommunitiesService = async (userId) => {
  const followings = await getUserFollowedCommunities(userId);
  return followings.map(f => f.followingCommunity);
};

export const toggleFollowCommunityService = async ({
  userId,
  communityId,
}) => {
  const community = await getCommunityCreator(communityId);
  if (!community) throw new Error('Community not found');

  if (community.creator.equals(userId)) {
    throw new Error('SELF_FOLLOW');
  }

  const exists = await findFollowRelation({ userId, communityId });

  if (exists) {
    await removeFollow({ userId, communityId });
    return { operation: false };
  }

  await createFollow({ userId, communityId });
  return { operation: true };
};
