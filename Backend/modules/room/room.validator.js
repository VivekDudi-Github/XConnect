import { z } from "zod";
import mongoose from "mongoose";

const objectId = z.string().refine(
  val => mongoose.Types.ObjectId.isValid(val),
  { message: "Invalid ObjectId" }
);

export const createRoomSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    type: z.enum(["group", "one-on-one"]),
    members: z.array(objectId).min(1),
  }),
});

export const updateGroupSchema = z.object({
  body: z.object({
    id: objectId,
    name: z.string().optional(),
    description: z.string().optional(),
    members: z.array(objectId).optional(),
    removeMembers: z.array(objectId).optional(),
    promotions: z.array(objectId).optional(),
  }),
});

export const roomIdParamSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});
