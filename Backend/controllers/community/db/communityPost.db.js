import { Post } from "../../../models/post.model.js";

export const countCommunityPosts = (communityId) => {
  return Post.countDocuments({
    community: communityId,
    isDeleted: false,
  });
};

export const findCommunityPosts = ({
  communityId,
  skip,
  limit,
}) => {
  return Post.find({
    community: communityId,
    isDeleted: false,
  })
    .populate('author', 'avatar username')
    .populate('community', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};
