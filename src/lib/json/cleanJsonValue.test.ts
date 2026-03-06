import { describe, it, expect } from 'vitest';

import { cleanJsonValue } from './cleanJsonValue';

describe('cleanJsonValue', () => {
  it('should return a primitive unchanged', () => {
    expect(cleanJsonValue(42)).toBe(42);
    expect(cleanJsonValue('hello')).toBe('hello');
    expect(cleanJsonValue(null)).toBe(null);
  });

  it('should remove undefined values from an object', () => {
    expect(cleanJsonValue({ a: 1, b: undefined, c: 'x' })).toEqual({ a: 1, c: 'x' });
  });

  it('should recursively remove undefined from a nested object', () => {
    expect(cleanJsonValue({ a: { b: undefined, c: 2 } })).toEqual({ a: { c: 2 } });
  });

  it('should process an array recursively', () => {
    expect(cleanJsonValue([{ a: 1, b: undefined }, { c: 3 }])).toEqual([{ a: 1 }, { c: 3 }]);
  });

  it('should return an empty object if all values are undefined', () => {
    expect(cleanJsonValue({ a: undefined, b: undefined })).toEqual({});
  });
});
