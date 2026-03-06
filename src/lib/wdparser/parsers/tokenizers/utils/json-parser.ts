import { isString, isNumber } from '@/lib/guards';

const MAX_WARNINGS = 100;
const PREVIEW_LENGTH = 100;

let warnCount = 0;

export function parseJSON(text: string): unknown | undefined {
  try {
    return JSON.parse(text);
  } catch (error) {
    const isHugePayload = text.length > 50_000;

    if (!isHugePayload && warnCount < MAX_WARNINGS) {
      warnCount++;

      const preview = text.length > PREVIEW_LENGTH ? text.substring(0, PREVIEW_LENGTH) + '...' : text;

      console.warn(
        `Failed to parse JSON (length: ${text.length}):`,
        error instanceof Error ? error.message : error,
        '\nPreview:',
        preview,
      );

      if (warnCount === MAX_WARNINGS) {
        console.warn(`[json-parser] Reached ${MAX_WARNINGS} warnings. Further parse errors will be silent.`);
      }
    }

    return undefined;
  }
}

export function parseTimestamp(unix: unknown): number {
  if (isNumber(unix)) return unix;

  if (isString(unix)) {
    const parsed = parseFloat(unix);

    return isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}
