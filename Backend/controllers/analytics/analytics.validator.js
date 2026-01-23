import { z } from "zod";

export const analyticsPageSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/),
});
