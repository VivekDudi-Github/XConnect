import { z } from 'zod';

export const initVideoUploadSchema = z.object({
  body: z.object({
    fileSize: z.number().positive(),
    fileType: z.literal('video')
  })
});

export const uploadChunkSchema = z.object({
  body: z.object({
    public_id: z.string().uuid(),
    chunkIdx: z.coerce.number().int().min(0)
  })
});

export const publicIdParamSchema = z.object({
  params: z.object({
    public_id: z.string().uuid()
  })
});
