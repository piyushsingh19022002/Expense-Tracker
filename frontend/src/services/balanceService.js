import apiClient from '../api/client.js';

/**
 * @description Fetches all member balances for a group along with "who owes whom" pairs.
 * @param {string} groupId - Group UUID
 * @returns {Promise<Object>} API Response: { balances: [], owesWhom: [] }
 */
export const getGroupBalances = async (groupId) => {
  return apiClient.get(`/groups/${groupId}/balances`);
};

/**
 * @description Fetches the full settlement history for a group.
 * @param {string} groupId - Group UUID
 * @returns {Promise<Object>} API Response with list of settlements
 */
export const getGroupSettlements = async (groupId) => {
  return apiClient.get(`/groups/${groupId}/settlements`);
};

export default {
  getGroupBalances,
  getGroupSettlements
};
