import { Router } from 'express';
import * as expenseController from '../controllers/expense.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validation.middleware.js';
import {
  createExpenseSchema,
  getGroupExpensesSchema,
  expenseIdSchema,
  updateExpenseSchema
} from '../validations/expense.validation.js';

const router = Router();

// Secure all expense endpoints using JWT auth middleware
router.use(authMiddleware);

// POST /groups/:groupId/expenses - Log a new expense
router.post('/groups/:groupId/expenses', validate(createExpenseSchema), expenseController.createExpense);

// GET /groups/:groupId/expenses - Fetch group expense list
router.get('/groups/:groupId/expenses', validate(getGroupExpensesSchema), expenseController.getExpenses);

// GET /expenses/:expenseId - Fetch single expense details
router.get('/expenses/:expenseId', validate(expenseIdSchema), expenseController.getExpense);

// PUT /expenses/:expenseId - Update expense metadata and splits
router.put('/expenses/:expenseId', validate(updateExpenseSchema), expenseController.updateExpense);

// DELETE /expenses/:expenseId - Remove an expense (cascades to participant shares)
router.delete('/expenses/:expenseId', validate(expenseIdSchema), expenseController.deleteExpense);

export default router;
