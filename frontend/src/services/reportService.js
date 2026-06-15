import apiClient from '../api/client.js';

/**
 * @description Retrieves a comprehensive import report for a given CSV import batch.
 * @param {string} batchId - Batch UUID
 * @returns {Promise<Object>} API response with report data
 */
export const getImportReport = async (batchId) => {
  return apiClient.get(`/imports/${batchId}/report`);
};

export default {
  getImportReport
};
