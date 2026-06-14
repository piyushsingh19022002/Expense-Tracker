import { Router } from 'express';
import healthRouter from './health.routes.js';
import authRouter from './auth.routes.js';
import userRouter from './user.routes.js';
import groupRouter from './group.routes.js';

const router = Router();

// Register and namespace individual routers
router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/groups', groupRouter);

// Extend here as new feature routes are developed:
// router.use('/expenses', expenseRouter);

export default router;
