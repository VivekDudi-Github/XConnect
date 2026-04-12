import { Following } from "../../../models/following.model.js";
import { Community } from "../../../models/community.model.js";

export const getUserFollowedCommunities = (userId) => {
  return Following.find({
    followedBy: userId,
    followingCommunity: { $exists: true },
  })
    .select('followingCommunity')
    .populate('followingCommunity', 'name avatar')
    .lean();
};

export const getCommunityCreator = (communityId) => {
  return Community.findById(communityId).select('creator');
};

export const findFollowRelation = ({ userId, communityId }) => {
  return Following.exists({
    followedBy: userId,
    followingCommunity: communityId,
  });
};

export const createFollow = ({ userId, communityId }) => {
  return Following.create({
    followedBy: userId,
    followingCommunity: communityId,
  });
};

export const removeFollow = ({ userId, communityId }) => {
  return Following.findOneAndDelete({
    followedBy: userId,
    followingCommunity: communityId,
  });
};
