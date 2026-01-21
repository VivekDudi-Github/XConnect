import {
  findFollowRelation,
  createFollow,
  deleteFollow,
} from "../db/following.db.js";

import {
  createFollowNotification,
  deleteFollowNotification,
} from "../db/notification.db.js";

import { emitEvent } from "../../../utils/socket.js";

export const toggleFollowService = async ({
  targetUserId,
  currentUser,
}) => {
  const existing = await findFollowRelation(
    targetUserId,
    currentUser._id
  );

  if (existing) {
    const notify = await deleteFollowNotification({
      sender: currentUser._id,
      receiver: targetUserId,
    });

    await deleteFollow(targetUserId, currentUser._id);

    if (notify) {
      emitEvent(
        "notification:retract",
        "user",
        [targetUserId.toString()],
        {
          type: "follow",
          _id: notify._id.toString(),
        }
      );
    }

    return { followed: false };
  }

  await createFollow(targetUserId, currentUser._id);

  const notify = await createFollowNotification({
    sender: currentUser._id,
    receiver: targetUserId,
  });

  emitEvent(
    "notification:receive",
    "user",
    [targetUserId.toString()],
    {
      type: "follow",
      _id: notify._id.toString(),
      sender: {
        _id: currentUser._id.toString(),
        avatar: currentUser.avatar,
        username: currentUser.username,
      },
      receiver: targetUserId.toString(),
      isRead: false,
    }
  );

  return { followed: true };
};
