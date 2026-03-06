import type { TokenizerStrategy } from '../core/TokenizerStrategy.js';
import { webdriverPatterns } from './patterns.js';
import { parseJSON } from '../utils/json-parser.js';

// WebDriver prepends a timestamp prefix to every log line, including continuation lines
// of multiline JSON blocks. This regex strips that prefix before appending the line to the buffer.
// Unlike webdriverPatterns, it does not match COMMAND/RESPONSE — it applies to any line in this format.
//
// Example of a multiline block where each continuation line has a prefix:
//   2026-01-15T19:54:15+03:00 [1768496055.945][INFO]: [abc123] COMMAND InitSession {
//   2026-01-15T19:54:15+03:00   "capabilities": {
//   2026-01-15T19:54:15+03:00     "browserName": "chrome"
//   2026-01-15T19:54:15+03:00   }
//   2026-01-15T19:54:15+03:00 }
const WEBDRIVER_GENERIC_MULTILINE_PATTERN_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}\s+(?:\[\d+(?:\.\d+)?\]\[\w+\]:\s*)?/;

export const webDriverStrategy: TokenizerStrategy = {
  patterns: webdriverPatterns,

  preprocessLine(line: string): string {
    return line.replace(WEBDRIVER_GENERIC_MULTILINE_PATTERN_REGEX, '');
  },

  isNewRecord(line: string): boolean {
    return webdriverPatterns.some((p) => p.regex.test(line));
  },

  isComplete(buffer: string[]): boolean {
    const text = buffer.join('\n').trim();

    return parseJSON(text) !== undefined;
  },

  extractJsonStart(fields: Record<string, unknown>, remainder: string): string | null {
    const textToCheck = remainder || (fields.message as string) || '';

    const indices = [textToCheck.indexOf('{'), textToCheck.indexOf('[')].filter((i) => i !== -1);

    if (indices.length === 0) {
      return null;
    }

    const startIdx = Math.min(...indices);

    return textToCheck.substring(startIdx);
  },

  parsePayload(text: string): unknown {
    const trimmed = text.trim();
    const parsed = parseJSON(trimmed);

    return parsed !== undefined ? parsed : { _raw: trimmed };
  },

  parseInlinePayload(_fields: Record<string, unknown>, remainder: string): unknown | undefined {
    if (!remainder) {
      return undefined;
    }

    if (/^(ERROR|WARNING|SEVERE)\s/.test(remainder)) {
      return { _raw: remainder };
    }

    if (remainder.startsWith('{') && remainder.endsWith('}')) {
      const parsed = parseJSON(remainder);

      return parsed !== undefined ? parsed : { _raw: remainder };
    }

    return { _raw: remainder };
  },
};
