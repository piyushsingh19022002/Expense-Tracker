import { Router } from 'express';
import { getHealthStatus } from '../controllers/health.controller.js';

const router = Router();

// Map base route to health check controller
router.route('/').get(getHealthStatus);

export default router;
