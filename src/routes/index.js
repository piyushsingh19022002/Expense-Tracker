import { Router } from 'express';
import healthRouter from './health.routes.js';

const router = Router();

// Register and namespace individual routers
router.use('/health', healthRouter);

// Extend here as new feature routes are developed:
// router.use('/users', userRouter);
// router.use('/expenses', expenseRouter);

export default router;
