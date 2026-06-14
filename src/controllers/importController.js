import * as importService from '../services/importService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @description Uploads and parses a CSV import batch without mutating expenses.
 * @route POST /api/v1/imports/upload
 */
export const uploadImport = asyncHandler(async (req, res) => {
  const result = await importService.createCsvImport({
    file: req.file,
    uploadedById: req.user.id
  });

  return res
    .status(201)
    .json(new ApiResponse(201, result, 'CSV import uploaded and parsed successfully.'));
});
