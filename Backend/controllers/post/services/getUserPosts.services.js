import { TAB_HANDLERS } from "../db/getUserPosts.db.js";

export const getUserPostsService = async ({
  tab,
  viewerId,
  authorId,
  limit,
  skip,
}) => {
  const handler = TAB_HANDLERS[tab];

  if (!handler) {
    throw new Error('INVALID_TAB');
  }

  return handler({
    viewerId,
    authorId,
    limit,
    skip,
  });
};
