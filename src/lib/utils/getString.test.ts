import { describe, it, expect } from 'vitest';

import { getString } from './getString';

describe('getString', () => {
  it('should return the string value by key', () => {
    expect(getString({ level: 'info' }, 'level')).toBe('info');
  });

  it('should return undefined if the value is not a string', () => {
    expect(getString({ count: 42 }, 'count')).toBeUndefined();
  });

  it('should return undefined if the key is absent', () => {
    const meta: Record<string, unknown> = {};

    expect(getString(meta, 'level')).toBeUndefined();
  });

  it('should return undefined if meta === undefined', () => {
    expect(getString(undefined, 'level')).toBeUndefined();
  });
});
