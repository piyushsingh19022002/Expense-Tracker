import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';

/**
 * @description Approves a detected anomaly by setting its status to APPROVED.
 * 
 * @param {string} id - Anomaly UUID
 * @returns {Promise<Object>} The updated anomaly record
 */
export const approveAnomaly = async (id) => {
  const anomaly = await prisma.importAnomaly.findUnique({ where: { id } });
  if (!anomaly) {
    throw new ApiError(404, 'Anomaly record not found.');
  }

  return prisma.importAnomaly.update({
    where: { id },
    data: { status: 'APPROVED' }
  });
};

/**
 * @description Rejects a detected anomaly by setting its status to REJECTED.
 * 
 * @param {string} id - Anomaly UUID
 * @returns {Promise<Object>} The updated anomaly record
 */
export const rejectAnomaly = async (id) => {
  const anomaly = await prisma.importAnomaly.findUnique({ where: { id } });
  if (!anomaly) {
    throw new ApiError(404, 'Anomaly record not found.');
  }

  return prisma.importAnomaly.update({
    where: { id },
    data: { status: 'REJECTED' }
  });
};

/**
 * @description Edits row values for an anomaly without losing the original CSV values.
 * Stores the corrected object in ImportRow.correctedData and adds an audit trail record
 * in the ImportAnomaly history.
 * 
 * @param {string} id - Anomaly UUID
 * @param {Object} newCorrectedData - The complete new set of corrected row fields
 * @param {string} userId - UUID of the user making the edit
 * @returns {Promise<Object>} An object containing the updated anomaly and the updated row
 */
export const editAnomalyRow = async (id, newCorrectedData, userId) => {
  if (!newCorrectedData || typeof newCorrectedData !== 'object') {
    throw new ApiError(400, 'Corrected row data is required and must be an object.');
  }

  // 1. Fetch anomaly and associated row in a transaction
  return prisma.$transaction(async (tx) => {
    const anomaly = await tx.importAnomaly.findUnique({
      where: { id }
    });

    if (!anomaly) {
      throw new ApiError(404, 'Anomaly record not found.');
    }

    const row = await tx.importRow.findUnique({
      where: {
        importBatchId_rowNumber: {
          importBatchId: anomaly.importBatchId,
          rowNumber: anomaly.rowNumber
        }
      }
    });

    if (!row) {
      throw new ApiError(404, 'Associated parsed row record not found.');
    }

    // Determine baseline row values to calculate diff against
    const currentValues = row.correctedData || row.data;
    
    // Find all changed fields
    const changedFields = {};
    const allKeys = new Set([...Object.keys(currentValues), ...Object.keys(newCorrectedData)]);
    
    allKeys.forEach((key) => {
      const oldVal = currentValues[key];
      const newVal = newCorrectedData[key];
      
      // Compare values stringified/coerced to avoid loose equality problems
      if (String(oldVal !== undefined ? oldVal : '') !== String(newVal !== undefined ? newVal : '')) {
        changedFields[key] = {
          oldValue: oldVal !== undefined ? oldVal : null,
          newValue: newVal !== undefined ? newVal : null
        };
      }
    });

    // If no values actually changed, avoid writing redundant history logs
    if (Object.keys(changedFields).length > 0) {
      // 2. Prepare new history log
      const auditLog = {
        timestamp: new Date().toISOString(),
        editedById: userId,
        changedFields
      };

      const existingHistory = Array.isArray(anomaly.history) ? anomaly.history : [];
      const updatedHistory = [...existingHistory, auditLog];

      // 3. Update ImportRow correctedData (never overwrite data field)
      const updatedRow = await tx.importRow.update({
        where: { id: row.id },
        data: { correctedData: newCorrectedData }
      });

      // 4. Update ImportAnomaly history and keep status as PENDING (user might want to review again)
      const updatedAnomaly = await tx.importAnomaly.update({
        where: { id: anomaly.id },
        data: {
          history: updatedHistory,
          status: 'PENDING' // Remains pending for final approval/rejection review
        }
      });

      return { anomaly: updatedAnomaly, row: updatedRow };
    }

    // Return current states if no changes made
    return { anomaly, row };
  });
};

export default {
  approveAnomaly,
  rejectAnomaly,
  editAnomalyRow
};
