import { describe, it, expect } from 'vitest';

import { truncate } from './truncate';

describe('truncate', () => {
  it('should return the string unchanged if length <= 200', () => {
    const text = 'a'.repeat(200);

    expect(truncate(text)).toBe(text);
  });

  it('should truncate the string to 200 characters with ...', () => {
    const text = 'a'.repeat(201);

    expect(truncate(text)).toBe('a'.repeat(200) + '...');
  });

  it('should truncate to a custom maxLength', () => {
    expect(truncate('hello world', 5)).toBe('hello...');
  });

  it('should return an empty string unchanged', () => {
    expect(truncate('')).toBe('');
  });
});
