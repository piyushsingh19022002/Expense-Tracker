import * as groupService from '../services/group.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @description Creates a new group and associates the creator as the first active member.
 * @route POST /api/v1/groups
 */
export const createGroup = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const creatorId = req.user.id;

  const result = await groupService.createGroup(name, description, creatorId);

  return res
    .status(201)
    .json(new ApiResponse(201, result, 'Group created and membership initialized successfully.'));
});

/**
 * @description Fetches all groups that the authenticated user belongs to.
 * @route GET /api/v1/groups
 */
export const getGroups = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const groups = await groupService.getUserGroups(userId);

  return res
    .status(200)
    .json(new ApiResponse(200, groups, 'User groups fetched successfully.'));
});

/**
 * @description Retrieves full details of a specific group, including its member records.
 * @route GET /api/v1/groups/:id
 */
export const getGroupDetails = asyncHandler(async (req, res) => {
  const groupId = req.params.id;
  const userId = req.user.id;

  const group = await groupService.getGroupDetails(groupId, userId);

  return res
    .status(200)
    .json(new ApiResponse(200, group, 'Group details fetched successfully.'));
});

/**
 * @description Invites/adds a member to a group by email. Restores soft-deleted memberships if applicable.
 * @route POST /api/v1/groups/:id/members
 */
export const addMember = asyncHandler(async (req, res) => {
  const groupId = req.params.id;
  const { email } = req.body;
  const requesterId = req.user.id;

  const membership = await groupService.addMember(groupId, email, requesterId);

  return res
    .status(200)
    .json(new ApiResponse(200, membership, 'Member added to group successfully.'));
});

/**
 * @description Removes a member from a group (soft delete).
 * @route DELETE /api/v1/groups/:id/members/:userId
 */
export const removeMember = asyncHandler(async (req, res) => {
  const groupId = req.params.id;
  const targetUserId = req.params.userId;
  const requesterId = req.user.id;

  const membership = await groupService.removeMember(groupId, targetUserId, requesterId);

  return res
    .status(200)
    .json(new ApiResponse(200, membership, 'Member removed from group successfully (soft-delete).'));
});
