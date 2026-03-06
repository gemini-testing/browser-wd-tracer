import type { Entity } from '@/lib/wdparser/parsers/IParser';
import { isString } from '@/lib/guards';

export function getEntityTimestamp(entity: Entity): string | number {
  const ts = entity.metadata?.timestamp;

  return isString(ts) ? ts : entity.timestamp;
}
