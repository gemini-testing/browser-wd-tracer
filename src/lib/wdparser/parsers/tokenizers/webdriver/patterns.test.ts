import { describe, it, expect } from 'vitest';
import type { PatternDef } from '../core/TokenizerStrategy.js';
import { webdriverPatterns } from './patterns.js';

const commandPattern = webdriverPatterns[0] as PatternDef;
const responsePattern = webdriverPatterns[1] as PatternDef;
const wsCommandPattern = webdriverPatterns[2] as PatternDef;
const wsResponsePattern = webdriverPatterns[3] as PatternDef;
const wsEventPattern = webdriverPatterns[4] as PatternDef;
const httpRequestPattern = webdriverPatterns[5] as PatternDef;
const httpResponsePattern = webdriverPatterns[6] as PatternDef;
const systemPattern = webdriverPatterns[7] as PatternDef;

describe('webdriverPatterns', () => {
  describe('WebDriver COMMAND', () => {
    const line = '2026-01-15T19:54:15+03:00 [1768496055.945][INFO]: [abc123] COMMAND InitSession {';

    it('should match a WebDriver command line', () => {
      expect(commandPattern.regex.test(line)).toBe(true);
    });

    it('should extract timestamp, unix, level, session, command groups', () => {
      const groups = commandPattern.regex.exec(line)?.groups;

      expect(groups).toMatchObject({
        timestamp: '2026-01-15T19:54:15+03:00',
        unix: '1768496055.945',
        level: 'INFO',
        session: 'abc123',
        command: 'InitSession',
      });
    });

    it('should not match a RESPONSE line', () => {
      const other = '2026-01-15T19:54:19+03:00 [1768496059.262][INFO]: [abc123] RESPONSE InitSession {';

      expect(commandPattern.regex.test(other)).toBe(false);
    });
  });

  describe('WebDriver RESPONSE', () => {
    const line = '2026-01-15T19:54:19+03:00 [1768496059.262][INFO]: [abc123] RESPONSE InitSession {';

    it('should match a WebDriver response line', () => {
      expect(responsePattern.regex.test(line)).toBe(true);
    });

    it('should extract timestamp, unix, level, session, command groups', () => {
      const groups = responsePattern.regex.exec(line)?.groups;

      expect(groups).toMatchObject({
        timestamp: '2026-01-15T19:54:19+03:00',
        unix: '1768496059.262',
        level: 'INFO',
        session: 'abc123',
        command: 'InitSession',
      });
    });

    it('should not match a COMMAND line', () => {
      const other = '2026-01-15T19:54:15+03:00 [1768496055.945][INFO]: [abc123] COMMAND InitSession {';

      expect(responsePattern.regex.test(other)).toBe(false);
    });
  });

  describe('DevTools WebSocket Command', () => {
    const line =
      '2026-01-15T19:54:19+03:00 [1768496059.163][DEBUG]: DevTools WebSocket Command: Target.getTargets (id=1) (session_id=) browser {';

    it('should match a DevTools WebSocket Command line', () => {
      expect(wsCommandPattern.regex.test(line)).toBe(true);
    });

    it('should extract timestamp, unix, level, command, id, devtoolsSession groups', () => {
      const groups = wsCommandPattern.regex.exec(line)?.groups;

      expect(groups).toMatchObject({
        timestamp: '2026-01-15T19:54:19+03:00',
        unix: '1768496059.163',
        level: 'DEBUG',
        command: 'Target.getTargets',
        id: '1',
        devtoolsSession: '',
      });
    });

    it('should not match a DevTools WebSocket Response line', () => {
      const other =
        '2026-01-15T19:54:19+03:00 [1768496059.186][DEBUG]: DevTools WebSocket Response: Target.getTargets (id=1) (session_id=) browser {';

      expect(wsCommandPattern.regex.test(other)).toBe(false);
    });
  });

  describe('DevTools WebSocket Response', () => {
    const line =
      '2026-01-15T19:54:19+03:00 [1768496059.186][DEBUG]: DevTools WebSocket Response: Target.getTargets (id=1) (session_id=) browser {';

    it('should match a DevTools WebSocket Response line', () => {
      expect(wsResponsePattern.regex.test(line)).toBe(true);
    });

    it('should extract timestamp, unix, level, command, id, devtoolsSession groups', () => {
      const groups = wsResponsePattern.regex.exec(line)?.groups;

      expect(groups).toMatchObject({
        timestamp: '2026-01-15T19:54:19+03:00',
        unix: '1768496059.186',
        level: 'DEBUG',
        command: 'Target.getTargets',
        id: '1',
        devtoolsSession: '',
      });
    });

    it('should not match a DevTools WebSocket Event line', () => {
      const other =
        '2026-01-15T19:54:19+03:00 [1768496059.190][DEBUG]: DevTools WebSocket Event: Target.attachedToTarget (session_id=) browser {';

      expect(wsResponsePattern.regex.test(other)).toBe(false);
    });
  });

  describe('DevTools WebSocket Event', () => {
    const line =
      '2026-01-15T19:54:19+03:00 [1768496059.190][DEBUG]: DevTools WebSocket Event: Target.attachedToTarget (session_id=) browser {';

    it('should match a DevTools WebSocket Event line', () => {
      expect(wsEventPattern.regex.test(line)).toBe(true);
    });

    it('should extract timestamp, unix, level, event, devtoolsSession groups', () => {
      const groups = wsEventPattern.regex.exec(line)?.groups;

      expect(groups).toMatchObject({
        timestamp: '2026-01-15T19:54:19+03:00',
        unix: '1768496059.190',
        level: 'DEBUG',
        event: 'Target.attachedToTarget',
        devtoolsSession: '',
      });
    });

    it('should not match a DevTools WebSocket Command line', () => {
      const other =
        '2026-01-15T19:54:19+03:00 [1768496059.163][DEBUG]: DevTools WebSocket Command: Target.getTargets (id=1) (session_id=) browser {';

      expect(wsEventPattern.regex.test(other)).toBe(false);
    });
  });

  describe('DevTools HTTP Request', () => {
    const line =
      '2026-01-15T19:54:18+03:00 [1768496058.506][DEBUG]: DevTools HTTP Request: http://localhost:39995/json/version';

    it('should match a DevTools HTTP Request line', () => {
      expect(httpRequestPattern.regex.test(line)).toBe(true);
    });

    it('should extract timestamp, unix, level, url groups', () => {
      const groups = httpRequestPattern.regex.exec(line)?.groups;

      expect(groups).toMatchObject({
        timestamp: '2026-01-15T19:54:18+03:00',
        unix: '1768496058.506',
        level: 'DEBUG',
        url: 'http://localhost:39995/json/version',
      });
    });

    it('should not match a DevTools HTTP Response line', () => {
      const other =
        '2026-01-15T19:54:19+03:00 [1768496059.022][DEBUG]: DevTools HTTP Response: {';

      expect(httpRequestPattern.regex.test(other)).toBe(false);
    });
  });

  describe('DevTools HTTP Response', () => {
    const line = '2026-01-15T19:54:19+03:00 [1768496059.022][DEBUG]: DevTools HTTP Response: {';

    it('should match a DevTools HTTP Response line', () => {
      expect(httpResponsePattern.regex.test(line)).toBe(true);
    });

    it('should extract timestamp, unix, level groups', () => {
      const groups = httpResponsePattern.regex.exec(line)?.groups;

      expect(groups).toMatchObject({
        timestamp: '2026-01-15T19:54:19+03:00',
        unix: '1768496059.022',
        level: 'DEBUG',
      });
    });

    it('should not match a DevTools HTTP Request line', () => {
      const other =
        '2026-01-15T19:54:18+03:00 [1768496058.506][DEBUG]: DevTools HTTP Request: http://localhost:39995/json/version';

      expect(httpResponsePattern.regex.test(other)).toBe(false);
    });
  });

  describe('System message', () => {
    const line = '2026-01-15T19:54:13+03:00 [1768496053.001][INFO]: Starting ChromeDriver...';

    it('should match a system log line', () => {
      expect(systemPattern.regex.test(line)).toBe(true);
    });

    it('should extract timestamp, unix, level, message groups', () => {
      const groups = systemPattern.regex.exec(line)?.groups;

      expect(groups).toMatchObject({
        timestamp: '2026-01-15T19:54:13+03:00',
        unix: '1768496053.001',
        level: 'INFO',
        message: 'Starting ChromeDriver...',
      });
    });

    it('should not match a line with an unknown log level', () => {
      const other = '2026-01-15T19:54:13+03:00 [1768496053.001][CUSTOM]: Starting ChromeDriver...';

      expect(systemPattern.regex.test(other)).toBe(false);
    });
  });
});
