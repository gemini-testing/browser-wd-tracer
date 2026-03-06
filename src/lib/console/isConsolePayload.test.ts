import { describe, it, expect } from 'vitest';

import { isConsolePayload } from './isConsolePayload';

describe('isConsolePayload', () => {
  it('should return true for a valid ConsolePayload', () => {
    expect(isConsolePayload({ type: 'log', args: [], timestamp: 0 })).toBe(true);
  });

  it('should return false if type is missing', () => {
    expect(isConsolePayload({ args: [], timestamp: 0 })).toBe(false);
  });

  it('should return false if args is missing', () => {
    expect(isConsolePayload({ type: 'log', timestamp: 0 })).toBe(false);
  });

  it('should return false if args is not an array', () => {
    expect(isConsolePayload({ type: 'log', args: 'bad', timestamp: 0 })).toBe(false);
  });

  it('should return false for null', () => {
    expect(isConsolePayload(null)).toBe(false);
  });

  it('should return false for a primitive', () => {
    expect(isConsolePayload('string')).toBe(false);
  });
});
