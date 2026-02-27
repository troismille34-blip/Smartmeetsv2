import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: path.join(__dirname, '../../.env'),
});

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Database
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'smartmeets',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'secure_password',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your_super_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-4-turbo-preview',
    whisperModel: 'whisper-1',
  },

  // Outlook
  outlook: {
    clientId: process.env.OUTLOOK_CLIENT_ID || '',
    clientSecret: process.env.OUTLOOK_CLIENT_SECRET || '',
    redirectUri: process.env.OUTLOOK_REDIRECT_URI || 'http://localhost:3000/api/auth/outlook/callback',
    scopes: ['Calendars.ReadWrite', 'Mail.Send', 'offline_access'],
  },

  // Google
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback',
    scopes: ['calendar', 'https://www.googleapis.com/auth/gmail.send'],
  },

  // Email (SMTP)
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || 'noreply@smartmeets.app',
  },

  // Frontend
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
    prodUrl: process.env.FRONTEND_PROD_URL || 'https://smartmeets.app',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
  },
};

// Validate required env vars
export const validateConfig = () => {
  const required = [
    'OPENAI_API_KEY',
    'JWT_SECRET',
    'SMTP_USER',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`⚠️ Missing environment variables: ${missing.join(', ')}`);
    console.warn('⚠️ Some features may not work properly');
  }
};

export default config;
