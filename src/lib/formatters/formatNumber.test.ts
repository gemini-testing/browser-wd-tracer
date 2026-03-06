import { describe, it, expect } from 'vitest';

import { formatNumber } from './formatNumber';

describe('formatNumber', () => {
  it('should return "0" for 0', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('should format 1000 as "1,000"', () => {
    expect(formatNumber(1000)).toBe('1,000');
  });

  it('should format 1000000 as "1,000,000"', () => {
    expect(formatNumber(1000000)).toBe('1,000,000');
  });
});
