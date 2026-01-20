import {
  togglePinDB,
  toggleBookmarkDB,
  toggleLikeDB,
  updateLikesCount,
  updatePreferences,
  createLikeNotification,
  deleteLikeNotification,
} from '../db/toggleOnPost.db.js';
import { emitEvent } from '../../../utils/socket.js';

export const togglePinService = async ({ post }) => {
  const status = await togglePinDB(post);
  return status;
};

export const toggleBookmarkService = async ({ postId, userId }) => {
  return toggleBookmarkDB(postId, userId);
};

export const toggleLikeService = async ({ post, user }) => {
  const hashtags = post.hashtags?.slice(0, 4) || [];
  const authorId = post.author._id;

  const result = await toggleLikeDB({
    post,
    userId: user._id,
  });

  if (!result.liked) {
    const deleted = await deleteLikeNotification({
      type: 'like',
      post: post._id,
      sender: user._id,
      receiver: authorId,
    });

    if (deleted) {
      emitEvent(
        'notification:retract',
        'user',
        [`${authorId}`],
        { type: 'like', _id: deleted._id.toString() }
      );
    }

    await updateLikesCount(authorId, result.createdAt, -1);
    await updatePreferences({ userId: user._id, hashtags, delta: -1 });

    return false;
  }

  await updateLikesCount(authorId, null, 1);

  if (!authorId.equals(user._id)) {
    const notification = await createLikeNotification({
      type: 'like',
      post: post._id,
      sender: user._id,
      receiver: authorId,
    });

    emitEvent(
      'notification:receive',
      'user',
      [`${authorId}`],
      {
        ...notification._doc,
        sender: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
        },
      }
    );
  }

  await updatePreferences({ userId: user._id, hashtags, delta: 1 });
  return true;
};
