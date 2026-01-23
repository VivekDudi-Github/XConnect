import * as repo from "./comment.db.js";
import { CommentCount } from "../../models/commentCount.model.js";

export const createCommentService = async ({
  postId,
  userId,
  content,
  commentId,
}) => {
  const comment = await repo.createComment({
    post: postId,
    user: userId,
    content,
    replyTo: commentId ? "comment" : "post",
    comment_id: commentId || null,
  });

  await CommentCount.findOneAndUpdate(
    { user: userId },
    { $inc: { count: 1 } },
    { upsert: true }
  );

  return comment;
};

export const toggleLikeService = async ({ commentId, userId }) => {
  const exists = await repo.userLikedComment(commentId, userId);

  if (exists) {
    await repo.removeLike(commentId, userId);
    return false;
  }

  await repo.removeDislike(commentId, userId);
  await repo.addLike(commentId, userId);
  return true;
};

export const toggleDislikeService = async ({ commentId, userId }) => {
  const exists = await repo.userDislikedComment(commentId, userId);

  if (exists) {
    await repo.removeDislike(commentId, userId);
    return false;
  }

  await repo.removeLike(commentId, userId);
  await repo.addDislike(commentId, userId);
  return true;
};

export const deleteCommentService = async (id, userId) => {
  const comment = await repo.findCommentById(id);

  if (!comment) throw { status: 404, message: "Comment not found" };
  if (comment.user.toString() !== userId.toString())
    throw { status: 403, message: "You are not the owner of this comment" };

  await repo.commentExists(id);
  await repo.removeLike(id, userId);
  await repo.removeDislike(id, userId);
  await comment.deleteOne();
};