import { describe, it, expect } from 'vitest';

import { unixSecondsToDate } from './unixSecondsToDate';

describe('unixSecondsToDate', () => {
  it('should return a Date from unix seconds', () => {
    expect(unixSecondsToDate(1000)).toEqual(new Date(1000000));
  });

  it('should return Date(0) for 0', () => {
    expect(unixSecondsToDate(0)).toEqual(new Date(0));
  });
});
