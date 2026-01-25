import * as repo from "./comment.db.js";
import { CommentCount } from "../../models/commentCount.model.js";
import { Comment } from "../../models/comment.model.js";
import { ObjectId } from "mongodb";
let limit = 5;

export const createCommentService = async ({
  postId,
  userId,
  content,
  isEdited,
  commentId,
}) => {
  const comment = await repo.createComment({
    post: postId,
    user: userId,
    content,
    isEdited,
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
  await repo.deleteAllDislikes(comment);
  await repo.deleteAllLikes(comment);
  await comment.deleteOne();
};

export const getACommentService = async (id) => {
  const comment = await repo.findCommentById(id);

  if (!comment) throw { status: 404, message: "Comment not found" };

  return comment;
};

export const getCommentsService = async ({page , sortBy, isComment, comment_id, postId , userId }) => {

  let skip = (page - 1) * limit ;

  const sortStages =
    sortBy === "Newest"
      ? [{ $sort: { createdAt: -1 } }]
      : sortBy === "Most Liked"
      ? [{ $sort: { likeCount: -1 } }]
      : [];

  const replyMatch =
    isComment === "true" && comment_id
      ? [
          { $eq: ["$replyTo", "comment"] },
          { $eq: ["$comment_id", comment_id] },
        ]
      : [{ $eq: ["$replyTo", "post"] }];

  const comments = await repo.getCommentsAggregate({
    postId: postId,
    userId: userId,
    skip,
    limit,
    sortStages,
    replyMatch,
  });

  let totalComments;
  if(isComment === 'true' && ObjectId.isValid(comment_id)){
    totalComments = await Comment.countDocuments({post : postId , comment_id : new ObjectId(`${comment_id}`) , replyTo : 'comment' } ) ;
  }else {
    totalComments = await Comment.countDocuments({post : postId , replyTo : 'post' }) ;
    
  }
  
  const totalPages = Math.ceil(totalComments/limit) ;

  return {totalPages , comments , totalComments}
}