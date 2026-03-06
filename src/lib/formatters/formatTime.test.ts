import { describe, it, expect } from 'vitest';

import { formatTime } from './formatTime';

describe('formatTime', () => {
  it('should return time from an ISO string with timezone offset', () => {
    expect(formatTime('2026-01-15T19:54:15+03:00')).toBe('19:54:15');
  });

  it('should return time from an ISO string in UTC (Z)', () => {
    expect(formatTime('2026-01-15T08:30:00Z')).toBe('08:30:00');
  });

  it('should return the original string if there is no T part', () => {
    expect(formatTime('just-a-string')).toBe('just-a-string');
  });
});
