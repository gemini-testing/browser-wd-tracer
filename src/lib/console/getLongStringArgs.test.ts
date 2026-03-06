import { describe, it, expect } from 'vitest';

import { getLongStringArgs, LONG_MESSAGE_THRESHOLD } from './getLongStringArgs';

describe('getLongStringArgs', () => {
  it('should return strings longer than 120 characters', () => {
    const longStr = 'a'.repeat(LONG_MESSAGE_THRESHOLD + 1);

    expect(getLongStringArgs([{ type: 'string', value: longStr }])).toEqual([longStr]);
  });

  it('should exclude strings of exactly 120 characters', () => {
    const exact = 'b'.repeat(LONG_MESSAGE_THRESHOLD);

    expect(getLongStringArgs([{ type: 'string', value: exact }])).toEqual([]);
  });

  it('should exclude strings shorter than 120 characters', () => {
    expect(getLongStringArgs([{ type: 'string', value: 'short' }])).toEqual([]);
  });

  it('should exclude args with non-string value', () => {
    expect(getLongStringArgs([{ type: 'object', value: { x: 1 } }, { type: 'number', value: 999 }])).toEqual([]);
  });
});
