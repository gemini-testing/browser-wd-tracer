import { describe, it, expect } from 'vitest';

import { parseConsoleMessage } from './parseConsoleMessage';

describe('parseConsoleMessage', () => {
  it('should return [] if args is empty', () => {
    expect(parseConsoleMessage([])).toEqual([]);
  });

  it('should return a single segment with join(" ") if there are no format specifiers', () => {
    const result = parseConsoleMessage([
      { type: 'string', value: 'hello' },
      { type: 'string', value: 'world' },
    ]);

    expect(result).toEqual([{ text: 'hello world' }]);
  });

  it('should substitute a string argument at %s', () => {
    const result = parseConsoleMessage([
      { type: 'string', value: 'Value: %s' },
      { type: 'string', value: 'test' },
    ]);

    expect(result).toEqual([
      { text: 'Value: ', style: undefined },
      { text: 'test', style: undefined },
    ]);
  });

  it('should substitute a numeric argument at %d', () => {
    const result = parseConsoleMessage([
      { type: 'string', value: 'Count: %d' },
      { type: 'number', value: 42 },
    ]);

    expect(result).toEqual([
      { text: 'Count: ', style: undefined },
      { text: '42', style: undefined },
    ]);
  });

  it('should apply CSS style to the next segment after %c', () => {
    const result = parseConsoleMessage([
      { type: 'string', value: '%cStyled' },
      { type: 'string', value: 'color: red; font-weight: bold' },
    ]);

    expect(result).toEqual([{ text: 'Styled', style: { color: 'red', fontWeight: 'bold' } }]);
  });

  it('should correctly handle multiple format specifiers in one string', () => {
    const result = parseConsoleMessage([
      { type: 'string', value: 'a=%s b=%d' },
      { type: 'string', value: 'foo' },
      { type: 'number', value: 7 },
    ]);

    expect(result).toEqual([
      { text: 'a=', style: undefined },
      { text: 'foo', style: undefined },
      { text: ' b=', style: undefined },
      { text: '7', style: undefined },
    ]);
  });

  it('should append remaining args not consumed by the format string', () => {
    const result = parseConsoleMessage([
      { type: 'string', value: 'msg: %s' },
      { type: 'string', value: 'used' },
      { type: 'string', value: 'extra' },
    ]);

    expect(result).toEqual([
      { text: 'msg: ', style: undefined },
      { text: 'used', style: undefined },
      { text: 'extra' },
    ]);
  });

  it('should filter out segments with empty or whitespace-only text', () => {
    const result = parseConsoleMessage([
      { type: 'string', value: '%s' },
      { type: 'string', value: 'hello' },
    ]);

    expect(result).toEqual([{ text: 'hello', style: undefined }]);
  });
});
