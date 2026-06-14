import { Router } from 'express';
import * as settlementController from '../controllers/settlement.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validation.middleware.js';
import {
  createSettlementSchema,
  getGroupSettlementsSchema,
  settlementIdSchema
} from '../validations/settlement.validation.js';

const router = Router();

// Protect all routes with JWT authorization
router.use(authMiddleware);

// POST /groups/:groupId/settlements - Record a new settlement
router.post('/groups/:groupId/settlements', validate(createSettlementSchema), settlementController.createSettlement);

// GET /groups/:groupId/settlements - List all settlements in a group
router.get('/groups/:groupId/settlements', validate(getGroupSettlementsSchema), settlementController.getSettlements);

// GET /settlements/:id - Fetch single settlement details
router.get('/settlements/:id', validate(settlementIdSchema), settlementController.getSettlement);

export default router;
