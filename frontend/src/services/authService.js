import apiClient from '../api/client.js';

/**
 * @description Sends user login credentials.
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} API Response containing user details and access token
 */
export const loginUser = async (email, password) => {
  return apiClient.post('/auth/login', { email, password });
};

/**
 * @description Registers a new user account.
 * @param {string} name - User's name
 * @param {string} email - Unique email address
 * @param {string} password - User password
 * @returns {Promise<Object>} API Response containing created user account
 */
export const registerUser = async (name, email, password) => {
  return apiClient.post('/auth/register', { name, email, password });
};

/**
 * @description Logs out the current user session and clears authentication cookies.
 * @returns {Promise<Object>} API Response confirming logout success
 */
export const logoutUser = async () => {
  return apiClient.post('/auth/logout');
};
