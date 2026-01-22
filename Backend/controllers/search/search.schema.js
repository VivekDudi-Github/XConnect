import { z } from 'zod';

export const searchQuerySchema = z.object({
  query: z.object({
    q: z.string().min(1).max(100),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(20)
  })
});

export const continueSearchSchema = z.object({
  query: z.object({
    q: z.string().min(1),
    page: z.coerce.number().min(1).default(2),
    tab: z.enum(['post', 'user', 'community'])
  })
});
