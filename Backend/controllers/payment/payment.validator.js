import { z } from "zod";

export const createSuperchatSchema = z.object({
  streamId: z.string().min(1),
  message: z.string().min(1),
  amount: z.number().positive(),
});

export const stripeMetadataSchema = z.object({
  type: z.literal("superchat"),
  _id: z.string(),
  username: z.string(),
  avatar: z.string(),
  streamId: z.string(),
  message: z.string(),
  amount: z.string(), // Stripe metadata is stringified
});
