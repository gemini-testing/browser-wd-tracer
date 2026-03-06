import { describe, it, expect } from 'vitest';

import { remoteObjectToJson } from './remoteObjectToJson';

describe('remoteObjectToJson', () => {
  it('should return the object if arg.value is an object', () => {
    const result = remoteObjectToJson({ type: 'object', value: { key: 'val' } });

    expect(result).toEqual({ key: 'val' });
  });

  it('should build an object from preview.properties if value is null', () => {
    const result = remoteObjectToJson({
      type: 'object',
      preview: { type: 'object', properties: [{ name: 'x', type: 'number', value: '1' }] },
    });

    expect(result).toEqual({ x: '1' });
  });

  it('should return null if value is a primitive and preview is absent', () => {
    const result = remoteObjectToJson({ type: 'string', value: 'plain' });

    expect(result).toBeNull();
  });

  it('should return null if preview.properties is an empty array', () => {
    const result = remoteObjectToJson({ type: 'object', preview: { type: 'object', properties: [] } });

    expect(result).toBeNull();
  });
});
