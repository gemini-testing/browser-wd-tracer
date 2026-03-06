import type { RemoteObject } from './types';
import { parseConsoleMessage } from './parseConsoleMessage';

export function extractConsoleMessage(args: RemoteObject[]): string {
  return parseConsoleMessage(args)
    .map((s) => s.text)
    .join(' ');
}
