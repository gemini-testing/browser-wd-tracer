import { describe, it, expect } from 'vitest';

import type { PairedEntity } from '@/lib/entity/types';
import { PairedEntityType } from '@/lib/entity/types';
import { getPairKey } from './getPairKey';

describe('getPairKey', () => {
  it('should return "command-requestTimestamp" for a Pair', () => {
    const pair: PairedEntity<PairedEntityType.Pair> = {
      type: PairedEntityType.Pair,
      command: 'getTitle',
      request: { timestamp: 123456, metadata: {} },
      response: { timestamp: 123457, metadata: {}, duration: 1000 },
    };

    expect(getPairKey(pair)).toBe('getTitle-123456');
  });

  it('should return "command-requestTimestamp" for an OrphanedCommand', () => {
    const pair: PairedEntity<PairedEntityType.OrphanedCommand> = {
      type: PairedEntityType.OrphanedCommand,
      command: 'findElement',
      request: { timestamp: 654321, metadata: {} },
    };

    expect(getPairKey(pair)).toBe('findElement-654321');
  });

  it('should use response timestamp for an OrphanedResponse', () => {
    const pair: PairedEntity<PairedEntityType.OrphanedResponse> = {
      type: PairedEntityType.OrphanedResponse,
      command: 'click',
      response: { timestamp: 111156, metadata: {}, duration: 0 },
    };

    expect(getPairKey(pair)).toBe('click-111156');
  });

  it('should use empty string as timestamp if neither request nor response exists', () => {
    const pair: PairedEntity<PairedEntityType.OrphanedCommand> = {
      type: PairedEntityType.OrphanedCommand,
      command: 'unknown',
    };

    expect(getPairKey(pair)).toBe('unknown-');
  });
});
