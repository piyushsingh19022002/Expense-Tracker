import path from 'path';
import multer from 'multer';
import ApiError from '../utils/ApiError.js';

export const CSV_UPLOAD_FIELD_NAME = 'file';
export const CSV_MAX_FILE_SIZE_BYTES = Number(process.env.CSV_IMPORT_MAX_FILE_SIZE_BYTES || 5 * 1024 * 1024);

const CSV_MIME_TYPES = new Set([
  'text/csv',
  'application/csv',
  'application/vnd.ms-excel'
]);

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname || '').toLowerCase();
  const hasCsvExtension = extension === '.csv';
  const hasCsvMimeType = CSV_MIME_TYPES.has(file.mimetype);

  if (!hasCsvExtension || !hasCsvMimeType) {
    return cb(new ApiError(400, 'Only CSV files are supported for imports.'));
  }

  return cb(null, true);
};

const csvUpload = multer({
  storage,
  limits: {
    fileSize: CSV_MAX_FILE_SIZE_BYTES,
    files: 1
  },
  fileFilter
});

export const uploadCsvFile = (req, res, next) => {
  const uploadSingleCsv = csvUpload.single(CSV_UPLOAD_FIELD_NAME);

  uploadSingleCsv(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return next(new ApiError(400, `CSV file size must not exceed ${CSV_MAX_FILE_SIZE_BYTES} bytes.`));
      }

      return next(new ApiError(400, error.message));
    }

    return next(error);
  });
};

export default uploadCsvFile;
