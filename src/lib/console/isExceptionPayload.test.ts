import { describe, it, expect } from 'vitest';

import { isExceptionPayload } from './isExceptionPayload';

describe('isExceptionPayload', () => {
  it('should return true for a valid ExceptionPayload', () => {
    expect(
      isExceptionPayload({
        exceptionDetails: { text: 'Uncaught', lineNumber: 0, columnNumber: 0, exceptionId: 1 },
        timestamp: 1778137688722,
      }),
    ).toBe(true);
  });

  it('should return false if exceptionDetails is missing', () => {
    expect(isExceptionPayload({ timestamp: 1778137688722 })).toBe(false);
  });

  it('should return false if timestamp is missing', () => {
    expect(
      isExceptionPayload({
        exceptionDetails: { text: 'Uncaught', lineNumber: 0, columnNumber: 0, exceptionId: 1 },
      }),
    ).toBe(false);
  });

  it('should return false for null', () => {
    expect(isExceptionPayload(null)).toBe(false);
  });

  it('should return false for a primitive', () => {
    expect(isExceptionPayload('string')).toBe(false);
  });
});
