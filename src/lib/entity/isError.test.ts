import { describe, it, expect } from 'vitest';

import type { Entity } from '@/lib/wdparser/parsers/IParser';
import { LogLevel } from '@/lib/wdparser/types/LogLevel';
import { isError } from './isError';

function entity(level: string): Entity {
  return { type: 'system', timestamp: 0, metadata: { level } };
}

describe('isError', () => {
  it('should return true for ERROR', () => {
    expect(isError(entity(LogLevel.ERROR))).toBe(true);
  });

  it('should return true for SEVERE', () => {
    expect(isError(entity(LogLevel.SEVERE))).toBe(true);
  });

  it('should return true for WARNING', () => {
    expect(isError(entity(LogLevel.WARNING))).toBe(true);
  });

  it('should return false for DEBUG', () => {
    expect(isError(entity(LogLevel.DEBUG))).toBe(false);
  });

  it('should return false for INFO', () => {
    expect(isError(entity(LogLevel.INFO))).toBe(false);
  });

  it('should return false for UNKNOWN', () => {
    expect(isError(entity(LogLevel.UNKNOWN))).toBe(false);
  });
});
