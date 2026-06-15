import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';
import { buildLookupContext } from './memberLookupService.js';

// Configuration keys for column matching alternatives
const HEADERS = {
  DESCRIPTION: ['description', 'desc', 'memo', 'notes', 'title'],
  AMOUNT: ['amount', 'cost', 'value', 'price'],
  DATE: ['date', 'date_logged', 'expense_date'],
  CURRENCY: ['currency', 'curr'],
  PAYER: ['paid_by', 'paidby', 'paid by', 'payer', 'who_paid', 'who paid', 'paid_by_email', 'payer_email', 'payer email'],
  PARTICIPANTS: ['participants', 'split_between', 'split between', 'members', 'shares', 'split']
};

/**
 * Case-insensitive, space-insensitive utility to find the value of a column header.
 */
const findHeaderValue = (rowData, alternatives) => {
  const keys = Object.keys(rowData || {});
  for (const alt of alternatives) {
    const cleanAlt = alt.toLowerCase().replace(/[\s_-]/g, '');
    const foundKey = keys.find(k => k.toLowerCase().replace(/[\s_-]/g, '') === cleanAlt);
    if (foundKey !== undefined) {
      return { key: foundKey, value: rowData[foundKey] };
    }
  }
  return { key: null, value: undefined };
};

/**
 * Normalizes description strings for comparison.
 */
const normalizeDescription = (desc) => {
  return String(desc || '').trim().toLowerCase();
};

/**
 * Returns ISO Date String (YYYY-MM-DD) or null if invalid.
 */
const toISODate = (dateVal) => {
  if (!dateVal) return null;
  const dObj = new Date(dateVal);
  if (isNaN(dObj.getTime())) return null;
  return dObj.toISOString().split('T')[0];
};

/**
 * Check if the date string format is ambiguous (e.g. 10/11/2023).
 */
const checkAmbiguousDate = (dateStr) => {
  if (!dateStr) return false;
  const str = String(dateStr).trim();

  // Standard ISO formats (YYYY-MM-DD or YYYY/MM/DD) are unambiguous
  if (/^\d{4}[-/]\d{2}[-/]\d{2}$/.test(str)) {
    return false;
  }

  // Match DD/MM/YYYY or MM/DD/YYYY (or with dashes/dots) where year is last
  const match = str.match(/^(\d{1,2})[-/\.](\d{1,2})[-/\.](\d{2,4})$/);
  if (match) {
    const val1 = parseInt(match[1], 10);
    const val2 = parseInt(match[2], 10);
    if (val1 <= 12 && val2 <= 12 && val1 !== val2) {
      return true;
    }
  }

  return false;
};

/**
 * Check if description contains settlement-related keywords.
 */
const isSettlementDescription = (description) => {
  if (!description) return false;
  const descLower = description.toLowerCase();
  const settlementKeywords = [
    'settle',
    'settlement',
    'repayment',
    'payback',
    'repay',
    'transfer',
    'venmo',
    'cash app',
    'pay back',
    'debt pay',
    'debt payment',
    'clearing debt'
  ];
  return settlementKeywords.some(keyword => descLower.includes(keyword));
};

/**
 * Parses participants from a CSV row cell value.
 */
const parseParticipants = (participantsVal) => {
  if (!participantsVal) return [];
  return String(participantsVal)
    .split(/[,;|]/)
    .map(p => p.trim())
    .filter(Boolean);
};

/**
 * Detects all anomalies for a given ImportBatch and persists them to the database.
 * 
 * @param {string} importBatchId - UUID of the import batch
 * @returns {Promise<Array>} List of detected anomalies
 */
