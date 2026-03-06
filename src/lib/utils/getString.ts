import { isString } from '@/lib/guards';

export function getString<T extends Record<string, unknown>>(
  meta: T | undefined,
  key: keyof T & string,
): string | undefined {
  const value = meta?.[key];

  return isString(value) ? value : undefined;
}
