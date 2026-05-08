import { isNonNullObject, isNumber } from '@/lib/guards';
import type { ExceptionPayload } from './types';

export function isExceptionPayload(payload: unknown): payload is ExceptionPayload {
  if (!isNonNullObject(payload)) {
    return false;
  }

  return (
    isNonNullObject(payload.exceptionDetails)
    && isNumber(payload.timestamp)
  );
}
