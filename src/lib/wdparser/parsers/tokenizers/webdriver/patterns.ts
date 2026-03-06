import type { PatternDef } from '../core/TokenizerStrategy.js';

export const webdriverPatterns: PatternDef[] = [
  {
    regex:
      /^(?<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}) \[(?<unix>\d+(?:\.\d+)?)\]\[(?<level>\w+)\]: \[(?<session>[^\]]+)\] COMMAND (?<command>[\w.]+)/,
    type: 'command',
    multiline: true,
  },
  {
    regex:
      /^(?<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}) \[(?<unix>\d+(?:\.\d+)?)\]\[(?<level>\w+)\]: \[(?<session>[^\]]+)\] RESPONSE (?<command>[\w.]+)/,
    type: 'response',
    multiline: true,
  },
  {
    regex:
      /^(?<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}) \[(?<unix>\d+(?:\.\d+)?)\]\[(?<level>\w+)\]: DevTools WebSocket Command: (?<command>[\w.]+) \(id=(?<id>\d+)\) \(session_id=(?<devtoolsSession>[^)]*)\)/,
    type: 'command',
    multiline: true,
  },
  {
    regex:
      /^(?<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}) \[(?<unix>\d+(?:\.\d+)?)\]\[(?<level>\w+)\]: DevTools WebSocket Response: (?<command>[\w.]+) \(id=(?<id>\d+)\) \(session_id=(?<devtoolsSession>[^)]*)\)/,
    type: 'response',
    multiline: true,
  },
  {
    regex:
      /^(?<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}) \[(?<unix>\d+(?:\.\d+)?)\]\[(?<level>\w+)\]: DevTools WebSocket Event: (?<event>[\w.]+) \(session_id=(?<devtoolsSession>[^)]*)\)/,
    type: 'event',
    multiline: true,
  },
  {
    regex:
      /^(?<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}) \[(?<unix>\d+(?:\.\d+)?)\]\[(?<level>\w+)\]: DevTools HTTP Request: (?<url>.+)/,
    type: 'command',
    multiline: false,
  },
  {
    regex:
      /^(?<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}) \[(?<unix>\d+(?:\.\d+)?)\]\[(?<level>\w+)\]: DevTools HTTP Response:/,
    type: 'response',
    multiline: true,
  },
  {
    regex:
      /^(?<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}) \[(?<unix>\d+(?:\.\d+)?)\]\[(?<level>DEBUG|INFO|WARNING|SEVERE)\]: (?<message>.+)/,
    type: 'system',
    multiline: true,
  },
];
