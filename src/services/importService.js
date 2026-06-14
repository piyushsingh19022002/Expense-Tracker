import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';
import { parseCsvBuffer } from './csvParserService.js';

export const createCsvImport = async ({ file, uploadedById }) => {
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
        status: 'PARSED'
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

  return {
    importBatchId: importBatch.id,
    totalRows: importBatch.totalRows,
    parsedRows
  };
};

export default {
  createCsvImport
};
