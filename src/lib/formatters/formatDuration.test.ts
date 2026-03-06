import { describe, it, expect } from 'vitest';

import { formatDuration } from './formatDuration';

describe('formatDuration', () => {
  it('should return "0ms" for 0', () => {
    expect(formatDuration(0)).toBe('0ms');
  });

  it('should return "1s" for 1000ms', () => {
    expect(formatDuration(1000)).toBe('1s');
  });

  it('should return "2m" for 120000ms', () => {
    expect(formatDuration(120000)).toBe('2m');
  });
});
