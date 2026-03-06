import { describe, it, expect } from 'vitest';

import { formatStackTrace } from './formatStackTrace';

describe('formatStackTrace', () => {
  it('should format a named frame with URL as "at funcName (url:line:col)"', () => {
    const result = formatStackTrace({
      callFrames: [{ functionName: 'myFunc', url: 'http://app.js', lineNumber: 9, columnNumber: 4 }],
    });

    expect(result).toBe('    at myFunc (http://app.js:10:5)');
  });

  it('should use "(anonymous)" if functionName is empty', () => {
    const result = formatStackTrace({
      callFrames: [{ functionName: '', url: 'http://app.js', lineNumber: 0, columnNumber: 0 }],
    });

    expect(result).toBe('    at (anonymous) (http://app.js:1:1)');
  });

  it('should use "<anonymous>" as location if url is empty', () => {
    const result = formatStackTrace({
      callFrames: [{ functionName: 'fn', url: '', lineNumber: 0, columnNumber: 0 }],
    });

    expect(result).toBe('    at fn (<anonymous>)');
  });
});
