import { TryCatch , ResSuccess } from "../../utils/extra.js";   
import { validate } from "../../middlewares/validate.js";
import * as service from "./comment.service.js";
import * as repo from "./comment.db.js";
import * as schema from "./comment.schema.js";


/* CREATE */
export const createComment = TryCatch(async (req, res) => {
  validate(schema.createCommentSchema, req);

  const comment = await service.createCommentService({
    postId: req.params.id,
    userId: req.user._id,
    content: req.body.content,
    commentId: req.body.comment_id,
  });

  ResSuccess(res, 201, comment);
});

/* GET COMMENTS */
export const getComments = TryCatch(async (req, res) => {
  validate(schema.getCommentsSchema, req);

  const { page, limit, sortBy, isComment, comment_id } = req.query;
  const skip = (page - 1) * limit;

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
    postId: req.params.id,
    userId: req.user._id,
    skip,
    limit,
    sortStages,
    replyMatch,
  });

  ResSuccess(res, 200, comments);
});

/* LIKE */
export const toggleLikeComment = TryCatch(async (req, res) => {
  validate(schema.toggleCommentSchema, req);

  const result = await service.toggleLikeService({
    commentId: req.params.id,
    userId: req.user._id,
  });

  ResSuccess(res, 200, { operation: result });
});

/* DISLIKE */
export const toggleDislikeComment = TryCatch(async (req, res) => {
  validate(schema.toggleCommentSchema, req);

  const result = await service.toggleDislikeService({
    commentId: req.params.id,
    userId: req.user._id,
  });

  ResSuccess(res, 200, { operation: result });
});
