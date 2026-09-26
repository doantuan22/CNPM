import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes';
import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/notFound.middleware';

const app: Application = express();

// Middlewares
app.use(
  cors({
    origin: env.CORS_ORIGIN || env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
// 10mb: owner image-upload endpoints accept a base64 data URI in the JSON
// body (reuses the existing Cloudinary integration as-is, no multer/
// multipart parsing added) — the default 100kb limit is too small for that.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use('/api', routes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
