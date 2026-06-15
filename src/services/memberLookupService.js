import prisma from '../config/prisma.js';
import { normalizeMemberIdentifier, findMatchingUser } from '../utils/memberMatcher.js';

// Configuration keys for column matching alternatives
const HEADERS = {
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
 * Builds lookup context mapping identifiers to users and membership statuses.
 * Pre-seeds DB records dynamically and provides quick in-memory verification.
 * 
 * @param {string} groupId - UUID of the group
 * @param {Array<Object>} csvRows - List of parsed ImportRow objects
 * @returns {Promise<Object>} Object exposing resolveMember() and diagnostic context details
 */
export const buildLookupContext = async (groupId, csvRows) => {
  if (!Array.isArray(csvRows)) {
    csvRows = [];
  }

  // 1. Gather all unique raw identifiers from the CSV rows
  const uniqueIdentifiers = new Set();
  
  csvRows.forEach(({ data }) => {
    const payerVal = findHeaderValue(data, HEADERS.PAYER).value;
    const participantsVal = findHeaderValue(data, HEADERS.PARTICIPANTS).value;

    if (payerVal) {
      const trimmed = String(payerVal).trim();
      if (trimmed) uniqueIdentifiers.add(trimmed);
    }

    parseParticipants(participantsVal).forEach(part => {
      const trimmed = String(part).trim();
      if (trimmed) uniqueIdentifiers.add(trimmed);
    });
  });

  const uniqueEmails = [];
  const uniqueNames = [];
  uniqueIdentifiers.forEach(id => {
    if (id.includes('@')) {
      uniqueEmails.push(id.trim());
    } else {
      uniqueNames.push(id.trim());
    }
  });

  // 2. Query system-wide users matching criteria with broad case-insensitive contains filters
  const OR_clauses = [];
  uniqueEmails.forEach(email => {
    OR_clauses.push({ email: { contains: email, mode: 'insensitive' } });
  });
  uniqueNames.forEach(name => {
    OR_clauses.push({ name: { contains: name, mode: 'insensitive' } });
  });

  let allMatchingUsers = [];
  if (OR_clauses.length > 0) {
    allMatchingUsers = await prisma.user.findMany({
      where: { OR: OR_clauses }
    });
  }

  // 3. Pre-fetch group memberships (including user properties)
  let memberships = [];
  if (groupId) {
    memberships = await prisma.membership.findMany({
      where: { groupId },
      include: { user: true }
    });
  }

  // Helper function to resolve a user system-wide or group-wide using the matching rules
  const findResolvedUserAndMembership = (identifier) => {
    if (!identifier) return { user: null, membership: null };

    // Try matching within the group's memberships first
    const groupUsers = memberships.map(m => m.user);
    const matchedGroupUser = findMatchingUser(identifier, groupUsers);

    if (matchedGroupUser) {
      const matchedMembership = memberships.find(m => m.userId === matchedGroupUser.id);
      return {
        user: matchedGroupUser,
        membership: matchedMembership
      };
    }

    // Try matching system-wide users
    const matchedSystemUser = findMatchingUser(identifier, allMatchingUsers);
    return {
      user: matchedSystemUser,
      membership: null
    };
  };

  // 4. Build resolution cache and print audit logs
  const resolutionCache = {};

  console.log('\n--- Step 1: Matching Resolution Debug Logs ---');
  for (const rawVal of uniqueIdentifiers) {
    const normVal = normalizeMemberIdentifier(rawVal);
    const { user, membership } = findResolvedUserAndMembership(rawVal);

    // Save initial match context to cache
    resolutionCache[normVal] = {
      user,
      membership
    };

    // Print Step 1 debug checklist log format
    console.log({
      csvValue: rawVal,
      normalizedValue: normVal,
      groupId: groupId || 'null',
      matchedUser: user ? { id: user.id, email: user.email, name: user.name } : null,
      matchedMembership: membership ? { id: membership.id, status: membership.status, leftAt: membership.leftAt } : null
    });
  }
  console.log('--- End of Step 1 Debug Logs ---\n');

  /**
   * Resolves a member and determines if an anomaly exists based on group timeline metrics.
   * 
   * @param {string} identifier - Payer or participant name/email from CSV
   * @param {string|Date} expenseDate - Date of transaction to verify timelines
   * @returns {Object} Resolve payload containing anomalyType, rootCause, matchedUser, matchedMembership
   */
  const resolveMember = (identifier, expenseDate) => {
    if (!identifier) {
      return {
        anomalyType: 'UNKNOWN_MEMBER',
        rootCause: 'Member identifier is empty or missing',
        matchedUser: null,
        matchedMembership: null
      };
    }

    const norm = normalizeMemberIdentifier(identifier);
    const cached = resolutionCache[norm];

    // If not in cache (e.g. dynamic lookup during custom tests/review updates), run inline match
    let matchedUser = cached ? cached.user : null;
    let matchedMembership = cached ? cached.membership : null;

    if (!cached) {
      const resolved = findResolvedUserAndMembership(identifier);
      matchedUser = resolved.user;
      matchedMembership = resolved.membership;
    }

    // Step 4: Verify Group Membership
    // A user is NOT unknown if: User exists AND Membership exists for the import group
    if (!matchedUser) {
      return {
        anomalyType: 'UNKNOWN_MEMBER',
        rootCause: `User with identifier "${identifier}" does not exist in the system`,
        matchedUser: null,
        matchedMembership: null
      };
    }

    if (!matchedMembership && groupId) {
      return {
        anomalyType: 'UNKNOWN_MEMBER',
        rootCause: `User "${matchedUser.name}" exists in system, but has no membership record in this group (ID: ${groupId})`,
        matchedUser,
        matchedMembership: null
      };
    }

    // Step 5: Handle Former Members separately
    // Rules: User exists + Membership exists + leftAt < expenseDate -> FORMER_MEMBER (NOT UNKNOWN_MEMBER)
    if (matchedMembership) {
      const leftAtDate = matchedMembership.leftAt ? new Date(matchedMembership.leftAt) : null;
      const expDate = expenseDate ? new Date(expenseDate) : null;

      const leftBeforeExpense = leftAtDate && expDate && leftAtDate < expDate;
      const isStatusLeft = matchedMembership.status === 'LEFT';

      if (leftBeforeExpense || (isStatusLeft && !leftAtDate)) {
        return {
          anomalyType: 'FORMER_MEMBER',
          rootCause: `User "${matchedUser.name}" left the group (leftAt: ${leftAtDate || 'N/A'}, status: ${matchedMembership.status}) before transaction date (${expenseDate || 'N/A'})`,
          matchedUser,
          matchedMembership
        };
      }
    }

    // Valid active group member!
    return {
      anomalyType: null,
      rootCause: null,
      matchedUser,
      matchedMembership
    };
  };

  return {
    resolveMember,
    allMatchingUsers,
    memberships
  };
};

export default {
  buildLookupContext
};
