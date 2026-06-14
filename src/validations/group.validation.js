import { z } from 'zod';

/**
 * @description Validation schema for creating a group.
 */
export const createGroupSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Group name is required.' })
      .min(2, 'Group name must be at least 2 characters.')
      .max(100, 'Group name cannot exceed 100 characters.')
      .trim(),
    description: z
      .string()
      .max(500, 'Description cannot exceed 500 characters.')
      .trim()
      .optional()
  })
});

/**
 * @description Validation schema for fetching group details.
 */
export const getGroupDetailsSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'Group ID is required.' }).uuid('Invalid Group ID format.')
  })
});

/**
 * @description Validation schema for adding a member to a group.
 */
export const addMemberSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'Group ID is required.' }).uuid('Invalid Group ID format.')
  }),
  body: z.object({
    email: z
      .string({ required_error: 'Member email is required.' })
      .email('Invalid email format.')
      .trim()
      .toLowerCase()
  })
});

/**
 * @description Validation schema for removing a member from a group.
 */
export const removeMemberSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'Group ID is required.' }).uuid('Invalid Group ID format.'),
    userId: z.string({ required_error: 'User ID is required.' }).uuid('Invalid User ID format.')
  })
});
