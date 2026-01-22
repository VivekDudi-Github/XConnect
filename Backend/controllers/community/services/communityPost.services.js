import {
  countCommunityPosts,
  findCommunityPosts,
} from '../db/communityPost.db.js';

export const getCommunityPostsService = async ({
  communityId,
  page,
  limit,
}) => {
  const skip = (page - 1) * limit;

  const totalPosts = await countCommunityPosts(communityId);

  const posts = await findCommunityPosts({
    communityId,
    skip,
    limit,
  });

  return {
    posts,
    totalPages: Math.ceil(totalPosts / limit),
    page,
  };
};
