import * as anomalyReviewService from '../services/anomalyReviewService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @description Manually resolves an anomaly by setting its status to APPROVED.
 * @route POST /api/v1/anomalies/:id/approve
 */
export const approveAnomaly = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const anomaly = await anomalyReviewService.approveAnomaly(id);

  return res
    .status(200)
    .json(new ApiResponse(200, anomaly, 'Anomaly successfully approved.'));
});

/**
 * @description Manually resolves an anomaly by setting its status to REJECTED.
 * @route POST /api/v1/anomalies/:id/reject
 */
export const rejectAnomaly = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const anomaly = await anomalyReviewService.rejectAnomaly(id);

  return res
    .status(200)
    .json(new ApiResponse(200, anomaly, 'Anomaly successfully rejected.'));
});

/**
 * @description Corrects cell values of the raw row related to an anomaly, logging an audit trail.
 * @route PUT /api/v1/anomalies/:id/edit
 */
export const editAnomaly = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { correctedData } = req.body;
  const userId = req.user.id;

  const result = await anomalyReviewService.editAnomalyRow(id, correctedData, userId);

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Row values successfully corrected and audit trail logged.'));
});

export default {
  approveAnomaly,
  rejectAnomaly,
  editAnomaly
};
