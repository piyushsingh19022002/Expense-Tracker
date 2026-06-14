import { Router } from 'express';
import * as groupController from '../controllers/group.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validation.middleware.js';
import {
  createGroupSchema,
  getGroupDetailsSchema,
  addMemberSchema,
  removeMemberSchema
} from '../validations/group.validation.js';

const router = Router();

// Secure all group operations with authentication middleware
router.use(authMiddleware);

// POST /groups - Create a group
router.post('/', validate(createGroupSchema), groupController.createGroup);

// GET /groups - Fetch all groups user belongs to
router.get('/', groupController.getGroups);

// GET /groups/:id - Retrieve group details and member roster
router.get('/:id', validate(getGroupDetailsSchema), groupController.getGroupDetails);

// POST /groups/:id/members - Add a user to a group by email
router.post('/:id/members', validate(addMemberSchema), groupController.addMember);

// DELETE /groups/:id/members/:userId - Remove a user from a group (soft delete)
router.delete('/:id/members/:userId', validate(removeMemberSchema), groupController.removeMember);

export default router;
