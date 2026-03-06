import { describe, it, expect } from 'vitest';

import { extractConsoleMessage } from './extractConsoleMessage';

describe('extractConsoleMessage', () => {
  it('should return flat text from all segments joined by space', () => {
    const result = extractConsoleMessage([
      { type: 'string', value: 'hello' },
      { type: 'string', value: 'world' },
    ]);

    expect(result).toBe('hello world');
  });

  it('should return empty string if args is empty', () => {
    expect(extractConsoleMessage([])).toBe('');
  });
});
