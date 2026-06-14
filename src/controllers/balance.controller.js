import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as balanceService from '../services/balanceService.js';
import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';

/**
 * @description Returns calculated balances for every member of a group.
 * Also includes "who owes whom" debt simplification pairs derived from net balances.
 *
 * GET /groups/:groupId/balances
 */
export const getGroupBalances = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;

  // Confirm the requesting user is an active member
  const membership = await prisma.membership.findUnique({
    where: { groupId_userId: { groupId, userId } }
  });
  if (!membership || membership.status !== 'ACTIVE') {
    throw new ApiError(403, 'Access denied. You are not an active member of this group.');
  }

  // Fetch all member balances
  const rawBalances = await balanceService.calculateGroupBalances(groupId);

  // Enrich with user names by fetching users in one query
  const userIds = rawBalances.map((b) => b.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true }
  });
  const userMap = {};
  users.forEach((u) => {
    userMap[u.id] = u;
  });

  const balances = rawBalances.map((b) => ({
    userId: b.userId,
    name: userMap[b.userId]?.name || 'Unknown',
    email: userMap[b.userId]?.email || '',
    totalPaid: b.totalPaid,
    totalShare: b.totalShare,
    netBalance: b.netBalance
  }));

  // --- Who Owes Whom (Greedy Debt Simplification) ---
  // Separate creditors (positive) from debtors (negative)
  const creditors = balances
    .filter((b) => b.netBalance > 0)
    .map((b) => ({ ...b, remaining: b.netBalance }));
  const debtors = balances
    .filter((b) => b.netBalance < 0)
    .map((b) => ({ ...b, remaining: Math.abs(b.netBalance) }));

  const owesWhom = [];

  let ci = 0;
  let di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor = debtors[di];
    const amount = Math.min(creditor.remaining, debtor.remaining);

    owesWhom.push({
      debtorId: debtor.userId,
      debtorName: debtor.name,
      creditorId: creditor.userId,
      creditorName: creditor.name,
      amount: Number(amount.toFixed(2))
    });

    creditor.remaining = Number((creditor.remaining - amount).toFixed(2));
    debtor.remaining = Number((debtor.remaining - amount).toFixed(2));

    if (creditor.remaining === 0) ci++;
    if (debtor.remaining === 0) di++;
  }

  return res.status(200).json(
    new ApiResponse(200, { balances, owesWhom }, 'Group balances calculated successfully.')
  );
});
