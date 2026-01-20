import { z } from 'zod';
import { Types } from 'mongoose';

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


const objectId = z.string().refine(v => Types.ObjectId.isValid(v), {
  message: 'Invalid ObjectId',
});

export const postIdParamSchema = z.object({
  id: objectId,
});

export const editPostSchema = z.object({
  content: z.string().min(1),
  hashtags: z.array(z.string()).default([]),
  repost: objectId.optional().nullable(),
});

export const togglePostSchema = z.object({
  option: z.enum(['like', 'bookmark', 'pin']),
});

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});



export const fetchFeedSchema = z.object({
  tab: z.enum(['ForYou', 'Following', 'Media', 'Communities']).default('ForYou'),
  page: z.coerce.number().int().min(1).default(1),
});


export const exploreQuerySchema = z.object({
  tab: z.enum(['Trending', 'Media', 'Communities', 'People']),
  page: z.coerce.number().int().min(1).default(1),
});
