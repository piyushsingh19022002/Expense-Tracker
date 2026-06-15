/**
 * Normalizes a member identifier (name or email) for robust matching.
 * Trims leading/trailing whitespace, collapses multiple internal spaces,
 * converts to lowercase, and normalizes unicode to remove accent markers.
 * 
 * @param {string} value - Input string to normalize
 * @returns {string} Normalized string
 */
export const normalizeMemberIdentifier = (value) => {
  if (value === undefined || value === null) return '';
  return String(value)
    .normalize('NFD') // Decomposes accented characters into base letters + combining marks
    .replace(/[\u0300-\u036f]/g, '') // Strips all combining accent marks
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' '); // Collapses consecutive internal whitespaces into a single space
};

/**
 * Checks if a candidate user matches the input identifier using the three-stage check:
 * 1. Exact email match (case-insensitive, trimmed)
 * 2. Exact normalized name match (trimmed, unicode-normalized, lowercased, space-collapsed)
 * 3. Case-insensitive name match (case-insensitive, trimmed)
 * 
 * @param {string} identifier - Raw input identifier from CSV
 * @param {Object} user - User record from DB (should contain name and email)
 * @returns {boolean} True if matched, false otherwise
 */
export const isUserMatch = (identifier, user) => {
  if (!identifier || !user) return false;

  const rawInput = String(identifier).trim();
  const rawEmail = String(user.email).trim();
  const rawName = String(user.name).trim();

  // 1. Exact email match (case-insensitive, trimmed)
  if (rawInput.toLowerCase() === rawEmail.toLowerCase()) {
    return true;
  }

  // 2. Exact normalized name match (trimmed, unicode-normalized, lowercased, space-collapsed)
  const normInput = normalizeMemberIdentifier(identifier);
  const normName = normalizeMemberIdentifier(user.name);
  if (normInput && normName && normInput === normName) {
    return true;
  }

  // 3. Case-insensitive name match (case-insensitive, trimmed)
  if (rawInput.toLowerCase() === rawName.toLowerCase()) {
    return true;
  }

  return false;
};

/**
 * Searches a candidate list to find a user matching the identifier.
 * 
 * @param {string} identifier - Raw input identifier
 * @param {Array<Object>} users - List of candidate User records
 * @returns {Object|null} The matched User object or null
 */
export const findMatchingUser = (identifier, users) => {
  if (!identifier || !Array.isArray(users)) return null;
  return users.find(user => isUserMatch(identifier, user)) || null;
};

export default {
  normalizeMemberIdentifier,
  isUserMatch,
  findMatchingUser
};
