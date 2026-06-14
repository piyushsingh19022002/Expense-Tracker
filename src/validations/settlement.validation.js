import { z } from 'zod';

/**
 * @description Validation schema for creating a settlement.
 */
export const createSettlementSchema = z.object({
  params: z.object({
    groupId: z.string({ required_error: 'Group ID is required.' }).uuid('Invalid Group ID format.')
  }),
  body: z.object({
    payerId: z.string({ required_error: 'Payer ID (payerId) is required.' }).uuid('Invalid Payer ID format.'),
    payeeId: z.string({ required_error: 'Receiver ID (payeeId) is required.' }).uuid('Invalid Receiver ID format.'),
    amount: z.number({ required_error: 'Amount is required.' }).gt(0, 'Amount must be positive.'),
    currency: z.string().max(10, 'Currency code too long.').trim().toUpperCase().default('USD'),
    date: z
      .string({ required_error: 'Settlement date is required.' })
      .datetime({ message: 'Invalid ISO date-time format.' })
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD).'))
      .transform((val) => new Date(val))
      .default(() => new Date().toISOString())
  }).refine((data) => data.payerId !== data.payeeId, {
    message: 'Payer and receiver (payee) cannot be the same user.',
    path: ['payeeId']
  })
});

/**
 * @description Validation schema for retrieving group settlements.
 */
export const getGroupSettlementsSchema = z.object({
  params: z.object({
    groupId: z.string({ required_error: 'Group ID is required.' }).uuid('Invalid Group ID format.')
  })
});

/**
 * @description Validation schema for accessing a single settlement by ID.
 */
export const settlementIdSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'Settlement ID is required.' }).uuid('Invalid Settlement ID format.')
  })
});

export default {
  createSettlementSchema,
  getGroupSettlementsSchema,
  settlementIdSchema
};
