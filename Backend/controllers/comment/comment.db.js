import { Types } from "mongoose";
import { Comment } from "../../models/comment.model.js";
import { Likes } from "../../models/likes.modal.js";
import { Dislikes } from "../../models/dislikes.modal.js";

const ObjectId = Types.ObjectId;

/* ---------- BASIC ---------- */

export const findCommentById = (id) =>
  Comment.findById(id).select("user isDeleted content createdAt");

export const commentExists = (id) =>
  Comment.exists({ _id: id, isDeleted: false });

export const createComment = (data) =>
  Comment.create(data);

/* ---------- LIKE / DISLIKE ---------- */

export const userLikedComment = (comment, user) =>
  Likes.exists({ comment, user });

export const userDislikedComment = (comment, user) =>
  Dislikes.exists({ comment, user });

export const removeLike = (comment, user) =>
  Likes.deleteOne({ comment, user });

export const removeDislike = (comment, user) =>
  Dislikes.deleteOne({ comment, user });

export const addLike = (comment, user) =>
  Likes.create({ comment, user });

export const addDislike = (comment, user) =>
  Dislikes.create({ comment, user });

/* ---------- AGGREGATIONS ---------- */

export const getCommentsAggregate = ({
  postId,
  userId,
  skip,
  limit,
  sortStages,
  replyMatch,
}) =>
  Comment.aggregate([
    {
      $match: {
        $expr: {
          $and: [
            { $eq: ["$post", new ObjectId(postId)] },
            ...replyMatch,
          ],
        },
      },
    },

    { $lookup: { from: "likes", localField: "_id", foreignField: "comment", as: "likes" } },
    { $lookup: { from: "dislikes", localField: "_id", foreignField: "comment", as: "dislikes" } },

    ...sortStages,
    { $skip: skip },
    { $limit: limit },

    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        pipeline: [{ $project: { avatar: 1, username: 1, fullname: 1 } }],
        as: "author",
      },
    },

    {
      $lookup: {
        from: "likes",
        let: { cid: "$_id" },
        pipeline: [
          { $match: { $expr: { $and: [
            { $eq: ["$comment", "$$cid"] },
            { $eq: ["$user", new ObjectId(userId)] },
          ]}}},
        ],
        as: "userLike",
      },
    },

    {
      $addFields: {
        likeCount: { $size: "$likes" },
        dislikeCount: { $size: "$dislikes" },
        likeStatus: { $gt: [{ $size: "$userLike" }, 0] },
      },
    },

    { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
    { $project: { likes: 0, dislikes: 0, userLike: 0 } },
  ]);
