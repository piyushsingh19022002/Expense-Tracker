import apiClient from './client.js';

/**
 * @description Triggers a system status health check request.
 * @returns {Promise<Object>} API Response containing status details
 */
export const checkHealth = async () => {
  return apiClient.get('/health');
};
