import { describe, it, expect } from 'vitest';

import { getObjectArgs } from './getObjectArgs';

describe('getObjectArgs', () => {
  it('should return only args whose value is a non-null object', () => {
    const objectArg = { type: 'object', value: { a: 1 } };
    const result = getObjectArgs([{ type: 'string', value: 'text' }, objectArg]);

    expect(result).toEqual([objectArg]);
  });

  it('should exclude args with null value', () => {
    expect(getObjectArgs([{ type: 'null', value: null }])).toEqual([]);
  });

  it('should exclude args with undefined value', () => {
    expect(getObjectArgs([{ type: 'undefined' }])).toEqual([]);
  });

  it('should exclude args with primitive value', () => {
    expect(getObjectArgs([{ type: 'string', value: 'text' }, { type: 'number', value: 42 }])).toEqual([]);
  });

  it('should include args that have no value but have preview.properties', () => {
    const previewArg = {
      type: 'object',
      description: 'Object',
      preview: { type: 'object' as const, properties: [{ name: 'x', type: 'number', value: '1' }] },
    };

    expect(getObjectArgs([previewArg])).toEqual([previewArg]);
  });

  it('should exclude args with empty preview.properties', () => {
    const emptyPreviewArg = {
      type: 'object',
      description: 'Object',
      preview: { type: 'object' as const, properties: [] },
    };

    expect(getObjectArgs([emptyPreviewArg])).toEqual([]);
  });
});