export const detectAndStoreAnomalies = async (importBatchId) => {
  const batch = await prisma.importBatch.findUnique({
    where: { id: importBatchId },
    include: { rows: true }
  });

  if (!batch) {
    throw new ApiError(404, 'Import batch not found.');
  }

  const groupId = batch.groupId;
  const rows = batch.rows;
  const anomaliesToCreate = [];

  // 1. Build lookup context
  const { resolveMember } = await buildLookupContext(groupId, rows);

  // 4. Pre-fetch existing group expenses to optimize database duplicate checking
  const uniqueDates = [];
  const uniqueAmounts = [];

  rows.forEach(({ data }) => {
    const dateVal = findHeaderValue(data, HEADERS.DATE).value;
    const amountVal = findHeaderValue(data, HEADERS.AMOUNT).value;

    const parsedDate = toISODate(dateVal);
    if (parsedDate) uniqueDates.push(new Date(parsedDate));

    const parsedAmount = parseFloat(amountVal);
    if (!isNaN(parsedAmount)) uniqueAmounts.push(parsedAmount);
  });

  let existingExpenses = [];
  if (groupId && uniqueDates.length > 0 && uniqueAmounts.length > 0) {
    existingExpenses = await prisma.expense.findMany({
      where: {
        groupId,
        date: { in: uniqueDates },
        amount: { in: uniqueAmounts }
      }
    });
  }

  // 5. Build lookup map for duplicates *within* this batch
  const batchSignatures = {};
  rows.forEach(({ rowNumber, data }) => {
    const descVal = findHeaderValue(data, HEADERS.DESCRIPTION).value;
    const dateVal = findHeaderValue(data, HEADERS.DATE).value;
    const amountVal = findHeaderValue(data, HEADERS.AMOUNT).value;
    const payerVal = findHeaderValue(data, HEADERS.PAYER).value;

    const descNorm = normalizeDescription(descVal);
    const dateNorm = toISODate(dateVal);
    const amtParsed = parseFloat(amountVal);
    const payerResolved = resolveMember(payerVal, dateNorm);

    if (descNorm && dateNorm && !isNaN(amtParsed) && payerResolved && payerResolved.matchedUser) {
      const sig = `${descNorm}|${dateNorm}|${amtParsed.toFixed(2)}|${payerResolved.matchedUser.id}`;
      if (!batchSignatures[sig]) {
        batchSignatures[sig] = [];
      }
      batchSignatures[sig].push(rowNumber);
    }
  });

  // 6. Run checks for each row
  for (const row of rows) {
    const rowData = row.data;
    const rowNum = row.rowNumber;

    const descVal = findHeaderValue(rowData, HEADERS.DESCRIPTION).value;
    const amountVal = findHeaderValue(rowData, HEADERS.AMOUNT).value;
    const dateVal = findHeaderValue(rowData, HEADERS.DATE).value;
    const currencyVal = findHeaderValue(rowData, HEADERS.CURRENCY).value;
    const payerVal = findHeaderValue(rowData, HEADERS.PAYER).value;
    const participantsVal = findHeaderValue(rowData, HEADERS.PARTICIPANTS).value;

    // --- ANOMALY 1: Duplicate Expense ---
    const descNorm = normalizeDescription(descVal);
    const dateNorm = toISODate(dateVal);
    const amtParsed = parseFloat(amountVal);
    const payerResolved = resolveMember(payerVal, dateNorm);

    let isDuplicate = false;

    if (descNorm && dateNorm && !isNaN(amtParsed) && payerResolved && payerResolved.matchedUser) {
      const sig = `${descNorm}|${dateNorm}|${amtParsed.toFixed(2)}|${payerResolved.matchedUser.id}`;
      
      // Check duplicate within the batch
      if (batchSignatures[sig] && batchSignatures[sig].length > 1) {
        const otherRows = batchSignatures[sig].filter(rNum => rNum !== rowNum);
        if (otherRows.length > 0) {
          isDuplicate = true;
          anomaliesToCreate.push({
            importBatchId,
            rowNumber: rowNum,
            anomalyType: 'DUPLICATE_EXPENSE',
            severity: 'HIGH',
            description: `This row is a duplicate of other row(s) in this batch: Row ${otherRows.join(', ')}.`,
            suggestedAction: 'Verify if multiple outlays occurred; reject or ignore this row if it is a duplicate.',
            rawContent: rowData
          });
        }
      }

      // Check duplicate against group history
      if (!isDuplicate && groupId) {
        const matchInDb = existingExpenses.some(exp => {
          const expDateStr = toISODate(exp.date);
          return (
            normalizeDescription(exp.description) === descNorm &&
            expDateStr === dateNorm &&
            parseFloat(exp.amount) === amtParsed &&
            exp.paidById === payerResolved.matchedUser.id
          );
        });

        if (matchInDb) {
          anomaliesToCreate.push({
            importBatchId,
            rowNumber: rowNum,
            anomalyType: 'DUPLICATE_EXPENSE',
            severity: 'HIGH',
            description: 'This expense matches an existing historical expense in the group database.',
            suggestedAction: 'Check group expense logs to confirm if this transaction has already been imported.',
            rawContent: rowData
          });
        }
      }
    }

    // --- ANOMALY 2: Invalid Date ---
    if (!dateVal || String(dateVal).trim() === '') {
      anomaliesToCreate.push({
        importBatchId,
        rowNumber: rowNum,
        anomalyType: 'INVALID_DATE',
        severity: 'CRITICAL',
        description: 'Transaction date is missing.',
        suggestedAction: 'Input a valid transaction date in the date column.',
        rawContent: rowData
      });
    } else {
      const parsedDate = new Date(dateVal);
      if (isNaN(parsedDate.getTime())) {
        anomaliesToCreate.push({
          importBatchId,
          rowNumber: rowNum,
          anomalyType: 'INVALID_DATE',
          severity: 'CRITICAL',
          description: `The date value "${dateVal}" cannot be parsed as a valid calendar date.`,
          suggestedAction: 'Manually verify and format the date string (e.g. YYYY-MM-DD).',
          rawContent: rowData
        });
      }
    }

    // --- ANOMALY 3: Ambiguous Date ---
    if (dateVal && checkAmbiguousDate(dateVal)) {
      anomaliesToCreate.push({
        importBatchId,
        rowNumber: rowNum,
        anomalyType: 'AMBIGUOUS_DATE',
        severity: 'MEDIUM',
        description: `The date "${dateVal}" is ambiguous. Slashes or dashes are used where both day and month are 12 or less.`,
        suggestedAction: 'Check if this represents Month/Day/Year or Day/Month/Year and format accordingly.',
        rawContent: rowData
      });
    }

    // --- ANOMALY 4: Missing Currency ---
    if (!currencyVal || String(currencyVal).trim() === '') {
      anomaliesToCreate.push({
        importBatchId,
        rowNumber: rowNum,
        anomalyType: 'MISSING_CURRENCY',
        severity: 'LOW',
        description: 'Currency code is missing.',
        suggestedAction: 'Default currency (USD) will be applied. Confirm if correct or specify currency code.',
        rawContent: rowData
      });
    }

    // --- ANOMALY 5: Negative Amount ---
    if (!isNaN(amtParsed) && amtParsed < 0) {
      anomaliesToCreate.push({
        importBatchId,
        rowNumber: rowNum,
        anomalyType: 'NEGATIVE_AMOUNT',
        severity: 'HIGH',
        description: `The expense amount "${amountVal}" is negative.`,
        suggestedAction: 'Review if this row represents a refund or settlement. If positive expense, correct the sign.',
        rawContent: rowData
      });
    }

    // --- ANOMALY 6 & 7: Unknown and Former Members (Payer check) ---
    if (!payerVal || String(payerVal).trim() === '') {
      anomaliesToCreate.push({
        importBatchId,
        rowNumber: rowNum,
        anomalyType: 'UNKNOWN_MEMBER',
        severity: 'CRITICAL',
        description: 'The payer email or name is missing.',
        suggestedAction: 'Assign a valid group member to the payer field.',
        rawContent: rowData
      });
    } else {
      const payerResult = resolveMember(payerVal, dateNorm);
      if (payerResult.anomalyType) {
        anomaliesToCreate.push({
          importBatchId,
          rowNumber: rowNum,
          anomalyType: payerResult.anomalyType,
          severity: payerResult.anomalyType === 'UNKNOWN_MEMBER' ? 'CRITICAL' : 'HIGH',
          description: payerResult.rootCause,
          suggestedAction: payerResult.anomalyType === 'UNKNOWN_MEMBER'
            ? 'Invite the user to the app and add them to the group, or correct the payer name/email.'
            : 'Re-activate membership if the member has rejoined, or change the designated payer.',
          rawContent: rowData
        });
      }
    }

    // --- ANOMALY 6 & 7: Unknown and Former Members (Participants split check) ---
    const participantsList = parseParticipants(participantsVal);
    participantsList.forEach(participant => {
      const partResult = resolveMember(participant, dateNorm);
      if (partResult.anomalyType) {
        anomaliesToCreate.push({
          importBatchId,
          rowNumber: rowNum,
          anomalyType: partResult.anomalyType,
          severity: partResult.anomalyType === 'UNKNOWN_MEMBER' ? 'CRITICAL' : 'HIGH',
          description: partResult.rootCause,
          suggestedAction: partResult.anomalyType === 'UNKNOWN_MEMBER'
            ? 'Invite the user to the app and add them to the group, or correct their details.'
            : 'Confirm if this historical split is valid, or remove them from participant list.',
          rawContent: rowData
        });
      }
    });

    // --- ANOMALY 8: Settlement Logged As Expense ---
    const hasSettlementKeywords = isSettlementDescription(descVal);
    if (hasSettlementKeywords) {
      anomaliesToCreate.push({
        importBatchId,
        rowNumber: rowNum,
        anomalyType: 'SETTLEMENT_LOGGED_AS_EXPENSE',
        severity: 'MEDIUM',
        description: `The description "${descVal}" suggests this is a settlement/payment rather than a shared group expense.`,
        suggestedAction: 'If this transaction resolves a balance between two members, record it as a Settlement.',
        rawContent: rowData
      });
    }
  }

  // 7. Write to database using high-performance transactions
  if (anomaliesToCreate.length > 0) {
    await prisma.importAnomaly.createMany({
      data: anomaliesToCreate
    });
  }

  // Fetch and return the newly saved anomalies
  return prisma.importAnomaly.findMany({
    where: { importBatchId },
    orderBy: [{ rowNumber: 'asc' }, { anomalyType: 'asc' }]
  });
};

/**
 * Retrieves all anomalies associated with a given batch ID.
 * 
 * @param {string} importBatchId - UUID of the import batch
 * @returns {Promise<Array>} List of anomalies
 */
export const getBatchAnomalies = async (importBatchId) => {
  return prisma.importAnomaly.findMany({
    where: { importBatchId },
    orderBy: [{ rowNumber: 'asc' }, { anomalyType: 'asc' }]
  });
};

/**
 * Updates the approval status of a specific anomaly.
 * 
 * @param {string} anomalyId - UUID of the anomaly
 * @param {string} status - PENDING, APPROVED, or REJECTED
 * @returns {Promise<Object>} The updated anomaly record
 */
export const updateAnomalyStatus = async (anomalyId, status) => {
  const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const anomaly = await prisma.importAnomaly.findUnique({
    where: { id: anomalyId }
  });

  if (!anomaly) {
    throw new ApiError(404, 'Anomaly record not found.');
  }

  return prisma.importAnomaly.update({
    where: { id: anomalyId },
    data: { status }
  });
};

export default {
  detectAndStoreAnomalies,
  getBatchAnomalies,
  updateAnomalyStatus
};
