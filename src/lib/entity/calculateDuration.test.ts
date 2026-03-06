import { describe, it, expect } from 'vitest';

import type { Entity } from '@/lib/wdparser/parsers/IParser';
import { calculateDuration } from './calculateDuration';

describe('calculateDuration', () => {
  it('should return duration from metadata', () => {
    const entity: Entity = { type: 'command', timestamp: 0, metadata: { duration: 1234 } };

    expect(calculateDuration(entity)).toBe(1234);
  });

  it('should return 0 if duration is 0', () => {
    const entity: Entity = { type: 'command', timestamp: 0, metadata: { duration: 0 } };

    expect(calculateDuration(entity)).toBe(0);
  });

  it('should return 0 if duration is absent', () => {
    const entity: Entity = { type: 'command', timestamp: 0, metadata: {} };

    expect(calculateDuration(entity)).toBe(0);
  });

  it('should return 0 if there is no metadata', () => {
    const entity: Entity = { type: 'command', timestamp: 0 };

    expect(calculateDuration(entity)).toBe(0);
  });
});
