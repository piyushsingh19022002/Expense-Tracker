import * as importReportService from '../services/importReportService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @description Retrieves a structured JSON import report for a given CSV batch.
 * @route GET /api/v1/imports/:batchId/report
 */
export const getImportReport = asyncHandler(async (req, res) => {
  const { batchId } = req.params;
  const userId = req.user.id;

  const report = await importReportService.generateImportReport(batchId, userId);

  return res
    .status(200)
    .json(new ApiResponse(200, report, 'Import report generated successfully.'));
});

export default {
  getImportReport
};
