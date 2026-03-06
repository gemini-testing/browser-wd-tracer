import { isNonNullObject } from '@/lib/guards';
import type { RemoteObject } from './types';

export function remoteObjectToJson(arg: RemoteObject): Record<string, unknown> | null {
  if (isNonNullObject(arg.value)) {
    return arg.value;
  }

  if (arg.preview?.properties && arg.preview.properties.length > 0) {
    return Object.fromEntries(
      arg.preview.properties.map(({ name, value }) => [name, value]),
    );
  }

  return null;
}
