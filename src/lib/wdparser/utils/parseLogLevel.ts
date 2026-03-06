import { LogLevel } from '../types/LogLevel.js';

const LOG_LEVEL_MAP: Readonly<Record<string, LogLevel>> = {
  DEBUG: LogLevel.DEBUG,
  INFO: LogLevel.INFO,
  WARNING: LogLevel.WARNING,
  WARN: LogLevel.WARNING,
  ERROR: LogLevel.ERROR,
  SEVERE: LogLevel.SEVERE,
};

export function parseLogLevel(level: string): LogLevel {
  return LOG_LEVEL_MAP[level.toUpperCase()] ?? LogLevel.INFO;
}
