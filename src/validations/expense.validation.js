import { z } from 'zod';

/**
 * @description Validation schema for creating an expense.
 */
export const createExpenseSchema = z.object({
  params: z.object({
    groupId: z.string({ required_error: 'Group ID is required.' }).uuid('Invalid Group ID format.')
  }),
  body: z.object({
    description: z
      .string({ required_error: 'Description is required.' })
      .min(1, 'Description cannot be empty.')
      .max(255, 'Description cannot exceed 255 characters.')
      .trim(),
    amount: z
      .number({ required_error: 'Amount is required.' })
      .gt(0, 'Amount must be positive.'),
    currency: z
      .string({ required_error: 'Currency is required.' })
      .min(1, 'Currency cannot be empty.')
      .max(10, 'Currency code too long.')
      .trim()
      .toUpperCase(),
    date: z
      .string({ required_error: 'Expense date is required.' })
      .datetime({ message: 'Invalid ISO date-time format.' })
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD).'))
      .transform((val) => new Date(val)),
    paidById: z
      .string({ required_error: 'Payer ID (paidById) is required.' })
      .uuid('Invalid Payer ID format.'),
    participants: z
      .array(
        z.object({
          userId: z.string({ required_error: 'Participant user ID is required.' }).uuid('Invalid Participant ID format.'),
          share: z.number().gt(0, 'Share must be positive.').optional()
        })
      )
      .min(1, 'At least one participant is required.')
  })
});

/**
 * @description Validation schema for retrieving group expenses.
 */
export const getGroupExpensesSchema = z.object({
  params: z.object({
    groupId: z.string({ required_error: 'Group ID is required.' }).uuid('Invalid Group ID format.')
  })
});

/**
 * @description Validation schema for accessing or deleting an expense by ID.
 */
export const expenseIdSchema = z.object({
  params: z.object({
    expenseId: z.string({ required_error: 'Expense ID is required.' }).uuid('Invalid Expense ID format.')
  })
});

/**
 * @description Validation schema for updating an expense.
 */
export const updateExpenseSchema = z.object({
  params: z.object({
    expenseId: z.string({ required_error: 'Expense ID is required.' }).uuid('Invalid Expense ID format.')
  }),
  body: z.object({
    description: z
      .string({ required_error: 'Description is required.' })
      .min(1, 'Description cannot be empty.')
      .max(255, 'Description cannot exceed 255 characters.')
      .trim(),
    amount: z
      .number({ required_error: 'Amount is required.' })
      .gt(0, 'Amount must be positive.'),
    currency: z
      .string({ required_error: 'Currency is required.' })
      .min(1, 'Currency cannot be empty.')
      .max(10, 'Currency code too long.')
      .trim()
      .toUpperCase(),
    date: z
      .string({ required_error: 'Expense date is required.' })
      .datetime({ message: 'Invalid ISO date-time format.' })
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD).'))
      .transform((val) => new Date(val)),
    paidById: z
      .string({ required_error: 'Payer ID (paidById) is required.' })
      .uuid('Invalid Payer ID format.'),
    participants: z
      .array(
        z.object({
          userId: z.string({ required_error: 'Participant user ID is required.' }).uuid('Invalid Participant ID format.'),
          share: z.number().gt(0, 'Share must be positive.').optional()
        })
      )
      .min(1, 'At least one participant is required.')
  })
});
