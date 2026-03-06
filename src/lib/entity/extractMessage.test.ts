import { describe, it, expect } from 'vitest';

import type { Entity } from '@/lib/wdparser/parsers/IParser';
import { WebDriverEntityType } from '@/lib/wdparser/types/EntityType';
import { extractMessage } from './extractMessage';

describe('extractMessage', () => {
  describe('Command type', () => {
    it('should return command with devtoolsId', () => {
      const entity: Entity = {
        type: WebDriverEntityType.Command,
        timestamp: 0,
        metadata: { command: 'newSession', devtoolsId: 123 },
      };

      expect(extractMessage(entity)).toBe('newSession (123)');
    });

    it('should return command without devtoolsId', () => {
      const entity: Entity = {
        type: WebDriverEntityType.Command,
        timestamp: 0,
        metadata: { command: 'getTitle' },
      };

      expect(extractMessage(entity)).toBe('getTitle');
    });

    it('should use url if command is absent', () => {
      const entity: Entity = {
        type: WebDriverEntityType.Command,
        timestamp: 0,
        metadata: { url: 'http://localhost/json', devtoolsId: 456 },
      };

      expect(extractMessage(entity)).toBe('http://localhost/json (456)');
    });

    it('should return "unknown" if both command and url are absent', () => {
      const entity: Entity = {
        type: WebDriverEntityType.Command,
        timestamp: 0,
        metadata: {},
      };

      expect(extractMessage(entity)).toBe('unknown');
    });
  });

  describe('Response type', () => {
    it('should return command with devtoolsId', () => {
      const entity: Entity = {
        type: WebDriverEntityType.Response,
        timestamp: 0,
        metadata: { command: 'newSession', devtoolsId: 789 },
      };

      expect(extractMessage(entity)).toBe('newSession (789)');
    });

    it('should use payload if command is absent', () => {
      const entity: Entity = {
        type: WebDriverEntityType.Response,
        timestamp: 0,
        payload: { status: 'ok' },
        metadata: {},
      };

      const result = extractMessage(entity);

      expect(result).toContain('status');
    });

    it('should return "unknown" if both command and payload are absent', () => {
      const entity: Entity = {
        type: WebDriverEntityType.Response,
        timestamp: 0,
        metadata: {},
      };

      expect(extractMessage(entity)).toBe('unknown');
    });

    it('should truncate a long payload to 200 characters', () => {
      const entity: Entity = {
        type: WebDriverEntityType.Response,
        timestamp: 0,
        payload: { data: 'a'.repeat(300) },
        metadata: {},
      };

      const result = extractMessage(entity);

      expect(result.length).toBeLessThanOrEqual(203);
      expect(result.endsWith('...')).toBe(true);
    });
  });

  describe('Other types', () => {
    it('should return message from metadata', () => {
      const entity: Entity = {
        type: 'system',
        timestamp: 0,
        metadata: { message: 'System started' },
      };

      expect(extractMessage(entity)).toBe('System started');
    });

    it('should truncate a long message to 200 characters', () => {
      const entity: Entity = {
        type: 'system',
        timestamp: 0,
        metadata: { message: 'x'.repeat(250) },
      };

      const result = extractMessage(entity);

      expect(result.length).toBe(203);
      expect(result.endsWith('...')).toBe(true);
    });

    it('should use raw if message is absent', () => {
      const entity: Entity = {
        type: 'unknown',
        timestamp: 0,
        raw: 'Raw log line',
        metadata: {},
      };

      expect(extractMessage(entity)).toBe('Raw log line');
    });

    it('should return the entity type if both message and raw are absent', () => {
      const entity: Entity = {
        type: 'unknown',
        timestamp: 0,
        metadata: {},
      };

      expect(extractMessage(entity)).toBe('unknown');
    });
  });
});
