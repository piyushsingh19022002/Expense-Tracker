import apiClient from '../api/client.js';

/**
 * @description Retrieves all groups where the authenticated user is an active member.
 * @returns {Promise<Object>} API Response containing list of groups
 */
export const getGroups = async () => {
  return apiClient.get('/groups');
};

/**
 * @description Creates a new group and joins the creator as an active member.
 * @param {string} name - Group name
 * @param {string} description - Optional group description
 * @returns {Promise<Object>} API Response containing created group and membership context
 */
export const createGroup = async (name, description) => {
  return apiClient.post('/groups', { name, description });
};

/**
 * @description Fetches full group metadata, including its complete member list.
 * @param {string} id - Group UUID
 * @returns {Promise<Object>} API Response containing group and membership details
 */
export const getGroupDetails = async (id) => {
  return apiClient.get(`/groups/${id}`);
};

/**
 * @description Adds/invites a user to a group by email address.
 * @param {string} id - Group UUID
 * @param {string} email - Email address of the user to invite
 * @returns {Promise<Object>} API Response containing created/updated membership
 */
export const addMember = async (id, email) => {
  return apiClient.post(`/groups/${id}/members`, { email });
};

/**
 * @description Removes a member from a group (soft delete).
 * @param {string} id - Group UUID
 * @param {string} userId - User UUID of the member to remove
 * @returns {Promise<Object>} API Response containing updated membership record
 */
export const removeMember = async (id, userId) => {
  return apiClient.delete(`/groups/${id}/members/${userId}`);
};

export default {
  getGroups,
  createGroup,
  getGroupDetails,
  addMember,
  removeMember
};
