import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_@]+$/, 'Invalid username'),

  email: z
    .email('Invalid email format'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),

  fullname: z
    .string()
    .min(1, 'Full name is required'),
});


export const loginSchema = z
  .object({
    email: z.email().optional(),
    username: z.string().min(3).optional(),
    password: z.string().min(1, 'Password is required'),
  })
  .refine(data => data.email || data.username, {
    message: 'Email or Username is required',
  });