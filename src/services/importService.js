import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';
import { parseCsvBuffer } from './csvParserService.js';
import { detectAndStoreAnomalies } from './anomalyDetectionService.js';

export const createCsvImport = async ({ file, uploadedById, groupId }) => {
  if (!file) {
    throw new ApiError(400, 'CSV file is required. Upload it using the "file" form field.');
  }

  const parsedRows = parseCsvBuffer(file.buffer);

  const importBatch = await prisma.$transaction(async (tx) => {
    const batch = await tx.importBatch.create({
      data: {
        fileName: file.originalname,
        uploadedById,
        totalRows: parsedRows.length,
        status: 'PARSED',
        groupId: groupId || null
      }
    });

    if (parsedRows.length > 0) {
      await tx.importRow.createMany({
        data: parsedRows.map((row) => ({
          importBatchId: batch.id,
          rowNumber: row.rowNumber,
          data: row.data
        }))
      });
    }

    return batch;
  }, { timeout: 15000 });

  // Execute anomaly detection for the batch
  const anomalies = await detectAndStoreAnomalies(importBatch.id);

  return {
    importBatchId: importBatch.id,
    totalRows: importBatch.totalRows,
    parsedRows,
    anomalies
  };
};

export default {
  createCsvImport
};

