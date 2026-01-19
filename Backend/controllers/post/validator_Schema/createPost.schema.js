import { z } from 'zod';

export const createPostSchema = z.object({
  content: z.string().optional(),

  hashtags: z.array(z.string()).default([]),
  mentions: z.array(z.string()).default([]),

  title: z.string().optional(),
  category: z.enum(['general', 'question', 'feedback', 'showcase']).optional(),

  isCommunityPost: z.boolean().default(false),
  isAnonymous: z.boolean().default(false),

  repost: z.string().optional(),
  community: z.string().optional(),

  scheduledAt: z.iso.datetime().pipe(z.coerce.date()).optional(),

  videoIds: z.array(z.string()).optional(),
});
