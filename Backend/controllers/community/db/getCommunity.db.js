import { Community } from "../../../models/community.model.js";
import { Following } from "../../../models/following.model.js";

export const findCommunityById = (communityId) => {
  return Community.findById(communityId)
    .populate('admins', 'avatar fullname username')
    .lean();
};

export const isUserFollowingCommunity = ({ userId, communityId }) => {
  return Following.exists({
    followedBy: userId,
    followingCommunity: communityId,
  });
};

export const countCommunityFollowers = (communityId) => {
  return Following.countDocuments({
    followingCommunity: communityId,
  });
};
