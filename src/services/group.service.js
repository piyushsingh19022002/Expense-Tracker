import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';

/**
 * @description Creates a new group and automatically adds the creator as an active member.
 * 
 * @param {string} name - Name of the group
 * @param {string} description - Optional description
 * @param {string} creatorId - User ID of the creator
 * @returns {Promise<Object>} The created group and its active memberships
 */
export const createGroup = async (name, description, creatorId) => {
  return prisma.$transaction(async (tx) => {
    // 1. Create the Group record
    const group = await tx.group.create({
      data: {
        name,
        description
      }
    });

    // 2. Create the Membership for the group creator
    const membership = await tx.membership.create({
      data: {
        groupId: group.id,
        userId: creatorId,
        status: 'ACTIVE'
      }
    });

    return { group, creatorMembership: membership };
  });
};

/**
 * @description Fetches all groups where the user has an active membership.
 * 
 * @param {string} userId - ID of the authenticated user
 * @returns {Promise<Array>} List of groups the user belongs to
 */
export const getUserGroups = async (userId) => {
  const memberships = await prisma.membership.findMany({
    where: {
      userId,
      status: 'ACTIVE'
    },
    include: {
      group: {
        include: {
          memberships: {
            where: {
              status: 'ACTIVE'
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: {
      joinedAt: 'desc'
    }
  });

  return memberships.map((m) => m.group);
};

/**
 * @description Retrieves a single group's details, enforcing that the requester is a member.
 * 
 * @param {string} groupId - ID of the group
 * @param {string} userId - ID of the requesting user
 * @returns {Promise<Object>} The group details with all member records
 */
export const getGroupDetails = async (groupId, userId) => {
  // 1. Validate that the requesting user has an ACTIVE membership in the group
  const requesterMembership = await prisma.membership.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId
      }
    }
  });

  if (!requesterMembership || requesterMembership.status !== 'ACTIVE') {
    throw new ApiError(403, 'Access denied. You are not an active member of this group.');
  }

  // 2. Fetch the group details and all memberships (both active and left)
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      memberships: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          joinedAt: 'asc'
        }
      }
    }
  });

  if (!group) {
    throw new ApiError(404, 'Group not found.');
  }

  return group;
};

/**
 * @description Adds a user to a group by email. Restores soft-deleted memberships if they previously left.
 * 
 * @param {string} groupId - ID of the group
 * @param {string} email - Email of the user to add
 * @param {string} requesterId - ID of the user requesting the action
 * @returns {Promise<Object>} The created or updated membership details
 */
export const addMember = async (groupId, email, requesterId) => {
  // 1. Validate that the requester is an ACTIVE member of the group
  const requesterMembership = await prisma.membership.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId: requesterId
      }
    }
  });

  if (!requesterMembership || requesterMembership.status !== 'ACTIVE') {
    throw new ApiError(403, 'Access denied. You are not authorized to add members to this group.');
  }

  // 2. Look up the target user by email
  const targetUser = await prisma.user.findUnique({
    where: { email }
  });

  if (!targetUser) {
    throw new ApiError(404, `User with email '${email}' not found.`);
  }

  // 3. Check for existing membership record (either ACTIVE or LEFT)
  const existingMembership = await prisma.membership.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId: targetUser.id
      }
    }
  });

  if (existingMembership) {
    if (existingMembership.status === 'ACTIVE') {
      throw new ApiError(400, 'User is already an active member of this group.');
    }

    // 4. Restore the membership if the user previously left
    return prisma.membership.update({
      where: {
        groupId_userId: {
          groupId,
          userId: targetUser.id
        }
      },
      data: {
        status: 'ACTIVE',
        joinedAt: new Date(),
        leftAt: null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  // 5. Create a new membership if no prior record exists
  return prisma.membership.create({
    data: {
      groupId,
      userId: targetUser.id,
      status: 'ACTIVE'
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
};

/**
 * @description Removes a member from a group (soft delete).
 * 
 * @param {string} groupId - ID of the group
 * @param {string} targetUserId - ID of the user to remove
 * @param {string} requesterId - ID of the user requesting the removal
 * @returns {Promise<Object>} The updated membership record
 */
export const removeMember = async (groupId, targetUserId, requesterId) => {
  // 1. Validate that the requester is an ACTIVE member of the group
  const requesterMembership = await prisma.membership.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId: requesterId
      }
    }
  });

  if (!requesterMembership || requesterMembership.status !== 'ACTIVE') {
    throw new ApiError(403, 'Access denied. You are not authorized to remove members from this group.');
  }

  // 2. Locate the target membership
  const targetMembership = await prisma.membership.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId: targetUserId
      }
    }
  });

  if (!targetMembership || targetMembership.status !== 'ACTIVE') {
    throw new ApiError(404, 'Active membership not found in this group.');
  }

  // 3. Update the membership status to LEFT and assign the leftAt timestamp (Soft Delete)
  return prisma.membership.update({
    where: {
      groupId_userId: {
        groupId,
        userId: targetUserId
      }
    },
    data: {
      status: 'LEFT',
      leftAt: new Date()
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
};
