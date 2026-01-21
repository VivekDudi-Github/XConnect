import { z } from 'zod';
import { Types } from 'mongoose';

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


export const loginSchema = z.object({
    email: z.email().optional(),
    username: z.string().min(3).optional(),
    password: z.string().min(1, 'Password is required'),
  })
  .refine(data => data.email || data.username, {
    message: 'Email or Username is required',
  });

export const getMeSchema = z.object({
  userId: z.string().refine(
    (id) => Types.ObjectId.isValid(id),
    'Invalid user id'
  ),
});

export const updateUserSchema = z.object({
    username: z
      .string()
      .min(3)
      .max(20)
      .regex(/^[a-zA-Z0-9_@]+$/)
      .optional(),

    bio: z.string().max(300).optional(),
    fullname: z.string().min(1).optional(),
    location: z.string().max(100).optional(),
    hobby: z.string().max(100).optional(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided' }
  );

  
export const getAnotherUserSchema = z.object({
  username: z.string().min(1, 'Username is required'),
});


export const deleteUserSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  }).refine(
    (data) => data.oldPassword.trim() !== data.newPassword.trim(),
    { message: 'Old and new passwords cannot be the same' }
);


export const toggleFollowSchema = z.object({
  params: z.object({
    id: z.string().min(1, "User id is required"),
  }),
});

export const markNotificationReadSchema = z.object({
  body: z.object({
    notificationId: z.array(z.string()).min(1, "Notification id is required"),
  }),
});