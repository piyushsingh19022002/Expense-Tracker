import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';

/**
 * @description Calculates balance metrics (total paid, total share, net balance) for a specific user in a group.
 * 
 * @param {string} userId - User UUID
 * @param {string} groupId - Group UUID
 * @returns {Promise<Object>} Balance object: { userId, totalPaid, totalShare, netBalance }
 */
export const calculateUserBalance = async (userId, groupId) => {
  // 1. Validate group existence
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) {
    throw new ApiError(404, 'Group not found.');
  }

  // 2. Fetch sum of expenses paid by user in this group
  const paidSum = await prisma.expense.aggregate({
    _sum: { amount: true },
    where: {
      groupId,
      paidById: userId
    }
  });

  // 3. Fetch sum of participant shares for user in this group
  const shareSum = await prisma.expenseParticipant.aggregate({
    _sum: { share: true },
    where: {
      userId,
      expense: {
        groupId
      }
    }
  });

  const totalPaid = paidSum._sum.amount ? Number(paidSum._sum.amount) : 0;
  const totalShare = shareSum._sum.share ? Number(shareSum._sum.share) : 0;
  const netBalance = Number((totalPaid - totalShare).toFixed(2));

  return {
    userId,
    totalPaid: Number(totalPaid.toFixed(2)),
    totalShare: Number(totalShare.toFixed(2)),
    netBalance
  };
};

/**
 * @description Calculates balances for all members (active and historical) of a group.
 * 
 * @param {string} groupId - Group UUID
 * @returns {Promise<Array>} List of balance objects for each user
 */
export const calculateGroupBalances = async (groupId) => {
  // 1. Validate group existence and load memberships
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      memberships: true
    }
  });
  if (!group) {
    throw new ApiError(404, 'Group not found.');
  }

  // 2. Sum amounts paid by user in this group
  const expensesPaid = await prisma.expense.groupBy({
    by: ['paidById'],
    where: { groupId },
    _sum: { amount: true }
  });

  // 3. Sum participant shares in this group
  const expenseShares = await prisma.expenseParticipant.groupBy({
    by: ['userId'],
    where: {
      expense: {
        groupId
      }
    },
    _sum: { share: true }
  });

  // 4. Map results to dictionary lookups
  const paidMap = {};
  expensesPaid.forEach((item) => {
    paidMap[item.paidById] = item._sum.amount ? Number(item._sum.amount) : 0;
  });

  const shareMap = {};
  expenseShares.forEach((item) => {
    shareMap[item.userId] = item._sum.share ? Number(item._sum.share) : 0;
  });

  // 5. Gather all unique user IDs to ensure historical/left members are included
  const allUserIds = new Set([
    ...group.memberships.map((m) => m.userId),
    ...Object.keys(paidMap),
    ...Object.keys(shareMap)
  ]);

  // 6. Build the final balances array
  const balances = Array.from(allUserIds).map((userId) => {
    const totalPaid = paidMap[userId] || 0;
    const totalShare = shareMap[userId] || 0;
    const netBalance = Number((totalPaid - totalShare).toFixed(2));
    return {
      userId,
      totalPaid: Number(totalPaid.toFixed(2)),
      totalShare: Number(totalShare.toFixed(2)),
      netBalance
    };
  });

  return balances;
};

export default {
  calculateUserBalance,
  calculateGroupBalances
};
