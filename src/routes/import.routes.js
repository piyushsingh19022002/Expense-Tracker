import { Router } from 'express';
import * as importController from '../controllers/importController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import uploadCsvFile from '../middlewares/upload.middleware.js';

const router = Router();

router.use(authMiddleware);

// POST /imports/upload - Upload and persist parsed CSV rows as an import batch
router.post('/upload', uploadCsvFile, importController.uploadImport);

export default router;
