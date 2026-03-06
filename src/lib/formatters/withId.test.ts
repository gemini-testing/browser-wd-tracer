import { describe, it, expect } from 'vitest';

import { withId } from './withId';

describe('withId', () => {
  it('should append a string id to the label', () => {
    expect(withId('Session', 'abc123')).toBe('Session (abc123)');
  });

  it('should append a number id to the label', () => {
    expect(withId('Session', 42)).toBe('Session (42)');
  });

  it('should return label without id if id is an object', () => {
    expect(withId('Session', {})).toBe('Session');
  });

  it('should return label without id if id === null', () => {
    expect(withId('Session', null)).toBe('Session');
  });

  it('should return label without id if id === undefined', () => {
    expect(withId('Session', undefined)).toBe('Session');
  });
});
