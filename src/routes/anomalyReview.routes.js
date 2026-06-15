import { Router } from 'express';
import * as anomalyReviewController from '../controllers/anomalyReview.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// Protect review workflow endpoints with authMiddleware
router.use(authMiddleware);

// POST /anomalies/:id/approve - Approve an anomaly
router.post('/:id/approve', anomalyReviewController.approveAnomaly);

// POST /anomalies/:id/reject - Reject an anomaly
router.post('/:id/reject', anomalyReviewController.rejectAnomaly);

// PUT /anomalies/:id/edit - Edit row values and generate audit logs
router.put('/:id/edit', anomalyReviewController.editAnomaly);

export default router;
