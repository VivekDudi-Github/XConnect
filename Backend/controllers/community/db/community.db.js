import Community from '../../models/community.js';

export const findCommunityById = (id) => {
  return Community.findById(id);
};

export const saveCommunity = (community) => {
  return community.save();
};
