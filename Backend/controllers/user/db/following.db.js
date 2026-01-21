import { Following } from "../../../models/following.model.js";

export const findFollowRelation = (followedTo, followedBy) => {
  return Following.findOne({ followedTo, followedBy });
};

export const createFollow = (followedTo, followedBy) => {
  return Following.create({ followedTo, followedBy });
};

export const deleteFollow = (followedTo, followedBy) => {
  return Following.findOneAndDelete({ followedTo, followedBy });
};
