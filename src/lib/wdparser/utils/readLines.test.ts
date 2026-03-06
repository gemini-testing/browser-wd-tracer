import { describe, it, expect } from 'vitest';

import { readLines } from './readLines';

function makeStream(...chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}

describe('readLines', () => {
  it('should return a single line from a single-line stream', async () => {
    const lines: string[] = [];

    for await (const line of readLines(makeStream('hello'))) {
      lines.push(line);
    }

    expect(lines).toEqual(['hello']);
  });

  it('should split the stream into lines by \\n', async () => {
    const lines: string[] = [];

    for await (const line of readLines(makeStream('line1\nline2\nline3'))) {
      lines.push(line);
    }

    expect(lines).toEqual(['line1', 'line2', 'line3']);
  });

  it('should return remainder without \\n as the last line', async () => {
    const lines: string[] = [];

    for await (const line of readLines(makeStream('line1\nline2'))) {
      lines.push(line);
    }

    expect(lines).toEqual(['line1', 'line2']);
  });

  it('should return empty result for an empty stream', async () => {
    const lines: string[] = [];

    for await (const line of readLines(makeStream(''))) {
      lines.push(line);
    }

    expect(lines).toEqual([]);
  });

  it('should correctly join data from multiple chunks', async () => {
    const lines: string[] = [];

    for await (const line of readLines(makeStream('li', 'ne1\n', 'line2'))) {
      lines.push(line);
    }

    expect(lines).toEqual(['line1', 'line2']);
  });
});
