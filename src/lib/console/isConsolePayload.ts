import { isNonNullObject, isString, isNumber } from '@/lib/guards';
import type { ConsolePayload } from './types';

export function isConsolePayload(payload: unknown): payload is ConsolePayload {
  if (!isNonNullObject(payload)) {
    return false;
  }

  return (
    isString(payload.type)
    && Array.isArray(payload.args)
    && isNumber(payload.timestamp)
  );
}
