import * as importService from '../services/importService.js';
import * as anomalyDetectionService from '../services/anomalyDetectionService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @description Uploads and parses a CSV import batch, auto-detecting any anomalies.
 * @route POST /api/v1/imports/upload
 */
export const uploadImport = asyncHandler(async (req, res) => {
  const result = await importService.createCsvImport({
    file: req.file,
    uploadedById: req.user.id,
    groupId: req.body.groupId || req.query.groupId
  });

  return res
    .status(201)
    .json(new ApiResponse(201, result, 'CSV import uploaded, parsed, and analyzed for anomalies.'));
});

/**
 * @description Retrieves all anomalies detected in a given batch.
 * @route GET /api/v1/imports/:batchId/anomalies
 */
export const getBatchAnomalies = asyncHandler(async (req, res) => {
  const { batchId } = req.params;
  const anomalies = await anomalyDetectionService.getBatchAnomalies(batchId);

  return res
    .status(200)
    .json(new ApiResponse(200, anomalies, 'Batch anomalies retrieved successfully.'));
});

/**
 * @description Approves or rejects a specific anomaly record.
 * @route PATCH /api/v1/imports/anomalies/:anomalyId/status
 */
export const updateAnomalyStatus = asyncHandler(async (req, res) => {
  const { anomalyId } = req.params;
  const { status } = req.body;

  const anomaly = await anomalyDetectionService.updateAnomalyStatus(anomalyId, status);

  return res
    .status(200)
    .json(new ApiResponse(200, anomaly, `Anomaly status updated to ${status} successfully.`));
});

export default {
  uploadImport,
  getBatchAnomalies,
  updateAnomalyStatus
};
