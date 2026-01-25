import { TryCatch , ResSuccess } from "../../utils/extra.js";   
import { validate } from "../../middlewares/validate.js";
import * as service from "./comment.services.js";
import * as schema from "./comment.validator.js";


/* CREATE */
export const createComment = TryCatch(async (req, res) => {
  validate(schema.createCommentSchema, req);

  const comment = await service.createCommentService({
    postId: req.params.id,
    userId: req.user._id,
    content: req.body.content,
    commentId: req.body.comment_id,
    isEdited : req.body.isEdited ,
  });

  ResSuccess(res, 201, comment);
} , 'createComment');
 
/* GET COMMENTS */
export const getComments = TryCatch(async (req, res) => {
  console.log(req.params.id , 'const-params ');
  validate(schema.getCommentsSchema, req);

  let result  = await service.getCommentsService({userId : req.user._id , postId : req.params.id , ...req.query})

  return ResSuccess(res, 200, result);
} , 'getComments');

export const getAComment = TryCatch(async (req, res) => {
  validate(schema.CheckIdParams, req);

  const comment = await service.getACommentService(req.params.id);
  ResSuccess(res, 200, comment);
} , 'getAComment');

/* LIKE */
export const toggleLikeComment = TryCatch(async (req, res) => {
  validate(schema.CheckIdParams, req);

  const result = await service.toggleLikeService({
    commentId: req.params.id,
    userId: req.user._id,
  });

  ResSuccess(res, 200, { operation: result });
} , 'toggleLikeComment');

/* DISLIKE */
export const toggleDislikeComment = TryCatch(async (req, res) => {
  validate(schema.CheckIdParams, req);

  const result = await service.toggleDislikeService({
    commentId: req.params.id,
    userId: req.user._id,
  });

  ResSuccess(res, 200, { operation: result });
} , 'toggleDislikeComment');

/* DELETE */
export const deleteComment = TryCatch(async (req, res) => {
  validate(schema.CheckIdParams, req);

  await service.deleteCommentService(req.params.id, req.user._id);
  ResSuccess(res, 200, "Comment deleted successfully");
} , 'deleteComment');

