/**
 * @description Normalizes participant lists, supporting array of strings or array of objects.
 * @param {Array} participants 
 * @returns {Array|null} Normalized list of participant objects with a userId
 */
const normalizeParticipants = (participants) => {
  return participants.map((p) => {
    if (typeof p === 'string') {
      return { userId: p };
    }
    if (p && typeof p === 'object') {
      const userId = p.userId || p.id;
      return { ...p, userId };
    }
    return null;
  });
};

/**
 * @description Splits an amount equally among participants and distributes remainder cents fairly.
 * 
 * @param {number} amount - Total expense amount
 * @param {Array} participants - Array of participant user IDs or objects
 * @returns {Object} Result payload: { success: boolean, shares: Array, errors: Array }
 */
export const calculateEqualSplit = (amount, participants) => {
  const errors = [];
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    errors.push('Amount must be a positive number.');
  }
  if (!Array.isArray(participants) || participants.length === 0) {
    errors.push('Participants list cannot be empty.');
  }

  if (errors.length > 0) {
    return { success: false, shares: [], errors };
  }

  const normalized = normalizeParticipants(participants);
  if (normalized.some(p => !p || !p.userId)) {
    return { success: false, shares: [], errors: ['Each participant must have a valid userId.'] };
  }

  const count = normalized.length;
  const amountInCents = Math.round(amount * 100);
  const baseShareInCents = Math.floor(amountInCents / count);
  const remainderCents = amountInCents % count;

  const shares = normalized.map((p, index) => {
    // Distribute remainder cents one-by-one to the first `remainderCents` participants
    const extraCent = index < remainderCents ? 1 : 0;
    const shareAmount = (baseShareInCents + extraCent) / 100;
    return {
      userId: p.userId,
      share: shareAmount
    };
  });

  return {
    success: true,
    shares,
    errors: []
  };
};

/**
 * @description Validates that the sum of exact participant shares equals the total expense amount.
 * 
 * @param {number} amount - Total expense amount
 * @param {Array} participants - Array of objects containing userId and share (number)
 * @returns {Object} Result payload: { success: boolean, shares: Array, errors: Array }
 */
export const calculateExactSplit = (amount, participants) => {
  const errors = [];
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    errors.push('Amount must be a positive number.');
  }
  if (!Array.isArray(participants) || participants.length === 0) {
    errors.push('Participants list cannot be empty.');
  }

  if (errors.length > 0) {
    return { success: false, shares: [], errors };
  }

  const normalized = normalizeParticipants(participants);
  if (normalized.some(p => !p || !p.userId)) {
    return { success: false, shares: [], errors: ['Each participant must have a valid userId.'] };
  }

  const hasInvalidShare = normalized.some(
    (p) => typeof p.share !== 'number' || isNaN(p.share) || p.share < 0
  );
  if (hasInvalidShare) {
    return { success: false, shares: [], errors: ['Each participant must have a non-negative numerical share.'] };
  }

  const amountInCents = Math.round(amount * 100);
  const sumInCents = normalized.reduce((sum, p) => sum + Math.round(p.share * 100), 0);

  if (amountInCents !== sumInCents) {
    const sumFormatted = (sumInCents / 100).toFixed(2);
    const amountFormatted = amount.toFixed(2);
    return {
      success: false,
      shares: [],
      errors: [`The sum of participant shares (${sumFormatted}) must equal the total expense amount (${amountFormatted}).`]
    };
  }

  const shares = normalized.map((p) => ({
    userId: p.userId,
    share: Number(p.share.toFixed(2))
  }));

  return {
    success: true,
    shares,
    errors: []
  };
};

/**
 * @description Calculates participant shares using percentages and solves rounding errors via the Largest Remainder Method.
 * 
 * @param {number} amount - Total expense amount
 * @param {Array} participants - Array of objects containing userId and percentage (number)
 * @returns {Object} Result payload: { success: boolean, shares: Array, errors: Array }
 */
export const calculatePercentageSplit = (amount, participants) => {
  const errors = [];
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    errors.push('Amount must be a positive number.');
  }
  if (!Array.isArray(participants) || participants.length === 0) {
    errors.push('Participants list cannot be empty.');
  }

  if (errors.length > 0) {
    return { success: false, shares: [], errors };
  }

  const normalized = normalizeParticipants(participants);
  if (normalized.some(p => !p || !p.userId)) {
    return { success: false, shares: [], errors: ['Each participant must have a valid userId.'] };
  }

  const hasInvalidPercentage = normalized.some(
    (p) => typeof p.percentage !== 'number' || isNaN(p.percentage) || p.percentage < 0
  );
  if (hasInvalidPercentage) {
    return { success: false, shares: [], errors: ['Each participant must have a non-negative numerical percentage.'] };
  }

  const sumPercentages = normalized.reduce((sum, p) => sum + p.percentage, 0);
  if (Math.abs(sumPercentages - 100) > 0.001) {
    return {
      success: false,
      shares: [],
      errors: [`Percentages must sum to exactly 100%. Got ${sumPercentages.toFixed(3)}%.`]
    };
  }

  const amountInCents = Math.round(amount * 100);

  // 1. Calculate raw cents and initial rounded cents for each participant
  const items = normalized.map((p, idx) => {
    const rawCents = amountInCents * (p.percentage / 100);
    const initialCents = Math.round(rawCents);
    const fractionalDiff = rawCents - initialCents;
    return {
      userId: p.userId,
      percentage: p.percentage,
      initialCents,
      fractionalDiff,
      originalIndex: idx
    };
  });

  const sumInitialCents = items.reduce((sum, item) => sum + item.initialCents, 0);
  let diff = amountInCents - sumInitialCents;

  if (diff > 0) {
    // Positive discrepancy: Sort by fractional difference descending (highest positive fractions adjusted first)
    const sorted = [...items].sort((a, b) => {
      if (Math.abs(a.fractionalDiff - b.fractionalDiff) < 1e-9) {
        return a.originalIndex - b.originalIndex;
      }
      return b.fractionalDiff - a.fractionalDiff;
    });

    for (let i = 0; i < diff; i++) {
      const target = sorted[i % sorted.length];
      const match = items.find((item) => item.userId === target.userId);
      if (match) {
        match.initialCents += 1;
      }
    }
  } else if (diff < 0) {
    // Negative discrepancy: Sort by fractional difference ascending (most negative fractions adjusted first)
    const sorted = [...items].sort((a, b) => {
      if (Math.abs(a.fractionalDiff - b.fractionalDiff) < 1e-9) {
        return a.originalIndex - b.originalIndex;
      }
      return a.fractionalDiff - b.fractionalDiff;
    });

    const centsToSubtract = Math.abs(diff);
    for (let i = 0; i < centsToSubtract; i++) {
      const target = sorted[i % sorted.length];
      const match = items.find((item) => item.userId === target.userId);
      if (match) {
        match.initialCents -= 1;
      }
    }
  }

  // 2. Map back to final decimal shares
  const shares = items.map((item) => ({
    userId: item.userId,
    share: Number((item.initialCents / 100).toFixed(2))
  }));

  return {
    success: true,
    shares,
    errors: []
  };
};

export default {
  calculateEqualSplit,
  calculateExactSplit,
  calculatePercentageSplit
};
