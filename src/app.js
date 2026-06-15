import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import config from './config/index.js';
import logger from './utils/logger.js';
import rootRouter from './routes/index.js';
import errorMiddleware from './middlewares/error.middleware.js';
import ApiError from './utils/ApiError.js';

const app = express();

// 1. Configure CORS
// Support credentials matching by dynamically reflecting requesting origin
const corsOptions = {
  origin: (origin, callback) => {
    // If CORS_ORIGIN is '*' allow any requesting origin dynamically (required by credentials mode)
    if (config.corsOrigin === '*') {
      callback(null, true);
    } else {
      const allowedOrigins = config.corsOrigin.split(',').map(o => o.trim());
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS Policy: Request origin not allowed.'));
      }
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};
app.use(cors(corsOptions));

// 2. Request Logging via Morgan streaming to Winston logger
const morganFormat = config.isProduction ? 'combined' : 'dev';
app.use(morgan(morganFormat, { stream: logger.stream }));

// 3. Body Parsing & Cookie Parsing Middlewares with size limit security
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());

// 4. API Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: "API Running"
  });
});

// 5. API Routes Mounting
app.use('/api/v1', rootRouter);

// 5. 404 Routing Fallback Handler
app.use((req, res, next) => {
  next(new ApiError(404, `API resource not found: ${req.method} ${req.originalUrl}`));
});

// 6. Global Error Handler Middleware (must be mapped last)
app.use(errorMiddleware);

export { app };
export default app;
