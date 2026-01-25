import { TAB_HANDLERS } from "../db/getUserPosts.db.js";
import ApiError from "../../../utils/ApiError.js";

export const getUserPostsService = async ({
  tab,
  viewerId,
  authorId,
  limit,
  skip,
}) => {
  const handler = TAB_HANDLERS[tab];

  if (!handler) {
    throw new ApiError(400 ,'INVALID_TAB');
  }

  return handler({
    viewerId,
    authorId,
    limit,
    skip,
  });
};
