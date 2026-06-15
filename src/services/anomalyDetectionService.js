import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';

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

  // 1. Gather all unique user emails and names to query system-wide users
  const uniqueEmails = new Set();
  const uniqueNames = new Set();

  rows.forEach(({ data }) => {
    const payerVal = findHeaderValue(data, HEADERS.PAYER).value;
    const participantsVal = findHeaderValue(data, HEADERS.PARTICIPANTS).value;

    if (payerVal) {
      const pStr = String(payerVal).trim();
      if (pStr.includes('@')) uniqueEmails.add(pStr.toLowerCase());
      else uniqueNames.add(pStr.toLowerCase());
    }

    parseParticipants(participantsVal).forEach(part => {
      if (part.includes('@')) uniqueEmails.add(part.toLowerCase());
      else uniqueNames.add(part.toLowerCase());
    });
  });

  // 2. Pre-fetch system-wide users
  const allMatchingUsers = await prisma.user.findMany({
    where: {
      OR: [
        { email: { in: Array.from(uniqueEmails), mode: 'insensitive' } },
        { name: { in: Array.from(uniqueNames), mode: 'insensitive' } }
      ]
    }
  });

  // 3. Pre-fetch group memberships (both ACTIVE and LEFT) if group context is available
  let memberships = [];
  if (groupId) {
    memberships = await prisma.membership.findMany({
      where: { groupId },
      include: { user: true }
    });
  }

  // Helper function to resolve email/name to user ID and group membership status
  const resolveUser = (identifier) => {
    if (!identifier) return null;
    const idClean = String(identifier).trim().toLowerCase();
    const isEmail = idClean.includes('@');

    // Attempt to match within the group's memberships first
    const groupMem = memberships.find(m => {
      return isEmail
        ? m.user.email.toLowerCase() === idClean
        : m.user.name.toLowerCase() === idClean;
    });

    if (groupMem) {
      return {
        user: groupMem.user,
        isMember: true,
        membershipStatus: groupMem.status // ACTIVE or LEFT
      };
    }

    // Attempt to match system-wide user
    const systemUser = allMatchingUsers.find(u => {
      return isEmail
        ? u.email.toLowerCase() === idClean
        : u.name.toLowerCase() === idClean;
    });

    if (systemUser) {
      return {
        user: systemUser,
        isMember: false,
        membershipStatus: null
      };
    }

    return null; // Totally unknown user
  };

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
    const payerUser = resolveUser(payerVal);

    if (descNorm && dateNorm && !isNaN(amtParsed) && payerUser) {
      const sig = `${descNorm}|${dateNorm}|${amtParsed.toFixed(2)}|${payerUser.user.id}`;
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
    const payerUser = resolveUser(payerVal);

    let isDuplicate = false;

    if (descNorm && dateNorm && !isNaN(amtParsed) && payerUser) {
      const sig = `${descNorm}|${dateNorm}|${amtParsed.toFixed(2)}|${payerUser.user.id}`;
      
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
            exp.paidById === payerUser.user.id
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
      const payerResolved = resolveUser(payerVal);
      if (!payerResolved) {
        anomaliesToCreate.push({
          importBatchId,
          rowNumber: rowNum,
          anomalyType: 'UNKNOWN_MEMBER',
          severity: 'CRITICAL',
          description: `The payer "${payerVal}" is not registered in the system or part of this group.`,
          suggestedAction: 'Invite the user to the app and add them to the group, or correct the payer name/email.',
          rawContent: rowData
        });
      } else if (!payerResolved.isMember) {
        anomaliesToCreate.push({
          importBatchId,
          rowNumber: rowNum,
          anomalyType: 'UNKNOWN_MEMBER',
          severity: 'CRITICAL',
          description: `The payer "${payerVal}" is a registered system user, but is not a member of this group.`,
          suggestedAction: 'Add the user as a member of this group to authorize their payments.',
          rawContent: rowData
        });
      } else if (payerResolved.membershipStatus === 'LEFT') {
        anomaliesToCreate.push({
          importBatchId,
          rowNumber: rowNum,
          anomalyType: 'FORMER_MEMBER',
          severity: 'HIGH',
          description: `The payer "${payerVal}" is a former member of this group (status: LEFT).`,
          suggestedAction: 'Re-activate membership if the member has rejoined, or change the designated payer.',
          rawContent: rowData
        });
      }
    }

    // --- ANOMALY 6 & 7: Unknown and Former Members (Participants split check) ---
    const participantsList = parseParticipants(participantsVal);
    participantsList.forEach(participant => {
      const partResolved = resolveUser(participant);
      if (!partResolved) {
        anomaliesToCreate.push({
          importBatchId,
          rowNumber: rowNum,
          anomalyType: 'UNKNOWN_MEMBER',
          severity: 'CRITICAL',
          description: `Split participant "${participant}" is not registered in the system or part of this group.`,
          suggestedAction: 'Invite the user to the app and add them to the group, or correct their details.',
          rawContent: rowData
        });
      } else if (!partResolved.isMember) {
        anomaliesToCreate.push({
          importBatchId,
          rowNumber: rowNum,
          anomalyType: 'UNKNOWN_MEMBER',
          severity: 'CRITICAL',
          description: `Split participant "${participant}" is a registered user, but is not a member of this group.`,
          suggestedAction: 'Add the user to the group to include them in the expense splits.',
          rawContent: rowData
        });
      } else if (partResolved.membershipStatus === 'LEFT') {
        anomaliesToCreate.push({
          importBatchId,
          rowNumber: rowNum,
          anomalyType: 'FORMER_MEMBER',
          severity: 'HIGH',
          description: `Split participant "${participant}" is a former member of this group (status: LEFT).`,
          suggestedAction: 'Confirm if this historical split is valid, or remove them from participant list.',
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
