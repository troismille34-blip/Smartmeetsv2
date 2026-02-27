import 'express-async-errors';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import path from 'path';

// Config & Utils
import { config, validateConfig } from './config/env.js';
import { initializeDatabase, closeDatabase } from './config/database.js';
import { logger } from './utils/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/auth.js';
import transcriptionRoutes from './routes/transcriptions.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app: Express = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin: [
      config.frontend.url,
      config.frontend.prodUrl,
      'http://localhost:5173',
      'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Logging
if (config.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Request logging
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`, {
    query: req.query,
    userAgent: req.headers['user-agent'],
  });
  next();
});

// ============================================================================
// ROUTES
// ============================================================================

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'ok',
    environment: config.nodeEnv,
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transcriptions', transcriptionRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================================================
// SERVER STARTUP
// ============================================================================

async function startServer() {
  try {
    // Validate environment
    validateConfig();

    // Initialize database
    logger.info('📊 Initializing database...');
    await initializeDatabase();

    // Start listening
    app.listen(config.port, () => {
      logger.info(`✅ SmartMeets V2.0 Server Started`, {
        port: config.port,
        environment: config.nodeEnv,
        apiUrl: `http://localhost:${config.port}`,
        docsUrl: `http://localhost:${config.port}/api/docs`,
      });

      console.log(`
╔══════════════════════════════════════════════════════════╗
║       🎤 SmartMeets V2.0 Backend Server                 ║
╚══════════════════════════════════════════════════════════╝

✅ Server running at: http://localhost:${config.port}
📊 Database: ${config.database.name} (${config.database.host}:${config.database.port})
🤖 OpenAI: Whisper + GPT-4
🔐 Auth: JWT
📝 Transcription: Ready

API Endpoints:
  POST   /api/auth/register          - Register user
  POST   /api/auth/login             - Login user
  GET    /api/auth/profile           - Get user profile
  PUT    /api/auth/profile           - Update profile
  POST   /api/auth/logout            - Logout
  
  POST   /api/transcriptions/upload  - Upload & transcribe audio
  GET    /api/transcriptions/:id     - Get transcript
  PATCH  /api/transcriptions/:id     - Update segment
  DELETE /api/transcriptions/:id     - Delete transcript

Get started:
  1. Create .env from .env.example
  2. Run: npm run db:init
  3. API is ready to use! 🚀
      `);
    });
  } catch (error) {
    logger.error('❌ Server startup failed', error);
    process.exit(1);
  }
}

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await closeDatabase();
  process.exit(0);
});

// ============================================================================
// START SERVER
// ============================================================================

startServer().catch((error) => {
  logger.error('Fatal error starting server', error);
  process.exit(1);
});

export default app;
