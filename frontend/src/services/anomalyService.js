import apiClient from '../api/client.js';

/**
 * @description Retrieves a list of anomalies, optionally filtered by batchId, status, severity, and type.
 * @param {Object} filters - Filtering criteria (batchId, status, severity, type)
 * @returns {Promise<Object>} API response with anomalies array
 */
export const getAnomalies = async (filters = {}) => {
  return apiClient.get('/anomalies', { params: filters });
};

/**
 * @description Retrieves the import report for a given CSV batch.
 * @param {string} batchId - Batch UUID
 * @returns {Promise<Object>} API response with report object
 */
export const getImportReport = async (batchId) => {
  return apiClient.get(`/imports/${batchId}/report`);
};

/**
 * @description Approves an anomaly, marking it APPROVED.
 * @param {string} id - Anomaly UUID
 * @returns {Promise<Object>} API response with updated anomaly
 */
export const approveAnomaly = async (id) => {
  return apiClient.post(`/anomalies/${id}/approve`);
};

/**
 * @description Rejects an anomaly, marking it REJECTED.
 * @param {string} id - Anomaly UUID
 * @returns {Promise<Object>} API response with updated anomaly
 */
export const rejectAnomaly = async (id) => {
  return apiClient.post(`/anomalies/${id}/reject`);
};

/**
 * @description Submits manual edits for the row associated with an anomaly.
 * @param {string} id - Anomaly UUID
 * @param {Object} correctedData - Corrected raw CSV column values
 * @returns {Promise<Object>} API response with updated anomaly and row
 */
export const editAnomaly = async (id, correctedData) => {
  return apiClient.put(`/anomalies/${id}/edit`, { correctedData });
};

export default {
  getAnomalies,
  getImportReport,
  approveAnomaly,
  rejectAnomaly,
  editAnomaly
};
