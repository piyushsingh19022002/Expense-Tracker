import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { getGroupBalances } from '../controllers/balance.controller.js';

const router = Router();

router.use(authMiddleware);

// GET /groups/:groupId/balances — Group balance summary + debt pairs
router.get('/:groupId/balances', getGroupBalances);

export default router;
