import { z } from 'zod';
import { id } from 'zod/locales';

export const createUserSchema = z.object({
    names: z.string().min(2, 'Names must be at least 2 characters long').max(100, 'Names cannot exceed 100 characters'),
    email: z.string().email('Invalid email address').max(150, 'Email cannot exceed 150 characters'),
    phone: z.string().max(20, 'Phone number cannot exceed 20 characters').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters long').max(255, 'Password cannot exceed 255 characters'),
});

export const loginUserSchema = z.object({
    email: z.string().email('Invalid email address').max(150, 'Email cannot exceed 150 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters long').max(255, 'Password cannot exceed 255 characters'),
});

export const updateUserSchema = z.object({
    names: z.string().min(2, 'Names must be at least 2 characters long').max(100, 'Names cannot exceed 100 characters').optional(),
    email: z.string().email('Invalid email address').max(150, 'Email cannot exceed 150 characters').optional(),
    phone: z.string().max(20, 'Phone number cannot exceed 20 characters').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters long').max(255, 'Password cannot exceed 255 characters').optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
