import type { RemoteObject } from './types';
import { isNonNullObject } from '@/lib/guards';

const hasPreviewProperties = (a: RemoteObject): boolean =>
  (a.preview?.properties?.length ?? 0) > 0;

export function getObjectArgs(args: RemoteObject[]): RemoteObject[] {
  return args.filter((a) => isNonNullObject(a.value) || hasPreviewProperties(a));
}
