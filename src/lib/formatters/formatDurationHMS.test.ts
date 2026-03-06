import { describe, it, expect } from 'vitest';

import { formatDurationHMS } from './formatDurationHMS';

describe('formatDurationHMS', () => {
  it('should format 0 seconds as 00:00:00', () => {
    expect(formatDurationHMS(0)).toBe('00:00:00');
  });

  it('should format 90 seconds as 00:01:30', () => {
    expect(formatDurationHMS(90)).toBe('00:01:30');
  });

  it('should format 3661 seconds as 01:01:01', () => {
    expect(formatDurationHMS(3661)).toBe('01:01:01');
  });

  it('should handle negative numbers correctly (abs)', () => {
    expect(formatDurationHMS(-90)).toBe('00:01:30');
  });
});
