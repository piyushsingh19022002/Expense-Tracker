import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';

/**
 * @description Generates a comprehensive import report for a given CSV import batch.
 * Evaluates row-level anomalies dynamically to determine which rows are successfully
 * imported (no anomalies or all approved), failed (any rejected anomaly), or pending review.
 * 
 * @param {string} batchId - UUID of the import batch
 * @param {string} userId - UUID of the requesting user
 * @returns {Promise<Object>} Final JSON report
 */
export const generateImportReport = async (batchId, userId) => {
  // 1. Fetch import batch, its rows, and anomalies
  const batch = await prisma.importBatch.findUnique({
    where: { id: batchId },
    include: {
      rows: {
        orderBy: { rowNumber: 'asc' }
      },
      anomalies: {
        orderBy: { rowNumber: 'asc' }
      }
    }
  });

  if (!batch) {
    throw new ApiError(404, 'Import batch not found.');
  }

  // 2. Validate requester permissions
  if (batch.groupId) {
    const membership = await prisma.membership.findUnique({
      where: { groupId_userId: { groupId: batch.groupId, userId } }
    });
    if (!membership || membership.status !== 'ACTIVE') {
      throw new ApiError(403, 'Access denied. You must be an active member of this group to view this import report.');
    }
  } else if (batch.uploadedById !== userId) {
    throw new ApiError(403, 'Access denied. You do not have permission to view this import report.');
  }

  // 3. Group anomalies by rowNumber
  const anomaliesByRow = {};
  batch.anomalies.forEach((anomaly) => {
    if (!anomaliesByRow[anomaly.rowNumber]) {
      anomaliesByRow[anomaly.rowNumber] = [];
    }
    anomaliesByRow[anomaly.rowNumber].push(anomaly);
  });

  // 4. Classify rows based on anomaly statuses
  const importedRows = [];
  const failedRows = [];
  const pendingRows = [];

  batch.rows.forEach((row) => {
    const rowAnomalies = anomaliesByRow[row.rowNumber] || [];

    if (rowAnomalies.length === 0) {
      // No anomalies detected -> Imported
      importedRows.push({
        rowNumber: row.rowNumber,
        data: row.data
      });
    } else {
      const statuses = rowAnomalies.map((a) => a.status);
      
      if (statuses.includes('REJECTED')) {
        // Any anomaly rejected -> Failed/Rejected
        failedRows.push({
          rowNumber: row.rowNumber,
          data: row.data,
          anomalies: rowAnomalies.map((a) => ({
            id: a.id,
            type: a.anomalyType,
            severity: a.severity,
            description: a.description,
            status: a.status
          }))
        });
      } else if (statuses.includes('PENDING')) {
        // No rejected anomalies, but some are still pending review -> Pending Review
        pendingRows.push({
          rowNumber: row.rowNumber,
          data: row.data,
          anomalies: rowAnomalies.map((a) => ({
            id: a.id,
            type: a.anomalyType,
            severity: a.severity,
            description: a.description,
            status: a.status
          }))
        });
      } else {
        // All anomalies are APPROVED -> Imported
        importedRows.push({
          rowNumber: row.rowNumber,
          data: row.data,
          anomalies: rowAnomalies.map((a) => ({
            id: a.id,
            type: a.anomalyType,
            severity: a.severity,
            description: a.description,
            status: a.status
          }))
        });
      }
    }
  });

  // 5. Build report payload
  return {
    summary: {
      importBatchId: batch.id,
      fileName: batch.fileName,
      uploadDate: batch.uploadTime,
      totalRows: batch.totalRows
    },
    importedRows,
    failedRows,
    pendingRows,
    anomalies: batch.anomalies.map((a) => ({
      rowNumber: a.rowNumber,
      type: a.anomalyType,
      severity: a.severity,
      description: a.description,
      status: a.status,
      suggestedAction: a.suggestedAction
    })),
    actionsTaken: {
      imported: importedRows.length,
      rejected: failedRows.length,
      pendingReview: pendingRows.length
    }
  };
};

export default {
  generateImportReport
};
