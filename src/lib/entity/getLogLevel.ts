import type { Entity } from '@/lib/wdparser/parsers/IParser';
import { LogLevel } from '@/lib/wdparser/types/LogLevel';
import { isString } from '@/lib/guards';

export function getLogLevel(entity: Entity): LogLevel {
  const level = entity.metadata?.level;

  if (isString(level) && level in LogLevel) {
    return level as LogLevel;
  }

  return LogLevel.UNKNOWN;
}
