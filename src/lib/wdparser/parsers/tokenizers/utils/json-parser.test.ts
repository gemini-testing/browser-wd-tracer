import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseJSON, parseTimestamp } from './json-parser.js';

describe('parseJSON', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should parse an object', () => {
    const result = parseJSON('{"key": "value", "num": 42}');

    expect(result).toEqual({ key: 'value', num: 42 });
  });

  it('should parse an array', () => {
    const result = parseJSON('[1, 2, 3]');

    expect(result).toEqual([1, 2, 3]);
  });

  it('should parse a number primitive', () => {
    expect(parseJSON('42')).toBe(42);
  });

  it('should parse a string primitive', () => {
    expect(parseJSON('"hello"')).toBe('hello');
  });

  it('should parse a boolean primitive', () => {
    expect(parseJSON('true')).toBe(true);
    expect(parseJSON('false')).toBe(false);
  });

  it('should return null for "null" — valid JSON', () => {
    expect(parseJSON('null')).toBeNull();
  });

  it('should return undefined for invalid JSON', () => {
    expect(parseJSON('{invalid}')).toBeUndefined();
  });

  it('should return undefined for an empty string', () => {
    expect(parseJSON('')).toBeUndefined();
  });

  it('should not log a warning for payloads larger than 50KB', () => {
    const hugePayload = 'x'.repeat(51_000);

    parseJSON(hugePayload);

    expect(console.warn).not.toHaveBeenCalled();
  });

  it('should log a warning for invalid payload smaller than 50KB', () => {
    parseJSON('{invalid}');

    expect(console.warn).toHaveBeenCalled();
  });
});

describe('parseTimestamp', () => {
  it('should return a number as-is', () => {
    expect(parseTimestamp(1234567890.123)).toBe(1234567890.123);
    expect(parseTimestamp(0)).toBe(0);
  });

  it('should parse a string containing a number', () => {
    expect(parseTimestamp('1234567890.123')).toBe(1234567890.123);
    expect(parseTimestamp('0')).toBe(0);
  });

  it('should return 0 for a non-numeric string', () => {
    expect(parseTimestamp('not-a-number')).toBe(0);
    expect(parseTimestamp('')).toBe(0);
  });

  it('should return 0 for null', () => {
    expect(parseTimestamp(null)).toBe(0);
  });

  it('should return 0 for undefined', () => {
    expect(parseTimestamp(undefined)).toBe(0);
  });

  it('should return 0 for an object', () => {
    expect(parseTimestamp({})).toBe(0);
    expect(parseTimestamp([])).toBe(0);
  });
});
