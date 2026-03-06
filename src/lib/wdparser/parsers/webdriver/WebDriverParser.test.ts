import { describe, it, expect } from 'vitest';
import { Readable } from 'stream';
import { nodeToWebStream } from '../../utils/nodeAdapter.js';
import { WebDriverParser, type WebDriverEntity } from './WebDriverParser.js';

describe('WebDriverParser', () => {
  it('should parse WebDriver COMMAND', async () => {
    const parser = new WebDriverParser();
    const entities: WebDriverEntity[] = [];

    parser.on('entity', (entity) => {
      entities.push(entity);
    });

    const logLines = [
      '2026-01-15T19:54:15+03:00 [1768496055.945][INFO]: [abc123] COMMAND InitSession {',
      '}',
    ];

    const stream = Readable.from(logLines);

    await parser.read(nodeToWebStream(stream));

    expect(entities).toHaveLength(1);
    expect(entities[0]!.type).toBe('command');
    expect(entities[0]!.metadata?.command).toBe('InitSession');
    expect(entities[0]!.metadata?.session).toBe('abc123');
  });

  it('should parse WebDriver RESPONSE', async () => {
    const parser = new WebDriverParser();
    const entities: WebDriverEntity[] = [];

    parser.on('entity', (entity) => {
      entities.push(entity);
    });

    const logLines = [
      '2026-01-15T19:54:19+03:00 [1768496059.262][INFO]: [abc123] RESPONSE InitSession {',
      '}',
    ];

    const stream = Readable.from(logLines);

    await parser.read(nodeToWebStream(stream));

    expect(entities).toHaveLength(1);
    expect(entities[0]!.type).toBe('response');
    expect(entities[0]!.metadata?.command).toBe('InitSession');
  });

  it('should parse system message', async () => {
    const parser = new WebDriverParser();
    const entities: WebDriverEntity[] = [];

    parser.on('entity', (entity) => {
      entities.push(entity);
    });

    const logLine =
      '2026-01-15T19:54:13+03:00 [1768496053.001][INFO]: Starting ChromeDriver...';

    const stream = Readable.from([logLine]);

    await parser.read(nodeToWebStream(stream));

    expect(entities).toHaveLength(1);
    expect(entities[0]!.type).toBe('system');
    expect(entities[0]!.metadata?.message).toBe('Starting ChromeDriver...');
  });

  it('should create unknown entity for non-matching lines', async () => {
    const parser = new WebDriverParser();
    const entities: WebDriverEntity[] = [];

    parser.on('entity', (entity) => {
      entities.push(entity);
    });

    const logLine = 'Some random log line that does not match';

    const stream = Readable.from([logLine]);

    await parser.read(nodeToWebStream(stream));

    expect(entities).toHaveLength(1);
    expect(entities[0]!.type).toBe('unknown');
    expect(entities[0]!.raw).toBe(logLine);
    expect(entities[0]!.metadata?.reason).toBe('no pattern matched');
    expect(entities[0]!.metadata?.level).toBe('UNKNOWN');
  });

  it('should parse DevTools HTTP Request and set command from URL pathname', async () => {
    const parser = new WebDriverParser();
    const entities: WebDriverEntity[] = [];

    parser.on('entity', (entity) => {
      entities.push(entity);
    });

    const logLine =
      '2026-01-15T19:54:18+03:00 [1768496058.506][DEBUG]: DevTools HTTP Request: http://localhost:39995/json/version';

    const stream = Readable.from([logLine]);

    await parser.read(nodeToWebStream(stream));

    expect(entities).toHaveLength(1);
    expect(entities[0]!.type).toBe('command');
    expect(entities[0]!.metadata?.url).toBe('http://localhost:39995/json/version');
    expect(entities[0]!.metadata?.command).toBe('/json/version');
    expect(entities[0]!.metadata?.level).toBe('DEBUG');
  });

  it('should parse DevTools HTTP Response with multiline JSON', async () => {
    const parser = new WebDriverParser();
    const entities: WebDriverEntity[] = [];

    parser.on('entity', (entity) => {
      entities.push(entity);
    });

    const logText = [
      '2026-01-15T19:54:19+03:00 [1768496059.022][DEBUG]: DevTools HTTP Response: {',
      '2026-01-15T19:54:19+03:00    "Browser": "Chrome/114.0.5735.133",',
      '2026-01-15T19:54:19+03:00    "Protocol-Version": "1.3",',
      '2026-01-15T19:54:19+03:00    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",',
      '2026-01-15T19:54:19+03:00    "V8-Version": "11.4.183.23",',
      '2026-01-15T19:54:19+03:00    "WebKit-Version": "537.36 (@fbfa2ce68d01b2201d8c667c2e73f648a61c4f4a)",',
      '2026-01-15T19:54:19+03:00    "webSocketDebuggerUrl": "ws://localhost:39995/devtools/browser/f7f81a07-f500-4ada-8b67-61b9d7b951cf"',
      '2026-01-15T19:54:19+03:00 }',
    ].join('\n');

    const stream = Readable.from([logText]);

    await parser.read(nodeToWebStream(stream));

    expect(entities.filter(e => e.type === 'response')).toHaveLength(1);
    const responseEntity = entities.find(e => e.type === 'response')!;
    expect(responseEntity.payload).toHaveProperty('Browser', 'Chrome/114.0.5735.133');
    expect(responseEntity.payload).toHaveProperty('Protocol-Version', '1.3');
    expect(responseEntity.metadata?.level).toBe('DEBUG');
  });

  it('should parse DevTools WebSocket Command', async () => {
    const parser = new WebDriverParser();
    const entities: WebDriverEntity[] = [];

    parser.on('entity', (entity) => {
      entities.push(entity);
    });

    const logLines = [
      '2026-01-15T19:54:19+03:00 [1768496059.163][DEBUG]: DevTools WebSocket Command: Target.getTargets (id=1) (session_id=) browser {',
      '}',
    ];

    const stream = Readable.from(logLines);

    await parser.read(nodeToWebStream(stream));

    expect(entities).toHaveLength(1);
    expect(entities[0]!.type).toBe('command');
    expect(entities[0]!.metadata?.command).toBe('Target.getTargets');
    expect(entities[0]!.metadata?.devtoolsId).toBe('1');
    expect(entities[0]!.metadata?.devtoolsSession).toBeUndefined();
    expect(entities[0]!.metadata?.level).toBe('DEBUG');
    expect(entities[0]!.payload).toEqual({});
  });

  it('should parse DevTools WebSocket Response', async () => {
    const parser = new WebDriverParser();
    const entities: WebDriverEntity[] = [];

    parser.on('entity', (entity) => {
      entities.push(entity);
    });

    const logLines = [
      '2026-01-15T19:54:19+03:00 [1768496059.186][DEBUG]: DevTools WebSocket Response: Target.getTargets (id=1) (session_id=) browser {',
      '2026-01-15T19:54:19+03:00 "targetInfos": [ {',
      '2026-01-15T19:54:19+03:00 "attached": false,',
      '2026-01-15T19:54:19+03:00 "browserContextId": "C85EDF1503B812C0D23B249C52C18725",',
      '2026-01-15T19:54:19+03:00 "canAccessOpener": false,',
      '2026-01-15T19:54:19+03:00 "targetId": "AEF94E0497BEF365BE91F8C671471C8B",',
      '2026-01-15T19:54:19+03:00 "title": "",',
      '2026-01-15T19:54:19+03:00 "type": "page",',
      '2026-01-15T19:54:19+03:00 "url": "data:,"',
      '2026-01-15T19:54:19+03:00 } ]',
      '2026-01-15T19:54:19+03:00 }',
    ];

    const stream = Readable.from(logLines);

    await parser.read(nodeToWebStream(stream));

    expect(entities).toHaveLength(1);
    expect(entities[0]!.type).toBe('response');
    expect(entities[0]!.metadata?.command).toBe('Target.getTargets');
    expect(entities[0]!.metadata?.devtoolsId).toBe('1');
    expect(entities[0]!.metadata?.devtoolsSession).toBeUndefined();
    expect(entities[0]!.metadata?.level).toBe('DEBUG');
    expect(entities[0]!.payload).toHaveProperty('_raw');
  });

  it('should parse DevTools WebSocket Event', async () => {
    const parser = new WebDriverParser();
    const entities: WebDriverEntity[] = [];

    parser.on('entity', (entity) => {
      entities.push(entity);
    });

    const logLines = [
      '2026-01-15T19:54:19+03:00 [1768496059.190][DEBUG]: DevTools WebSocket Event: Target.attachedToTarget (session_id=) browser {',
      '2026-01-15T19:54:19+03:00 "sessionId": "A095A19EED6E6D9333D735E7C212E3B7",',
      '2026-01-15T19:54:19+03:00 "targetInfo": {',
      '2026-01-15T19:54:19+03:00 "attached": true,',
      '2026-01-15T19:54:19+03:00 "browserContextId": "C85EDF1503B812C0D23B249C52C18725",',
      '2026-01-15T19:54:19+03:00 "canAccessOpener": false,',
      '2026-01-15T19:54:19+03:00 "targetId": "AEF94E0497BEF365BE91F8C671471C8B",',
      '2026-01-15T19:54:19+03:00 "title": "",',
      '2026-01-15T19:54:19+03:00 "type": "page",',
      '2026-01-15T19:54:19+03:00 "url": "data:,"',
      '2026-01-15T19:54:19+03:00 }',
      '2026-01-15T19:54:19+03:00 }',
    ];

    const stream = Readable.from(logLines);

    await parser.read(nodeToWebStream(stream));

    expect(entities).toHaveLength(1);
    expect(entities[0]!.type).toBe('event');
    expect(entities[0]!.metadata?.event).toBe('Target.attachedToTarget');
    expect(entities[0]!.metadata?.devtoolsSession).toBeUndefined();
    expect(entities[0]!.metadata?.level).toBe('DEBUG');
    expect(entities[0]!.payload).toHaveProperty('_raw');
  });

  it('should parse DevTools WebSocket with non-empty session_id', async () => {
    const parser = new WebDriverParser();
    const entities: WebDriverEntity[] = [];

    parser.on('entity', (entity) => {
      entities.push(entity);
    });

    const logLines = [
      '2026-01-15T19:54:19+03:00 [1768496059.190][DEBUG]: DevTools WebSocket Command: Page.enable (id=7) (session_id=A095A19EED6E6D9333D735E7C212E3B7) AEF94E0497BEF365BE91F8C671471C8B {',
      '}',
    ];

    const stream = Readable.from(logLines);

    await parser.read(nodeToWebStream(stream));

    expect(entities).toHaveLength(1);
    expect(entities[0]!.type).toBe('command');
    expect(entities[0]!.metadata?.command).toBe('Page.enable');
    expect(entities[0]!.metadata?.devtoolsId).toBe('7');
    expect(entities[0]!.metadata?.devtoolsSession).toBe('A095A19EED6E6D9333D735E7C212E3B7');
    expect(entities[0]!.payload).toEqual({});
  });

  it('should parse multiline DevTools Event with nested objects', async () => {
    const logLines = [
      '2026-01-15T19:54:27+03:00 [1768496067.642][DEBUG]: DevTools WebSocket Event: Page.frameAttached (session_id=612F83D82906371330EB8554EFE82149) 032F7D471B5595088EA5DA8E97D8B3EB {',
      '2026-01-15T19:54:27+03:00    "frameId": "F4C2FC510603107A6D69177BA3D52BB3",',
      '2026-01-15T19:54:27+03:00    "parentFrameId": "032F7D471B5595088EA5DA8E97D8B3EB",',
      '2026-01-15T19:54:27+03:00    "stack": {',
      '2026-01-15T19:54:27+03:00       "callFrames": [ {',
      '2026-01-15T19:54:27+03:00          "columnNumber": 2796,',
      '2026-01-15T19:54:27+03:00          "functionName": "Ls",',
      '2026-01-15T19:54:27+03:00          "lineNumber": 63',
      '2026-01-15T19:54:27+03:00       } ]',
      '2026-01-15T19:54:27+03:00    }',
      '2026-01-15T19:54:27+03:00 }',
    ];

    const parser = new WebDriverParser();
    const entities: WebDriverEntity[] = [];
    parser.on('entity', (entity: WebDriverEntity) => entities.push(entity));

    await parser.read(nodeToWebStream(Readable.from(logLines.join('\n'))));
    parser.flush();

    expect(entities).toHaveLength(1);
    expect(entities[0]!.type).toBe('event');

    const payload = entities[0]!.payload as Record<string, unknown>;
    expect(payload.frameId).toBe('F4C2FC510603107A6D69177BA3D52BB3');
    expect(payload.stack).toBeDefined();

    const stack = payload.stack as Record<string, unknown>;
    const callFrames = stack.callFrames as Array<Record<string, unknown>>;
    expect(callFrames[0]!.lineNumber).toBe(63);
  });

  it('should parse system message with multiline JSON', async () => {
    const logLines = [
      '2026-01-15T19:54:15+03:00 [1768496055.946][INFO]: Populating Preferences file: {',
      '2026-01-15T19:54:15+03:00    "alternate_error_pages": {',
      '2026-01-15T19:54:15+03:00       "enabled": false',
      '2026-01-15T19:54:15+03:00    },',
      '2026-01-15T19:54:15+03:00    "autofill": {',
      '2026-01-15T19:54:15+03:00       "enabled": false',
      '2026-01-15T19:54:15+03:00    }',
      '2026-01-15T19:54:15+03:00 }',
    ];

    const parser = new WebDriverParser();
    const entities: WebDriverEntity[] = [];
    parser.on('entity', (entity: WebDriverEntity) => entities.push(entity));

    await parser.read(nodeToWebStream(Readable.from(logLines.join('\n'))));
    parser.flush();

    expect(entities).toHaveLength(1);
    expect(entities[0]!.type).toBe('system');

    expect(entities[0]!.metadata?.level).toBe('INFO');
    expect(entities[0]!.metadata?.message).toContain('Populating Preferences');

    const payload = entities[0]!.payload as Record<string, unknown>;
    expect(payload.alternate_error_pages).toBeDefined();
    expect(payload.autofill).toBeDefined();

    const autofill = payload.autofill as Record<string, unknown>;
    expect(autofill.enabled).toBe(false);
  });

  it('should parse system message without JSON with no _raw payload', async () => {
    const parser = new WebDriverParser();
    const entities: WebDriverEntity[] = [];

    parser.on('entity', (entity: WebDriverEntity) => entities.push(entity));

    const logLine =
      '2026-01-15T19:54:15+03:00 [1768496055.945][SEVERE]: GetCanonicalHostName Error hostname: 2676dbf076ac';

    await parser.read(nodeToWebStream(Readable.from([logLine])));
    parser.flush();

    expect(entities).toHaveLength(1);
    expect(entities[0]!.type).toBe('system');
    expect(entities[0]!.metadata?.level).toBe('SEVERE');
    expect(entities[0]!.metadata?.message).toBe('GetCanonicalHostName Error hostname: 2676dbf076ac');
    expect(entities[0]!.payload).not.toEqual({ _raw: '{' });
  });

  it('should parse multiline JSON with nested arrays correctly', async () => {
    const logLines = [
      '2026-01-15T19:54:15+03:00 [1768496055.946][INFO]: Session data: {',
      '2026-01-15T19:54:15+03:00    "capabilities": {',
      '2026-01-15T19:54:15+03:00       "firstMatch": [ {',
      '2026-01-15T19:54:15+03:00          "browserName": "chrome"',
      '2026-01-15T19:54:15+03:00       } ]',
      '2026-01-15T19:54:15+03:00    }',
      '2026-01-15T19:54:15+03:00 }',
    ];

    const parser = new WebDriverParser();
    const entities: WebDriverEntity[] = [];
    parser.on('entity', (entity: WebDriverEntity) => entities.push(entity));

    await parser.read(nodeToWebStream(Readable.from(logLines.join('\n'))));
    parser.flush();

    expect(entities).toHaveLength(1);
    expect(entities[0]!.type).toBe('system');

    const payload = entities[0]!.payload as Record<string, unknown>;
    expect(payload.capabilities).toBeDefined();

    const capabilities = payload.capabilities as Record<string, unknown>;
    expect(capabilities.firstMatch).toBeDefined();
    expect(Array.isArray(capabilities.firstMatch)).toBe(true);
  });

  it('should parse multiline JSON starting with array', async () => {
    const logLines = [
      '2026-01-15T19:54:15+03:00 [1768496055.946][INFO]: Targets: [',
      '2026-01-15T19:54:15+03:00    {',
      '2026-01-15T19:54:15+03:00       "id": "target1",',
      '2026-01-15T19:54:15+03:00       "type": "page"',
      '2026-01-15T19:54:15+03:00    },',
      '2026-01-15T19:54:15+03:00    {',
      '2026-01-15T19:54:15+03:00       "id": "target2",',
      '2026-01-15T19:54:15+03:00       "type": "background_page"',
      '2026-01-15T19:54:15+03:00    }',
      '2026-01-15T19:54:15+03:00 ]',
    ];

    const parser = new WebDriverParser();
    const entities: WebDriverEntity[] = [];
    parser.on('entity', (entity: WebDriverEntity) => entities.push(entity));

    await parser.read(nodeToWebStream(Readable.from(logLines.join('\n'))));
    parser.flush();

    expect(entities).toHaveLength(1);
    expect(entities[0]!.type).toBe('system');

    const payload = entities[0]!.payload;
    expect(Array.isArray(payload)).toBe(true);
    expect((payload as unknown[]).length).toBe(2);
  });

  describe('Unknown entities with timestamp cleanup', () => {
    it('should strip full WebDriver timestamp format from unknown lines', async () => {
      const parser = new WebDriverParser();
      const entities: WebDriverEntity[] = [];

      parser.on('entity', (entity) => {
        entities.push(entity);
      });

      const logLine = '2026-01-15T19:54:15+03:00 [1768496055][UNKNOWN]: Some unknown message';
      const stream = Readable.from([logLine]);

      await parser.read(nodeToWebStream(stream));

      expect(entities).toHaveLength(1);
      expect(entities[0]!.type).toBe('unknown');
      expect(entities[0]!.raw).toBe(logLine);
      expect(entities[0]!.metadata?.rawLine).toBe(logLine);
      expect(entities[0]!.metadata?.message).toBe('Some unknown message');
    });

    it('should strip simple ISO timestamp format from unknown lines', async () => {
      const parser = new WebDriverParser();
      const entities: WebDriverEntity[] = [];

      parser.on('entity', (entity) => {
        entities.push(entity);
      });

      const logLine = '2026-01-15T19:54:14+03:00 Waiting X server...';
      const stream = Readable.from([logLine]);

      await parser.read(nodeToWebStream(stream));

      expect(entities).toHaveLength(1);
      expect(entities[0]!.type).toBe('unknown');
      expect(entities[0]!.metadata?.message).toBe('Waiting X server...');
    });

    it('should strip YYYY/MM/DD HH:MM:SS [TAG] format from unknown lines', async () => {
      const parser = new WebDriverParser();
      const entities: WebDriverEntity[] = [];

      parser.on('entity', (entity) => {
        entities.push(entity);
      });

      const logLine = '2026/01/15 19:54:14 [INIT] [Listening on :7070]';
      const stream = Readable.from([logLine]);

      await parser.read(nodeToWebStream(stream));

      expect(entities).toHaveLength(1);
      expect(entities[0]!.type).toBe('unknown');
      expect(entities[0]!.metadata?.message).toBe('[Listening on :7070]');
    });

    it('should strip multiple timestamp prefixes from unknown lines', async () => {
      const parser = new WebDriverParser();
      const entities: WebDriverEntity[] = [];

      parser.on('entity', (entity) => {
        entities.push(entity);
      });

      const logLine = '2026-01-15T19:54:14+03:00 2026/01/15 19:54:14 [INIT] [Listening on :7070]';
      const stream = Readable.from([logLine]);

      await parser.read(nodeToWebStream(stream));

      expect(entities).toHaveLength(1);
      expect(entities[0]!.type).toBe('unknown');
      expect(entities[0]!.raw).toBe(logLine);
      expect(entities[0]!.metadata?.message).toBe('[Listening on :7070]');
    });

    it('should keep line as-is if no timestamp format matches', async () => {
      const parser = new WebDriverParser();
      const entities: WebDriverEntity[] = [];

      parser.on('entity', (entity) => {
        entities.push(entity);
      });

      const logLine = 'Random log without timestamp';
      const stream = Readable.from([logLine]);

      await parser.read(nodeToWebStream(stream));

      expect(entities).toHaveLength(1);
      expect(entities[0]!.type).toBe('unknown');
      expect(entities[0]!.metadata?.message).toBe(logLine);
    });

    it('should show [empty line] placeholder for lines containing only timestamp', async () => {
      const parser = new WebDriverParser();
      const entities: WebDriverEntity[] = [];

      parser.on('entity', (entity) => {
        entities.push(entity);
      });

      const logLine = '2026-01-15T19:54:18+03:00 ';
      const stream = Readable.from([logLine]);

      await parser.read(nodeToWebStream(stream));

      expect(entities).toHaveLength(1);
      expect(entities[0]!.type).toBe('unknown');
      expect(entities[0]!.metadata?.message).toBe('[empty line]');
    });

    it('should handle braces inside JSON strings correctly', async () => {
      const parser = new WebDriverParser();
      const entities: WebDriverEntity[] = [];

      parser.on('entity', (entity) => {
        entities.push(entity);
      });

      const logLines = [
        '2026-01-15T19:54:19+03:00 [1768496059.190][DEBUG]: DevTools WebSocket Command: Runtime.evaluate (id=4) (session_id=A095) ABC {',
        '2026-01-15T19:54:19+03:00    "expression": "(function () {window.cdc_Array = window.Array; return true;})()"',
        '2026-01-15T19:54:19+03:00 }',
        '2026-01-15T19:54:19+03:00 [1768496059.190][DEBUG]: DevTools WebSocket Command: Log.enable (id=5) (session_id=A095) ABC {',
        '2026-01-15T19:54:19+03:00 }',
      ].join('\n');

      const stream = Readable.from([logLines]);
      await parser.read(nodeToWebStream(stream));
      parser.flush();

      expect(entities).toHaveLength(2);
      expect(entities[0]!.type).toBe('command');
      expect(entities[0]!.metadata?.command).toBe('Runtime.evaluate');
      expect(entities[0]!.payload).toHaveProperty('expression');
      expect(entities[1]!.type).toBe('command');
      expect(entities[1]!.metadata?.command).toBe('Log.enable');
    });
  });

  describe('Consecutive same-type multiline blocks', () => {
    it('should parse two consecutive events of the same type as separate entities', async () => {
      const logLines = [
        '2026-01-15T19:54:32+03:00 [1768496072.467][DEBUG]: DevTools WebSocket Event: Runtime.consoleAPICalled (session_id=ABC123) 032F {',
        '2026-01-15T19:54:32+03:00    "type": "log",',
        '2026-01-15T19:54:32+03:00    "args": [ { "value": "first" } ]',
        '2026-01-15T19:54:32+03:00 }',
        '2026-01-15T19:54:32+03:00 [1768496072.468][DEBUG]: DevTools WebSocket Event: Runtime.consoleAPICalled (session_id=ABC123) 032F {',
        '2026-01-15T19:54:32+03:00    "type": "log",',
        '2026-01-15T19:54:32+03:00    "args": [ { "value": "second" } ]',
        '2026-01-15T19:54:32+03:00 }',
      ].join('\n');

      const parser = new WebDriverParser();
      const entities: WebDriverEntity[] = [];
      parser.on('entity', (entity: WebDriverEntity) => entities.push(entity));

      await parser.read(nodeToWebStream(Readable.from([logLines])));
      parser.flush();

      expect(entities).toHaveLength(2);
      expect(entities[0]!.type).toBe('event');
      expect(entities[0]!.metadata?.event).toBe('Runtime.consoleAPICalled');
      expect(entities[1]!.type).toBe('event');
      expect(entities[1]!.metadata?.event).toBe('Runtime.consoleAPICalled');
    });

    it('should parse command followed immediately by same-type command', async () => {
      const logLines = [
        '2026-01-15T19:54:32+03:00 [1768496072.464][INFO]: [abc] COMMAND ExecuteScript {',
        '2026-01-15T19:54:32+03:00    "script": "return 1;"',
        '2026-01-15T19:54:32+03:00 }',
        '2026-01-15T19:54:32+03:00 [1768496072.465][INFO]: [abc] COMMAND ExecuteScript {',
        '2026-01-15T19:54:32+03:00    "script": "return 2;"',
        '2026-01-15T19:54:32+03:00 }',
      ].join('\n');

      const parser = new WebDriverParser();
      const entities: WebDriverEntity[] = [];
      parser.on('entity', (entity: WebDriverEntity) => entities.push(entity));

      await parser.read(nodeToWebStream(Readable.from([logLines])));
      parser.flush();

      expect(entities).toHaveLength(2);
      expect(entities[0]!.type).toBe('command');
      expect(entities[0]!.metadata?.command).toBe('ExecuteScript');
      expect(entities[1]!.type).toBe('command');
      expect(entities[1]!.metadata?.command).toBe('ExecuteScript');
    });

    it('should parse command → event → event sequence correctly (real-world case)', async () => {
      const logLines = [
        '2026-01-15T19:54:32+03:00 [1768496072.464][INFO]: [d615d1ee] COMMAND ExecuteScript {',
        '2026-01-15T19:54:32+03:00    "script": "return document.title;"',
        '2026-01-15T19:54:32+03:00 }',
        '2026-01-15T19:54:32+03:00 [1768496072.467][DEBUG]: DevTools WebSocket Event: Runtime.consoleAPICalled (session_id=XYZ) 032F {',
        '2026-01-15T19:54:32+03:00    "type": "startGroupCollapsed"',
        '2026-01-15T19:54:32+03:00 }',
        '2026-01-15T19:54:32+03:00 [1768496072.467][DEBUG]: DevTools WebSocket Event: Runtime.consoleAPICalled (session_id=XYZ) 032F {',
        '2026-01-15T19:54:32+03:00    "type": "endGroup"',
        '2026-01-15T19:54:32+03:00 }',
      ].join('\n');

      const parser = new WebDriverParser();
      const entities: WebDriverEntity[] = [];
      parser.on('entity', (entity: WebDriverEntity) => entities.push(entity));

      await parser.read(nodeToWebStream(Readable.from([logLines])));
      parser.flush();

      expect(entities).toHaveLength(3);
      expect(entities[0]!.type).toBe('command');
      expect(entities[0]!.metadata?.command).toBe('ExecuteScript');
      expect(entities[1]!.type).toBe('event');
      expect(entities[1]!.metadata?.event).toBe('Runtime.consoleAPICalled');
      expect(entities[2]!.type).toBe('event');
      expect(entities[2]!.metadata?.event).toBe('Runtime.consoleAPICalled');
    });
  });
});
