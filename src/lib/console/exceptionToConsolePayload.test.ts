import { describe, it, expect } from 'vitest';

import { exceptionToConsolePayload } from './exceptionToConsolePayload';
import type { ExceptionPayload } from './types';

const basePayload: ExceptionPayload = {
  exceptionDetails: {
    columnNumber: 750221,
    exception: {
      className: 'ReferenceError',
      description: 'ReferenceError: expect is not defined\n    at 96418 (script.js:1:750222)',
      type: 'object',
      subtype: 'error',
    },
    exceptionId: 1,
    executionContextId: 1,
    lineNumber: 0,
    scriptId: '20',
    stackTrace: {
      callFrames: [
        { functionName: '', url: 'https://example.com/script.js', lineNumber: 0, columnNumber: 750221 },
        { functionName: 'handleClick', url: 'https://example.com/app.js', lineNumber: 45, columnNumber: 12 },
      ],
    },
    text: 'Uncaught',
    url: 'https://example.com/script.js',
  },
  timestamp: 1778137688722,
};

describe('exceptionToConsolePayload', () => {
  it('should return type: error', () => {
    const result = exceptionToConsolePayload(basePayload);

    expect(result.type).toBe('error');
  });

  it('should use exception.description as message text', () => {
    const result = exceptionToConsolePayload(basePayload);

    expect(result.args).toEqual([
      { type: 'string', value: 'ReferenceError: expect is not defined\n    at 96418 (script.js:1:750222)' },
    ]);
  });

  it('should fall back to exceptionDetails.text if exception is missing', () => {
    const payload: ExceptionPayload = {
      ...basePayload,
      exceptionDetails: { ...basePayload.exceptionDetails, exception: undefined },
    };

    const result = exceptionToConsolePayload(payload);

    expect(result.args).toEqual([{ type: 'string', value: 'Uncaught' }]);
  });

  it('should pass through timestamp', () => {
    const result = exceptionToConsolePayload(basePayload);

    expect(result.timestamp).toBe(1778137688722);
  });

  it('should pass through stackTrace', () => {
    const result = exceptionToConsolePayload(basePayload);

    expect(result.stackTrace).toBe(basePayload.exceptionDetails.stackTrace);
  });

  it('should return undefined stackTrace if exceptionDetails has none', () => {
    const payload: ExceptionPayload = {
      ...basePayload,
      exceptionDetails: { ...basePayload.exceptionDetails, stackTrace: undefined },
    };

    const result = exceptionToConsolePayload(payload);

    expect(result.stackTrace).toBeUndefined();
  });
});
