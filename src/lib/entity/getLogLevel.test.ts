import { describe, it, expect } from 'vitest';

import type { Entity } from '@/lib/wdparser/parsers/IParser';
import { LogLevel } from '@/lib/wdparser/types/LogLevel';
import { getLogLevel } from './getLogLevel';

function entity(level: string): Entity {
  return { type: 'system', timestamp: 0, metadata: { level } };
}

describe('getLogLevel', () => {
  it('should return INFO level', () => {
    expect(getLogLevel(entity(LogLevel.INFO))).toBe(LogLevel.INFO);
  });

  it('should return DEBUG level', () => {
    expect(getLogLevel(entity(LogLevel.DEBUG))).toBe(LogLevel.DEBUG);
  });

  it('should return WARNING level', () => {
    expect(getLogLevel(entity(LogLevel.WARNING))).toBe(LogLevel.WARNING);
  });

  it('should return ERROR level', () => {
    expect(getLogLevel(entity(LogLevel.ERROR))).toBe(LogLevel.ERROR);
  });

  it('should return UNKNOWN for missing level', () => {
    expect(getLogLevel({ type: 'system', timestamp: 0, metadata: {} })).toBe(LogLevel.UNKNOWN);
  });
});
