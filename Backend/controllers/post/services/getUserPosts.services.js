import { TAB_HANDLERS } from "../db/getUserPosts.db.js";
import ApiError from "../../../utils/ApiError.js";
const limit = 10
export const getUserPostsService = async ({
  tab,
  viewerId,
  authorId,
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
