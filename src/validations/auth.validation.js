import { z } from 'zod';

/**
 * @description Validation schema for user registration.
 * Enforces strong password rules.
 */
export const registerSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required.' })
      .email('Invalid email format.')
      .trim()
      .toLowerCase(),
    name: z
      .string({ required_error: 'Name is required.' })
      .min(2, 'Name must be at least 2 characters.')
      .max(50, 'Name cannot exceed 50 characters.')
      .trim(),
    password: z
      .string({ required_error: 'Password is required.' })
      .min(8, 'Password must be at least 8 characters.')
      .max(100, 'Password cannot exceed 100 characters.')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
      .regex(/[0-9]/, 'Password must contain at least one digit.')
  })
});

/**
 * @description Validation schema for user login.
 */
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required.' })
      .email('Invalid email format.')
      .trim()
      .toLowerCase(),
    password: z
      .string({ required_error: 'Password is required.' })
  })
});
