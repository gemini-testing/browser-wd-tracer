import { LogLevel } from '@/lib/wdparser/types/LogLevel';

export const LEVEL_COLORS: Record<LogLevel, string> = {
  [LogLevel.ERROR]: 'red',
  [LogLevel.SEVERE]: 'volcano',
  [LogLevel.WARNING]: 'orange',
  [LogLevel.INFO]: 'blue',
  [LogLevel.DEBUG]: 'default',
  [LogLevel.UNKNOWN]: 'default',
};
