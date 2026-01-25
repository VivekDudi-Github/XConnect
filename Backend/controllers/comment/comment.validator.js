import { z } from "zod";
import mongoose from "mongoose";

const objectId = z.string().refine(v => 
  mongoose.Types.ObjectId.isValid(v)
  , {
  message: "Invalid ObjectId",
});

export const createCommentSchema = z.object({
  params: z.object({ 
    id: objectId, // postId
  }),
  body: z.object({
    content: z.string().min(1),
    comment_id: objectId.optional(),
    isEdited: z.coerce.boolean().optional(),
    mentions: z.array(z.string()).optional(),
  }),
});

export const getCommentsSchema = z.object({
  params: z.object({
    id: objectId,
  }),
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(5),
    sortBy: z.enum(["Top", "Most Liked", "Newest"]).default("Top").optional(),
    isComment: z.string().optional(),
    comment_id: objectId.optional(),
  }),
});

export const CheckIdParams = z.object({
  params: z.object({
    id: objectId,
  }),
});
