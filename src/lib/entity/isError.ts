import type { Entity } from '@/lib/wdparser/parsers/IParser';
import { LogLevel } from '@/lib/wdparser/types/LogLevel';
import { getLogLevel } from './getLogLevel';

export function isError(entity: Entity): boolean {
  const level = getLogLevel(entity);

  return (
    level === LogLevel.ERROR ||
    level === LogLevel.SEVERE ||
    level === LogLevel.WARNING
  );
}
