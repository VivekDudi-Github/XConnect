import {
  getUserProfileAggregate,
  checkIsFollowing,
} from '../db/getAnotherUser.db.js';

export const getAnotherUserService = async ({
  username,
  viewerId,
}) => {
  const users = await getUserProfileAggregate(username);

  if (!users || users.length === 0) {
    throw new Error('USER_NOT_FOUND');
  }

  const user = users[0];

  const isFollowing = await checkIsFollowing(user._id, viewerId);

  return {
    ...user,
    isFollowing: Boolean(isFollowing),
  };
};
