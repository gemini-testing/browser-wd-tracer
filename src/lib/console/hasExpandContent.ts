import type { ConsolePayload } from './types';
import { getLongStringArgs } from './getLongStringArgs';
import { getObjectArgs } from './getObjectArgs';

export function hasExpandContent(entity: { payload?: unknown }): boolean {
  const payload = entity.payload as ConsolePayload;
  const hasStack = (payload.stackTrace?.callFrames?.length ?? 0) > 0;
  const hasObjects = getObjectArgs(payload.args).length > 0;
  const hasLongMessage = getLongStringArgs(payload.args).length > 0;

  return hasStack || hasObjects || hasLongMessage;
}
