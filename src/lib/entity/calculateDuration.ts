import type { Entity } from '@/lib/wdparser/parsers/IParser';
import { isNumber } from '@/lib/guards';

export function calculateDuration(entity: Entity): number {
  const duration = entity.metadata?.duration;

  return isNumber(duration) ? duration : 0;
}
