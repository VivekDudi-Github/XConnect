import { Following } from "../../../models/following.model.js";
import { Community } from "../../../models/community.model.js";

export const createCommunity = (data) => {
  return Community.create(data);
};

export const followCommunity = ({ communityId, userId }) => {
  return Following.create({
    followingCommunity: communityId,
    followedBy: userId,
  });
};
