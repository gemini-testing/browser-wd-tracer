import type { AnyPairedEntity } from '@/lib/entity/types';

export function getPairKey(pair: AnyPairedEntity): string {
  const ts = pair.request?.timestamp ?? pair.response?.timestamp ?? '';

  return `${pair.command}-${ts}`;
}
