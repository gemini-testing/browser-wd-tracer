import { isNonNullObject } from '@/lib/guards';

/** Recursively removes undefined values from objects and arrays */
export function cleanJsonValue(val: unknown): unknown {
  if (Array.isArray(val)) {
    return val.map(cleanJsonValue);
  }

  if (isNonNullObject(val)) {
    return Object.fromEntries(
      Object.entries(val)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, cleanJsonValue(v)]),
    );
  }

  return val;
}
