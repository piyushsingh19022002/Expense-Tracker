import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';

/**
 * @description Creates an expense and splits shares atomic-style.
 * 
 * @param {string} groupId - Group UUID
 * @param {Object} expenseData - Core expense information
 * @param {string} creatorId - User logging the expense
 * @returns {Promise<Object>} Created expense details
 */
export const createExpense = async (groupId, expenseData, creatorId) => {
  // 1. Validate that the group exists
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) {
    throw new ApiError(404, 'Group not found.');
  }

  // 2. Validate that the creator is an active member
  const creatorMem = await prisma.membership.findUnique({
    where: { groupId_userId: { groupId, userId: creatorId } }
  });
  if (!creatorMem || creatorMem.status !== 'ACTIVE') {
    throw new ApiError(403, 'Access denied. You are not an active member of this group.');
  }

  // 3. Validate that the payer (paidById) is an active member
  const payerMem = await prisma.membership.findUnique({
    where: { groupId_userId: { groupId, userId: expenseData.paidById } }
  });
  if (!payerMem || payerMem.status !== 'ACTIVE') {
    throw new ApiError(400, 'The designated payer must be an active member of this group.');
  }

  // 4. Validate that all participants are active members
  const participantIds = expenseData.participants.map((p) => p.userId);
  const uniqueIds = [...new Set(participantIds)];
  const activeMemberships = await prisma.membership.findMany({
    where: {
      groupId,
      userId: { in: uniqueIds },
      status: 'ACTIVE'
    }
  });
  if (activeMemberships.length !== uniqueIds.length) {
    throw new ApiError(400, 'All designated participants must be active members of this group.');
  }

  // 5. Calculate splits and check rounding balances
  const hasCustomShares = expenseData.participants.some((p) => p.share !== undefined);
  let finalShares = [];

  if (hasCustomShares) {
    // Custom split mode: verify every participant has a custom share and the sum matches the total
    const sumShares = expenseData.participants.reduce((sum, p) => sum + (p.share || 0), 0);
    // Allow a tiny rounding error margin of 0.01
    if (Math.abs(sumShares - expenseData.amount) > 0.01) {
      throw new ApiError(400, 'The sum of participant shares must equal the total expense amount.');
    }
    finalShares = expenseData.participants.map((p) => p.share);
  } else {
    // Equal split mode: calculate splits with precision balancing
    const count = expenseData.participants.length;
    const equalShare = Number((expenseData.amount / count).toFixed(2));
    finalShares = Array(count).fill(equalShare);

    const sumShares = equalShare * count;
    const difference = Number((expenseData.amount - sumShares).toFixed(2));
    // Correct precision deltas by adding/subtracting the difference to/from the first participant
    if (difference !== 0) {
      finalShares[0] = Number((finalShares[0] + difference).toFixed(2));
    }
  }

  // 6. Write to database using transactional rollback guarantees
  return prisma.$transaction(async (tx) => {
    const expense = await tx.expense.create({
      data: {
        groupId,
        description: expenseData.description,
        amount: expenseData.amount,
        currency: expenseData.currency,
        date: expenseData.date,
        paidById: expenseData.paidById,
        createdById: creatorId
      }
    });

    const participantRecords = expenseData.participants.map((p, index) => ({
      expenseId: expense.id,
      userId: p.userId,
      share: finalShares[index]
    }));

    await tx.expenseParticipant.createMany({
      data: participantRecords
    });

    // Fetch and return the fully populated relation context
    return tx.expense.findUnique({
      where: { id: expense.id },
      include: {
        paidBy: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });
  }, { timeout: 15000 });
};

/**
 * @description Fetches all expenses associated with a specific group.
 */
export const getGroupExpenses = async (groupId, userId) => {
  // 1. Confirm requester is active in group
  const membership = await prisma.membership.findUnique({
    where: { groupId_userId: { groupId, userId } }
  });
  if (!membership || membership.status !== 'ACTIVE') {
    throw new ApiError(403, 'Access denied. You are not an active member of this group.');
  }

  // 2. Retrieve expenses sorted by date descending
  return prisma.expense.findMany({
    where: { groupId },
    include: {
      paidBy: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      participants: {
        include: {
          user: { select: { id: true, name: true, email: true } }
        }
      }
    },
    orderBy: {
      date: 'desc'
    }
  });
};

/**
 * @description Retrieves full details of a specific expense.
 */
