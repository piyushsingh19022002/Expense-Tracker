import * as expenseService from '../services/expense.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @description Logs a new expense inside a group.
 * @route POST /api/v1/groups/:groupId/expenses
 */
export const createExpense = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const expenseData = req.body;
  const creatorId = req.user.id;

  const expense = await expenseService.createExpense(groupId, expenseData, creatorId);

  return res
    .status(201)
    .json(new ApiResponse(201, expense, 'Expense created successfully.'));
});

/**
 * @description Retrieves all expenses for a specific group.
 * @route GET /api/v1/groups/:groupId/expenses
 */
export const getExpenses = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;

  const expenses = await expenseService.getGroupExpenses(groupId, userId);

  return res
    .status(200)
    .json(new ApiResponse(200, expenses, 'Group expenses fetched successfully.'));
});

/**
 * @description Retrieves details for a specific expense.
 * @route GET /api/v1/expenses/:expenseId
 */
export const getExpense = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;
  const userId = req.user.id;

  const expense = await expenseService.getExpenseDetails(expenseId, userId);

  return res
    .status(200)
    .json(new ApiResponse(200, expense, 'Expense details fetched successfully.'));
});

/**
 * @description Updates an existing expense and updates split shares.
 * @route PUT /api/v1/expenses/:expenseId
 */
export const updateExpense = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;
  const expenseData = req.body;
  const userId = req.user.id;

  const expense = await expenseService.updateExpense(expenseId, expenseData, userId);

  return res
    .status(200)
    .json(new ApiResponse(200, expense, 'Expense updated successfully.'));
});

/**
 * @description Deletes an expense.
 * @route DELETE /api/v1/expenses/:expenseId
 */
export const deleteExpense = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;
  const userId = req.user.id;

  const result = await expenseService.deleteExpense(expenseId, userId);

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Expense deleted successfully.'));
});
