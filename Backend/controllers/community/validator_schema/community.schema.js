import { z } from 'zod';

export const createCommunitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  rules: z.array(z.string()).min(1, 'Rules are required'),
  tags: z.array(z.string()).min(1, 'Tags are required'),
});


export const getCommunitySchema = z.object({
  id: z.string().min(1, 'Community ID is required'),
});


export const getCommunityPostsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Community ID is required'),
  }),
  query: z.object({
    page: z
      .string()
      .optional()
      .transform(Number)
      .refine(n => !isNaN(n) && n > 0, 'Page must be a positive number')
      .default('1'),

    limit: z
      .string()
      .optional()
      .transform(Number)
      .refine(n => !isNaN(n) && n > 0, 'Limit must be a positive number')
      .default('10'),
  }),
});



export const followCommunitySchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Community ID is required'),
  }),
});


export const communityFeedSchema = z.object({
  query: z.object({
    page: z.string().optional().transform(Number).default('1'),
    limit: z.string().optional().transform(Number).default('10'),
  }),
});



export const updateCommunitySchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Community ID is required'),
  }),
  body: z.object({
    name: z.string().min(3).max(20).optional(),
    description: z.string().optional(),
    rules: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }),
});




export const inviteModsSchema = z.object({
  body: z.object({
    communityId: z.string().min(1),
    mods: z.array(z.string()).min(1, 'No moderators to invite'),
  }),
});

export const communityIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Community ID is required'),
  }),
});