export const getExpenseDetails = async (expenseId, userId) => {
  // 1. Fetch expense details
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: {
      paidBy: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      participants: {
        include: {
          user: { select: { id: true, name: true, email: true } }
        }
      }
    }
  });

  if (!expense) {
    throw new ApiError(404, 'Expense record not found.');
  }

  // 2. Verify requester is active in group
  const membership = await prisma.membership.findUnique({
    where: { groupId_userId: { groupId: expense.groupId, userId } }
  });
  if (!membership || membership.status !== 'ACTIVE') {
    throw new ApiError(403, 'Access denied. You are not an active member of this group.');
  }

  return expense;
};

/**
 * @description Updates an existing expense, replacing participant splits in a transaction.
 */
export const updateExpense = async (expenseId, expenseData, userId) => {
  // 1. Verify expense exists
  const existingExpense = await prisma.expense.findUnique({
    where: { id: expenseId }
  });
  if (!existingExpense) {
    throw new ApiError(404, 'Expense record not found.');
  }

  const groupId = existingExpense.groupId;

  // 2. Validate that requester is an active member
  const requesterMem = await prisma.membership.findUnique({
    where: { groupId_userId: { groupId, userId } }
  });
  if (!requesterMem || requesterMem.status !== 'ACTIVE') {
    throw new ApiError(403, 'Access denied. You are not an active member of this group.');
  }

  // 3. Validate that payer is active
  const payerMem = await prisma.membership.findUnique({
    where: { groupId_userId: { groupId, userId: expenseData.paidById } }
  });
  if (!payerMem || payerMem.status !== 'ACTIVE') {
    throw new ApiError(400, 'The designated payer must be an active member of this group.');
  }

  // 4. Validate that all participants are active
  const participantIds = expenseData.participants.map((p) => p.userId);
  const uniqueIds = [...new Set(participantIds)];
  const activeMemberships = await prisma.membership.findMany({
    where: {
      groupId,
      userId: { in: uniqueIds },
      status: 'ACTIVE'
    }
  });
  if (activeMemberships.length !== uniqueIds.length) {
    throw new ApiError(400, 'All designated participants must be active members of this group.');
  }

  // 5. Calculate splits
  const hasCustomShares = expenseData.participants.some((p) => p.share !== undefined);
  let finalShares = [];

  if (hasCustomShares) {
    const sumShares = expenseData.participants.reduce((sum, p) => sum + (p.share || 0), 0);
    if (Math.abs(sumShares - expenseData.amount) > 0.01) {
      throw new ApiError(400, 'The sum of participant shares must equal the total expense amount.');
    }
    finalShares = expenseData.participants.map((p) => p.share);
  } else {
    const count = expenseData.participants.length;
    const equalShare = Number((expenseData.amount / count).toFixed(2));
    finalShares = Array(count).fill(equalShare);

    const sumShares = equalShare * count;
    const difference = Number((expenseData.amount - sumShares).toFixed(2));
    if (difference !== 0) {
      finalShares[0] = Number((finalShares[0] + difference).toFixed(2));
    }
  }

  // 6. Update database inside database write transaction
  return prisma.$transaction(async (tx) => {
    // Clear existing participants list
    await tx.expenseParticipant.deleteMany({
      where: { expenseId }
    });

    // Add new participants list
    const participantRecords = expenseData.participants.map((p, index) => ({
      expenseId,
      userId: p.userId,
      share: finalShares[index]
    }));

    await tx.expenseParticipant.createMany({
      data: participantRecords
    });

    // Update expense attributes
    await tx.expense.update({
      where: { id: expenseId },
      data: {
        description: expenseData.description,
        amount: expenseData.amount,
        currency: expenseData.currency,
        date: expenseData.date,
        paidById: expenseData.paidById
      }
    });

    // Return full loaded detail structure
    return tx.expense.findUnique({
      where: { id: expenseId },
      include: {
        paidBy: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });
  }, { timeout: 15000 });
};

/**
 * @description Deletes an expense. (Cascades to participant records automatically).
 */
export const deleteExpense = async (expenseId, userId) => {
  // 1. Fetch expense details
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId }
  });
  if (!expense) {
    throw new ApiError(404, 'Expense record not found.');
  }

  // 2. Verify requester is active member
  const membership = await prisma.membership.findUnique({
    where: { groupId_userId: { groupId: expense.groupId, userId } }
  });
  if (!membership || membership.status !== 'ACTIVE') {
    throw new ApiError(403, 'Access denied. You are not an active member of this group.');
  }

  // 3. Remove Expense
  await prisma.expense.delete({
    where: { id: expenseId }
  });

  return { id: expenseId };
};
