import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import config from '../config/index.js';
import ApiError from '../utils/ApiError.js';

/**
 * @description Registers a new user in the database.
 * 
 * @param {string} name - User's name
 * @param {string} email - Unique email address
 * @param {string} password - Raw password
 * @returns {Promise<Object>} The newly created user (excluding password hash)
 */
export const register = async (name, email, password) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new ApiError(499, 'Email address is already in use.'); // 409 Conflict equivalent or Custom error
  }

  // Hash password using Bcrypt with a work factor of 12
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // Persist user record
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: passwordHash
    }
  });

  // Sanitize password field from output
  const { password: _, ...sanitizedUser } = user;
  return sanitizedUser;
};

/**
 * @description Authenticates credentials and returns a session JWT.
 * 
 * @param {string} email - Registered email address
 * @param {string} password - Input password
 * @returns {Promise<Object>} Object containing user details and signed JWT access token
 */
export const login = async (email, password) => {
  // Query database for user
  const user = await prisma.user.findUnique({
    where: { email }
  });

  // Security implication: Return generic warning message to defend against account/user enumeration
  if (!user) {
    throw new ApiError(401, 'Invalid email address or password.');
  }

  // Verify password matches bcrypt hash
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email address or password.');
  }

  // Sign JSON Web Token (JWT)
  const token = jwt.sign(
    { id: user.id, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiry }
  );

  // Sanitize password field from output
  const { password: _, ...sanitizedUser } = user;
  return { user: sanitizedUser, token };
};

/**
 * @description Fetches a user record by ID.
 * 
 * @param {string} id - User UUID
 * @returns {Promise<Object>} Sanitized user object
 */
export const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    throw new ApiError(404, 'User profile does not exist.');
  }

  const { password: _, ...sanitizedUser } = user;
  return sanitizedUser;
};
