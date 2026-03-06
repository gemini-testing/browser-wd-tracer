import { describe, it, expect } from 'vitest';

import type { Entity } from '@/lib/wdparser/parsers/IParser';
import { WebDriverEntityType } from '@/lib/wdparser/types/EntityType';
import { PairedEntityType } from '@/lib/entity/types';
import { pairEntities } from './pairEntities';

function command(session: string, cmd: string, ts = 1): Entity {
  return {
    type: WebDriverEntityType.Command,
    timestamp: ts,
    metadata: { session, command: cmd },
  };
}

function response(session: string, cmd: string, ts = 2): Entity {
  return {
    type: WebDriverEntityType.Response,
    timestamp: ts,
    metadata: { session, command: cmd },
  };
}

function httpRequest(url: string, command: string, ts = 1): Entity {
  return {
    type: WebDriverEntityType.Command,
    timestamp: ts,
    metadata: { url, command },
  };
}

function httpResponse(ts = 2): Entity {
  return {
    type: WebDriverEntityType.Response,
    timestamp: ts,
    metadata: {},
  };
}

describe('pairEntities', () => {
  it('should create a Pair from matching command + response', () => {
    const result = pairEntities([command('s1', 'getTitle'), response('s1', 'getTitle')]);

    expect(result).toHaveLength(1);
    expect(result[0]?.type).toBe(PairedEntityType.Pair);
    expect(result[0]?.command).toBe('getTitle');
  });

  it('should create an OrphanedCommand if there is no matching response', () => {
    const result = pairEntities([command('s1', 'findElement')]);

    expect(result).toHaveLength(1);
    expect(result[0]?.type).toBe(PairedEntityType.OrphanedCommand);
  });

  it('should create an OrphanedResponse if there is no matching command', () => {
    const result = pairEntities([response('s1', 'click')]);

    expect(result).toHaveLength(1);
    expect(result[0]?.type).toBe(PairedEntityType.OrphanedResponse);
  });

  it('should return [] for an empty array', () => {
    expect(pairEntities([])).toEqual([]);
  });

  it('should calculate duration as timestamp difference * 1000', () => {
    const result = pairEntities([command('s1', 'go', 1), response('s1', 'go', 3)]);

    expect(result[0]?.response?.duration).toBe(2000);
  });

  it('should pair different sessions independently', () => {
    const entities: Entity[] = [
      command('s1', 'click'),
      command('s2', 'click'),
      response('s2', 'click'),
      response('s1', 'click'),
    ];
    const result = pairEntities(entities);

    expect(result).toHaveLength(2);
    expect(result.every((p) => p.type === PairedEntityType.Pair)).toBe(true);
  });

  describe('DevTools HTTP pairs', () => {
    it('should pair HTTP request and response via FIFO and take command from pathname', () => {
      const result = pairEntities([
        httpRequest('http://localhost:39995/json/version', '/json/version', 1),
        httpResponse(2),
      ]);

      expect(result).toHaveLength(1);
      expect(result[0]?.type).toBe(PairedEntityType.Pair);
      expect(result[0]?.command).toBe('/json/version');
    });

    it('should pair two HTTP request/response pairs in order (FIFO)', () => {
      const result = pairEntities([
        httpRequest('http://localhost:39995/json/version', '/json/version', 1),
        httpRequest('http://localhost:39995/json/list', '/json/list', 2),
        httpResponse(3),
        httpResponse(4),
      ]);

      expect(result).toHaveLength(2);
      expect(result[0]?.command).toBe('/json/version');
      expect(result[1]?.command).toBe('/json/list');
    });
  });
});
