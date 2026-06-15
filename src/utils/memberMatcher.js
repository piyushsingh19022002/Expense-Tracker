/**
 * Normalizes a member identifier (name or email) for robust matching.
 * Trims leading/trailing whitespace, collapses multiple internal spaces,
 * and converts to lowercase.
 * 
 * @param {string} identifier - Input name or email string
 * @returns {string} Normalized string
 */
export const normalizeMemberIdentifier = (identifier) => {
  if (!identifier) return '';
  return String(identifier)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
};

/**
 * Checks if a candidate user's normalized email or name matches the normalized input identifier.
 * 
 * @param {string} identifier - Raw input identifier (e.g. name or email) from CSV
 * @param {Object} user - User object containing name and email
 * @returns {boolean} True if matched, false otherwise
 */
export const isUserMatch = (identifier, user) => {
  if (!identifier || !user) return false;
  
  const normInput = normalizeMemberIdentifier(identifier);
  if (!normInput) return false;

  const normEmail = normalizeMemberIdentifier(user.email);
  const normName = normalizeMemberIdentifier(user.name);

  // If the input identifier looks like an email address, match on email only.
  // Otherwise, match on exact name comparison.
  if (normInput.includes('@')) {
    return normEmail === normInput;
  }
  return normName === normInput;
};

/**
 * Searches a list of candidates to find a single user matching the input identifier.
 * 
 * @param {string} identifier - Input identifier
 * @param {Array<Object>} users - List of candidate User objects
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
