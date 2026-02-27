import { config } from '../config/env.js';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const COLORS = {
  debug: '\x1b[36m', // cyan
  info: '\x1b[32m',  // green
  warn: '\x1b[33m',  // yellow
  error: '\x1b[31m', // red
  reset: '\x1b[0m',
};

class Logger {
  private logLevel: number;

  constructor(level: LogLevel = 'info') {
    this.logLevel = LOG_LEVELS[level];
  }

  private log(level: LogLevel, message: string, data?: any) {
    if (LOG_LEVELS[level] < this.logLevel) return;

    const timestamp = new Date().toISOString();
    const color = COLORS[level];
    const reset = COLORS.reset;

    let output = `${color}[${timestamp}] ${level.toUpperCase()}:${reset} ${message}`;

    if (data) {
      output += ` ${JSON.stringify(data, null, 2)}`;
    }

    console.log(output);
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }
}

export const logger = new Logger(config.logging.level as LogLevel);

// Utility Functions
export const generateUUID = () => {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
};

export const formatDate = (date: Date): string => {
  return date.toISOString();
};

export const parseTimeString = (timeString: string): number => {
  const parts = timeString.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
};

export const formatSeconds = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (seconds > 0) return `${seconds} second${seconds > 1 ? 's' : ''} ago`;

  return 'just now';
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};

export const chunckAudio = (buffer: Buffer, chunkSize: number = 1024 * 1024): Buffer[] => {
  const chunks: Buffer[] = [];
  for (let i = 0; i < buffer.length; i += chunkSize) {
    chunks.push(buffer.slice(i, i + chunkSize));
  }
  return chunks;
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const retry = async <T>(
  fn: () => Promise<T>,
  options: { maxAttempts?: number; delay?: number } = {}
): Promise<T> => {
  const { maxAttempts = 3, delay = 1000 } = options;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      await sleep(delay * attempt);
    }
  }

  throw new Error('Retry failed');
};

export default {
  logger,
  generateUUID,
  formatDate,
  parseTimeString,
  formatSeconds,
  formatTimeAgo,
  validateEmail,
  sanitizeString,
  chunckAudio,
  sleep,
  retry,
};
