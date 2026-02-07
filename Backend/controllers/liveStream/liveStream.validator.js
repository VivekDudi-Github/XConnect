import { z } from "zod";
import mongoose from "mongoose";

const objectId = () =>
  z.string().refine(val => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  });

export const createLiveStreamSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    videoProducerId: z.string().optional(),
    audioProducerId: z.string().optional(),
  }),
});

export const updateLiveStreamSchema = z.object({
  params: z.object({
    id: objectId(),
  }),
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    startedAt: z.coerce.date().optional(),
    endedAt: z.coerce.date().optional(),
    videoId: z.string().optional(),
    audioId: z.string().optional(),
  }),
});

export const liveStreamIdParamSchema = z.object({
  params: z.object({
    id: objectId(),
  }),
});

export const getUserLiveStreamsSchema = z.object({
  params: z.object({
    id: objectId(),
  }),
  query: z.object({
    page: z.coerce.number().min(1),
  }),
});

export const getLiveChatsSchema = z.object({
  params: z.object({
    id: objectId(),
  }),
  query: z.object({
    lastId: z.string().optional(),
  }),
});
