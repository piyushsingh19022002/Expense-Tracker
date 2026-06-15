import prisma from '../config/prisma.js';
import { normalizeMemberIdentifier, findMatchingUser } from '../utils/memberMatcher.js';
import logger from '../utils/logger.js';

// Configuration keys for columns
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
 * Builds a robust lookup context for a specific group and set of CSV rows.
 * Pre-seeds system-wide users and group memberships matching raw values,
 * and exposes a resolved cache resolver for instant O(1) row queries.
 * 
 * @param {string} groupId - UUID of the group (optional)
 * @param {Array<Object>} csvRows - List of ImportRow objects containing raw data
 * @returns {Promise<Object>} Object with resolveUser(identifier) function and debug metadata
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

  // Separate identifiers into names and emails for SQL pre-fetching
  const uniqueEmails = [];
  const uniqueNames = [];
  uniqueIdentifiers.forEach(id => {
    if (id.includes('@')) {
      uniqueEmails.push(id);
    } else {
      uniqueNames.push(id);
    }
  });

  // 2. Query matching users using a broad case-insensitive contains clause.
  // This ensures that even if database names have trailing spaces or other whitespace padding,
  // we still return them so the in-memory matcher can normalize and resolve them.
  const OR_clauses = [];
  uniqueEmails.forEach(email => {
    OR_clauses.push({ email: { contains: email.trim(), mode: 'insensitive' } });
  });
  uniqueNames.forEach(name => {
    OR_clauses.push({ name: { contains: name.trim(), mode: 'insensitive' } });
  });

  let allMatchingUsers = [];
  if (OR_clauses.length > 0) {
    allMatchingUsers = await prisma.user.findMany({
      where: { OR: OR_clauses }
    });
  }

  // 3. Query all memberships (ACTIVE or LEFT) for the group
  let memberships = [];
  if (groupId) {
    memberships = await prisma.membership.findMany({
      where: { groupId },
      include: { user: true }
    });
  }

  // 4. Build resolved cache and write detailed log audits
  const resolutionCache = {};
  const debugAudit = [];

  console.log('\n--- Member Resolution Lookup Audit Log ---');
  for (const rawVal of uniqueIdentifiers) {
    const normVal = normalizeMemberIdentifier(rawVal);
    let matchedUser = null;
    let isMember = false;
    let membershipStatus = null;

    // Check group memberships first
    const groupUsers = memberships.map(m => m.user);
    matchedUser = findMatchingUser(rawVal, groupUsers);

    if (matchedUser) {
      isMember = true;
      const mem = memberships.find(m => m.userId === matchedUser.id);
      membershipStatus = mem ? mem.status : null;
    } else {
      // Check system-wide matching users
      matchedUser = findMatchingUser(rawVal, allMatchingUsers);
      if (matchedUser && groupId) {
        // Double check in database in case membership record was created in parallel
        const mem = await prisma.membership.findUnique({
          where: { groupId_userId: { groupId, userId: matchedUser.id } },
          include: { user: true }
        });
        if (mem) {
          isMember = true;
          membershipStatus = mem.status;
        }
      }
    }

    const cachePayload = matchedUser ? {
      user: matchedUser,
      isMember,
      membershipStatus
    } : null;

    resolutionCache[normVal] = cachePayload;

    const auditLog = {
      csvValue: rawVal,
      normalizedValue: normVal,
      matchedMember: matchedUser ? `${matchedUser.name} (${matchedUser.email}) [ID: ${matchedUser.id}]` : 'NONE',
      membershipStatus: isMember ? `MEMBER (${membershipStatus})` : matchedUser ? 'SYSTEM USER (NOT IN GROUP)' : 'UNKNOWN'
    };

    debugAudit.push(auditLog);

    // Output to server logger
    console.log(`[Member Lookup] CSV: "${auditLog.csvValue}" -> Norm: "${auditLog.normalizedValue}" -> Match: ${auditLog.matchedMember} -> Status: ${auditLog.membershipStatus}`);
  }
  console.log('--- End of Lookup Audit Log ---\n');

  /**
   * Resolves a raw identifier to its matched user profile and membership context.
   * 
   * @param {string} identifier - Raw name/email identifier
   * @returns {Object|null} Matching payload: { user, isMember, membershipStatus } or null
   */
  const resolveUser = (identifier) => {
    if (!identifier) return null;
    const norm = normalizeMemberIdentifier(identifier);
    return resolutionCache[norm] || null;
  };

  return {
    resolveUser,
    debugAudit
  };
};

export default {
  buildLookupContext
};
