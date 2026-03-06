import { isString, isNumber } from '@/lib/guards';

export function withId(label: string, id: unknown): string {
  return isString(id) || isNumber(id)
    ? `${label} (${id})`
    : label;
}
