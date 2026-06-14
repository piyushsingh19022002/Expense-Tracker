import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';

/**
 * @description Records a new settlement transaction between two members of a group.
 * 
 * @param {string} groupId - Group UUID
 * @param {Object} data - Settlement information (payerId, payeeId, amount, currency, date)
 * @param {string} requesterId - User UUID performing the transaction
 * @returns {Promise<Object>} The recorded settlement with payer and receiver info
 */
export const createSettlement = async (groupId, data, requesterId) => {
  // 1. Validate that the group exists
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) {
    throw new ApiError(404, 'Group not found.');
  }

  // 2. Validate that requester is an active member
  const requesterMem = await prisma.membership.findUnique({
    where: { groupId_userId: { groupId, userId: requesterId } }
  });
  if (!requesterMem || requesterMem.status !== 'ACTIVE') {
    throw new ApiError(403, 'Access denied. You are not an active member of this group.');
  }

  // 3. Validate that the payer (payerId) is an active member
  const payerMem = await prisma.membership.findUnique({
    where: { groupId_userId: { groupId, userId: data.payerId } }
  });
  if (!payerMem || payerMem.status !== 'ACTIVE') {
    throw new ApiError(400, 'The designated payer must be an active member of this group.');
  }

  // 4. Validate that the receiver (payeeId) is an active member
  const payeeMem = await prisma.membership.findUnique({
    where: { groupId_userId: { groupId, userId: data.payeeId } }
  });
  if (!payeeMem || payeeMem.status !== 'ACTIVE') {
    throw new ApiError(400, 'The designated receiver (payee) must be an active member of this group.');
  }

  // 5. Ensure payer and receiver are different users
  if (data.payerId === data.payeeId) {
    throw new ApiError(400, 'Payer and receiver cannot be the same user.');
  }

  // 6. Record the Settlement in the database
  return prisma.settlement.create({
    data: {
      groupId,
      payerId: data.payerId,
      payeeId: data.payeeId,
      amount: data.amount,
      currency: data.currency || 'USD',
      date: data.date || new Date()
    },
    include: {
      payer: { select: { id: true, name: true, email: true } },
      payee: { select: { id: true, name: true, email: true } }
    }
  });
};

/**
 * @description Retrieves all settlements recorded inside a group.
 * 
 * @param {string} groupId - Group UUID
 * @param {string} userId - Requesting user UUID
 * @returns {Promise<Array>} List of settlements
 */
export const getGroupSettlements = async (groupId, userId) => {
  // 1. Confirm requester has active membership
  const membership = await prisma.membership.findUnique({
    where: { groupId_userId: { groupId, userId } }
  });
  if (!membership || membership.status !== 'ACTIVE') {
    throw new ApiError(403, 'Access denied. You are not an active member of this group.');
  }

  // 2. Fetch settlements sorted by date descending
  return prisma.settlement.findMany({
    where: { groupId },
    include: {
      payer: { select: { id: true, name: true, email: true } },
      payee: { select: { id: true, name: true, email: true } }
    },
    orderBy: {
      date: 'desc'
    }
  });
};

/**
 * @description Retrieves detailed information for a single settlement.
 * 
 * @param {string} id - Settlement UUID
 * @param {string} userId - Requesting user UUID
 * @returns {Promise<Object>} Settlement details
 */
export const getSettlementDetails = async (id, userId) => {
  // 1. Fetch settlement record
  const settlement = await prisma.settlement.findUnique({
    where: { id },
    include: {
      payer: { select: { id: true, name: true, email: true } },
      payee: { select: { id: true, name: true, email: true } }
    }
  });

  if (!settlement) {
    throw new ApiError(404, 'Settlement record not found.');
  }

  // 2. Validate requester is an active member of the group
  const membership = await prisma.membership.findUnique({
    where: { groupId_userId: { groupId: settlement.groupId, userId } }
  });
  if (!membership || membership.status !== 'ACTIVE') {
    throw new ApiError(403, 'Access denied. You are not an active member of this group.');
  }

  return settlement;
};

export default {
  createSettlement,
  getGroupSettlements,
  getSettlementDetails
};
