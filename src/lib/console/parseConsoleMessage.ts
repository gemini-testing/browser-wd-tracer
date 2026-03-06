import { isString } from '@/lib/guards';
import type { RemoteObject, MessageSegment } from './types';

function parseCssString(css: string): React.CSSProperties {
  return Object.fromEntries(
    css
      .split(';')
      .map((p) => p.trim())
      .filter(Boolean)
      .flatMap((prop) => {
        const colonIdx = prop.indexOf(':');

        if (colonIdx === -1) {
          return [];
        }

        const key = prop.slice(0, colonIdx).trim();
        const val = prop.slice(colonIdx + 1).trim();
        const camelKey = key.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

        return [[camelKey, val]];
      }),
  ) as React.CSSProperties;
}

function argToString(arg: RemoteObject): string {
  if (arg.value !== undefined) {
    return isString(arg.value) ? arg.value : JSON.stringify(arg.value);
  }

  return `[${arg.type}]`;
}

type SpecifierHandler = (
  arg: RemoteObject | undefined,
  currentStyle: React.CSSProperties | undefined,
) => { segment: MessageSegment | null; style: React.CSSProperties | undefined };

const specifierHandlers: Record<string, SpecifierHandler> = {
  c: (arg) => ({
    segment: null,
    style: arg ? parseCssString(String(arg.value ?? '')) : undefined,
  }),

  s: (arg, currentStyle) => ({
    segment: { text: arg ? String(arg.value ?? '') : '', style: currentStyle },
    style: currentStyle,
  }),

  d: (arg, currentStyle) => ({
    segment: { text: arg ? String(arg.value ?? '') : '', style: currentStyle },
    style: currentStyle,
  }),

  i: (arg, currentStyle) => ({
    segment: { text: arg ? String(arg.value ?? '') : '', style: currentStyle },
    style: currentStyle,
  }),

  f: (arg, currentStyle) => ({
    segment: { text: arg ? String(arg.value ?? '') : '', style: currentStyle },
    style: currentStyle,
  }),

  o: (arg, currentStyle) => ({
    segment: { text: arg ? argToString(arg) : '', style: currentStyle },
    style: currentStyle,
  }),

  O: (arg, currentStyle) => ({
    segment: { text: arg ? argToString(arg) : '', style: currentStyle },
    style: currentStyle,
  }),
};

export function parseConsoleMessage(args: RemoteObject[]): MessageSegment[] {
  if (args.length === 0) {
    return [];
  }

  const [first, ...rest] = args;
  const firstVal = isString(first?.value) ? first.value : null;

  if (firstVal === null || !/%[csdifoO]/.test(firstVal)) {
    return [{ text: args.map(argToString).join(' ') }];
  }

  const segments: MessageSegment[] = [];
  const specifierRegex = /%([csdifoO])/g;
  let argIdx = 1;
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  let currentStyle: React.CSSProperties | undefined;

  while ((match = specifierRegex.exec(firstVal)) !== null) {
    const before = firstVal.slice(lastIdx, match.index);

    if (before) {
      segments.push({ text: before, style: currentStyle });
    }

    const [, specifier] = match;
    const handler = specifier ? specifierHandlers[specifier] : undefined;
    const argVal = args[argIdx];

    if (handler) {
      const result = handler(argVal, currentStyle);
      currentStyle = result.style;

      if (result.segment) {
        segments.push(result.segment);
      }

      argIdx++;
    }

    lastIdx = match.index + match[0].length;
  }

  const tail = firstVal.slice(lastIdx);

  if (tail) {
    segments.push({ text: tail, style: currentStyle });
  }

  for (const arg of [...rest].slice(argIdx - 1)) {
    segments.push({ text: argToString(arg) });
  }

  return segments.filter((s) => s.text.trim());
}
