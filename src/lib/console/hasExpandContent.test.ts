import { describe, it, expect } from 'vitest';

import { hasExpandContent } from './hasExpandContent';
import { LONG_MESSAGE_THRESHOLD } from './getLongStringArgs';

describe('hasExpandContent', () => {
  it('should return true if payload contains stackTrace with callFrames', () => {
    const entity = {
      payload: {
        type: 'log',
        args: [],
        timestamp: 0,
        stackTrace: {
          callFrames: [{ functionName: 'fn', url: 'x', lineNumber: 0, columnNumber: 0 }],
        },
      },
    };

    expect(hasExpandContent(entity)).toBe(true);
  });

  it('should return true if payload contains an arg with object value', () => {
    const entity = {
      payload: {
        type: 'log',
        args: [{ type: 'object', value: { key: 'val' } }],
        timestamp: 0,
      },
    };

    expect(hasExpandContent(entity)).toBe(true);
  });

  it('should return true if payload contains a string arg longer than 120 characters', () => {
    const entity = {
      payload: {
        type: 'log',
        args: [{ type: 'string', value: 'x'.repeat(LONG_MESSAGE_THRESHOLD + 1) }],
        timestamp: 0,
      },
    };

    expect(hasExpandContent(entity)).toBe(true);
  });

  it('should return true if payload contains a preview-only object arg (no value)', () => {
    const entity = {
      payload: {
        type: 'log',
        args: [
          {
            type: 'object',
            description: 'Object',
            preview: { type: 'object' as const, properties: [{ name: 'x', type: 'number', value: '1' }] },
          },
        ],
        timestamp: 0,
      },
    };

    expect(hasExpandContent(entity)).toBe(true);
  });

  it('should return false if there is no stack, no objects, and no long strings', () => {
    const entity = {
      payload: {
        type: 'log',
        args: [{ type: 'string', value: 'short' }, { type: 'number', value: 1 }],
        timestamp: 0,
      },
    };

    expect(hasExpandContent(entity)).toBe(false);
  });
});
