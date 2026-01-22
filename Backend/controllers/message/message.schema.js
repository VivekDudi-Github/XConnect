import { z } from "zod";
import mongoose from "mongoose";

const objectId = () =>
  z.string().refine(val => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  });

export const createMessageSchema = z.object({
  body: z.object({
    room: objectId(),
    message: z.string().optional(),
  }),
});

export const getMessagesSchema = z.object({
  query: z.object({
    room: objectId(),
    _id: z.string().optional(),
    limit: z.coerce.number().min(1).max(50).default(20),
  }),
});

export const deleteMessageSchema = z.object({
  params: z.object({
    id: objectId(),
  }),
});
