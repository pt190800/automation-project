// Observability: Structured logging with requestId

import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { LogEntry } from '../../shared/types/Trace';

const LOG_DIR = process.env.LOG_DIR || './artifacts/logs';
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(LOG_DIR, `automation-${new Date().toISOString().split('T')[0]}.log`),
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, requestId, step, duration, message }) => {
          const durationStr = duration ? ` (${duration}ms)` : '';
          return `${timestamp} [${level}] [${requestId}] ${step}: ${message}${durationStr}`;
        })
      ),
    }),
  ],
});

export class Logger {
  info(entry: Omit<LogEntry, 'timestamp' | 'level'>): void {
    logger.info({ ...entry, timestamp: new Date().toISOString(), level: 'info' });
  }

  warn(entry: Omit<LogEntry, 'timestamp' | 'level'>): void {
    logger.warn({ ...entry, timestamp: new Date().toISOString(), level: 'warn' });
  }

  error(entry: Omit<LogEntry, 'timestamp' | 'level'>): void {
    logger.error({ ...entry, timestamp: new Date().toISOString(), level: 'error' });
  }
}

export const loggerInstance = new Logger();
