import { Router } from 'express';
import * as importController from '../controllers/importController.js';
import * as reportController from '../controllers/reportController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import uploadCsvFile from '../middlewares/upload.middleware.js';

const router = Router();

router.use(authMiddleware);

// POST /imports/upload - Upload and persist parsed CSV rows as an import batch with anomaly detection
router.post('/upload', uploadCsvFile, importController.uploadImport);

// GET /imports/:batchId/anomalies - Retrieve anomalies for a specific import batch
router.get('/:batchId/anomalies', importController.getBatchAnomalies);

// PATCH /imports/anomalies/:anomalyId/status - Approve or reject an anomaly
router.patch('/anomalies/:anomalyId/status', importController.updateAnomalyStatus);

// GET /imports/:batchId/report - Generate import report for a batch
router.get('/:batchId/report', reportController.getImportReport);

export default router;

