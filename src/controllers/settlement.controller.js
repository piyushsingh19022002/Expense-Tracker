import * as settlementService from '../services/settlementService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @description Records a new payment settlement inside a group.
 * @route POST /api/v1/groups/:groupId/settlements
 */
export const createSettlement = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const settlementData = req.body;
  const requesterId = req.user.id;

  const settlement = await settlementService.createSettlement(groupId, settlementData, requesterId);

  return res
    .status(201)
    .json(new ApiResponse(201, settlement, 'Settlement recorded successfully.'));
});

/**
 * @description Fetches all settlements logged for a specific group.
 * @route GET /api/v1/groups/:groupId/settlements
 */
export const getSettlements = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;

  const settlements = await settlementService.getGroupSettlements(groupId, userId);

  return res
    .status(200)
    .json(new ApiResponse(200, settlements, 'Settlements fetched successfully.'));
});

/**
 * @description Retrieves full details of a specific settlement transaction.
 * @route GET /api/v1/settlements/:id
 */
export const getSettlement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const settlement = await settlementService.getSettlementDetails(id, userId);

  return res
    .status(200)
    .json(new ApiResponse(200, settlement, 'Settlement details fetched successfully.'));
});
