import type { RemoteObject } from './types';
import { isString } from '@/lib/guards';

export const LONG_MESSAGE_THRESHOLD = 120;

export function getLongStringArgs(args: RemoteObject[]): string[] {
  return args
    .filter((a): a is RemoteObject & { value: string } => {
      const val = a.value;

      return isString(val) && val.length > LONG_MESSAGE_THRESHOLD;
    })
    .map((a) => a.value);
}
