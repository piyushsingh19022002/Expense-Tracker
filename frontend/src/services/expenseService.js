import apiClient from '../api/client.js';

/**
 * @description Fetches all expenses logged inside a group.
 * @param {string} groupId - Group UUID
 * @returns {Promise<Object>} API Response with expenses list
 */
export const getGroupExpenses = async (groupId) => {
  return apiClient.get(`/groups/${groupId}/expenses`);
};

/**
 * @description Creates a new expense under a specific group.
 * @param {string} groupId - Group UUID
 * @param {Object} expenseData - Payload containing amount, currency, paidById, description, date, and participants
 * @returns {Promise<Object>} API Response containing created expense details
 */
export const createExpense = async (groupId, expenseData) => {
  return apiClient.post(`/groups/${groupId}/expenses`, expenseData);
};

/**
 * @description Retrieves full details of a specific expense.
 * @param {string} expenseId - Expense UUID
 * @returns {Promise<Object>} API Response containing expense splits and details
 */
export const getExpense = async (expenseId) => {
  return apiClient.get(`/expenses/${expenseId}`);
};

/**
 * @description Updates an existing expense and updates split shares.
 * @param {string} expenseId - Expense UUID
 * @param {Object} expenseData - Updated fields (description, amount, date, paidById, participants)
 * @returns {Promise<Object>} API Response with updated expense details
 */
export const updateExpense = async (expenseId, expenseData) => {
  return apiClient.put(`/expenses/${expenseId}`, expenseData);
};

/**
 * @description Deletes an expense.
 * @param {string} expenseId - Expense UUID
 * @returns {Promise<Object>} API Response verifying deletion success
 */
export const deleteExpense = async (expenseId) => {
  return apiClient.delete(`/expenses/${expenseId}`);
};

export default {
  getGroupExpenses,
  createExpense,
  getExpense,
  updateExpense,
  deleteExpense
};
