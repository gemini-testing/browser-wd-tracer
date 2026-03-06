import { describe, it, expect } from 'vitest';

import { formatDurationMs } from './formatDurationMs';

describe('formatDurationMs', () => {
  it('should round 1500.7 to 1501', () => {
    expect(formatDurationMs(1500.7)).toBe('1501');
  });

  it('should return "0" for 0', () => {
    expect(formatDurationMs(0)).toBe('0');
  });

  it('should round 99.4 to 99', () => {
    expect(formatDurationMs(99.4)).toBe('99');
  });
});
