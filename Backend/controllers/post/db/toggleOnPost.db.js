import { Post } from '../../../models/post.model.js';
import { Bookmark } from '../../../models/bookmark.model.js';
import { Likes } from '../../../models/likes.modal.js';
import { Notification } from '../../../models/notifiaction.model.js';
import { LikesCount } from '../../../models/likesCount.model.js';
import { Preferance } from '../../../models/prefrence.model.js';



export const findPostById = (id) =>
  Post.findById(id).populate('author', 'username fullname avatar');

export const findUserPost = (postId, userId) =>
  Post.findOne({ _id: postId, author: userId });

export const togglePinDB = async (post) => {
  post.isPinned = !post.isPinned;
  await post.save();
  return post.isPinned;
};

export const toggleBookmarkDB = async (postId, userId) => {
  const exists = await Bookmark.findOne({ post: postId, user: userId });
  if (exists) {
    await Bookmark.deleteOne({ _id: exists._id });
    return false;
  }
  await Bookmark.create({ post: postId, user: userId });
  return true;
};

export const toggleLikeDB = async ({ post, userId }) => {
  const exists = await Likes.findOne({ post: post._id, user: userId });
  if (exists) {
    await Likes.deleteOne({ _id: exists._id });
    return { liked: false, createdAt: exists.createdAt };
  }

  await Likes.create({ post: post._id, user: userId });
  return { liked: true };
};

export const updateLikesCount = (userId, createdAt, delta) => {
  const filter = createdAt
    ? { user: userId, createdAt }
    : { user: userId };

  return LikesCount.findOneAndUpdate(
    filter,
    { $inc: { count: delta } },
    { upsert: true }
  );
};

export const updatePreferences = async ({ userId, hashtags, delta }) => {
  if (!hashtags.length) return;

  const ops = hashtags.map(h => ({
    updateOne: {
      filter: { user: userId, hashtags: h },
      update: { $inc: { score: delta } },
      upsert: true,
    },
  }));

  await Preferance.bulkWrite(ops, { ordered: false });
};

export const createLikeNotification = (data) =>
  Notification.create(data);

export const deleteLikeNotification = (filter) =>
  Notification.findOneAndDelete(filter).select('_id');
