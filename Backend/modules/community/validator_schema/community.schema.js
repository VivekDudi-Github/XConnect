import { z } from 'zod';
import { Types } from 'mongoose';

const id = z.string().refine(
    (id) => Types.ObjectId.isValid(id),
    'Invalid community id'
  );


export const createCommunitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  rules: z.array(z.string()).min(1, 'Rules are required'),
  tags: z.array(z.string()).min(1, 'Tags are required'),
});


export const getCommunitySchema = z.object({
  id: id,
});


export const getCommunityPostsSchema = z.object({
  params: z.object({
    id: id,
  }),
  query: z.object({
    page: z.coerce.number().min(1) ,  
  }),
});



export const followCommunitySchema = z.object({
  params: z.object({
    id: id,
  }),
});


export const communityFeedSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1),
  }),
});



export const updateCommunitySchema = z.object({
  params: z.object({
    id: id,
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
    communityId: id,
    mods: z.array(z.string()).min(1, 'No moderators to invite'),
  }),
});

export const communityIdParamSchema = z.object({
  params: z.object({
    id: id,
  }),
});