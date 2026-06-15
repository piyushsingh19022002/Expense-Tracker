import { Router } from 'express';
import { normalizeMemberIdentifier } from '../utils/memberMatcher.js';
import { buildLookupContext } from '../services/memberLookupService.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

/**
 * @route GET /api/v1/debug/member-check
 * @description Diagnostic endpoint to verify member matching resolution.
 */
router.get('/member-check', asyncHandler(async (req, res) => {
  const groupId = req.query.groupId || req.body?.groupId;
  const memberName = req.query.memberName || req.body?.memberName;

  const normalizedName = normalizeMemberIdentifier(memberName);

  // Build lookup context targeting this memberName
  const mockCsvRows = memberName ? [{ data: { 'paid_by': memberName } }] : [];
  
  const lookupContext = await buildLookupContext(groupId, mockCsvRows);
  
  // Perform timeline resolution check
  const anomalyResult = lookupContext.resolveMember(memberName, new Date());

  const userFound = anomalyResult.matchedUser !== null;
  const membershipFound = anomalyResult.matchedMembership !== null;
  
  let activeMembership = false;
  if (anomalyResult.matchedMembership) {
    const mem = anomalyResult.matchedMembership;
    activeMembership = mem.status === 'ACTIVE' && (!mem.leftAt || new Date(mem.leftAt) >= new Date());
  }

  res.status(200).json({
    success: true,
    data: {
      normalizedName,
      userFound,
      membershipFound,
      activeMembership,
      anomalyResult: {
        anomalyType: anomalyResult.anomalyType,
        rootCause: anomalyResult.rootCause,
        matchedUser: anomalyResult.matchedUser ? {
          id: anomalyResult.matchedUser.id,
          email: anomalyResult.matchedUser.email,
          name: anomalyResult.matchedUser.name
        } : null,
        matchedMembership: anomalyResult.matchedMembership ? {
          id: anomalyResult.matchedMembership.id,
          groupId: anomalyResult.matchedMembership.groupId,
          userId: anomalyResult.matchedMembership.userId,
          status: anomalyResult.matchedMembership.status,
          leftAt: anomalyResult.matchedMembership.leftAt
        } : null
      }
    }
  });
}));

export default router;
