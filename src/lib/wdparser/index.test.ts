import { describe, it, expect, vi, afterEach } from 'vitest';
import { parseStream, parseURL, LogFormat } from './';

const WD_LOG =
  '2026-01-15T19:54:15+03:00 [1768496055.945][INFO]: [abc123] COMMAND InitSession {\n}\n' +
  '2026-01-15T19:54:19+03:00 [1768496059.262][INFO]: [abc123] RESPONSE InitSession {\n}';

function makeStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('parseStream()', () => {
  it('should return an empty array for an empty stream', async () => {
    const result = await parseStream(makeStream(''), { format: LogFormat.WebDriver });

    expect(result).toEqual([]);
  });

  it('should parse command and response from a WD log', async () => {
    const result = await parseStream(makeStream(WD_LOG), { format: LogFormat.WebDriver });

    expect(result).toHaveLength(2);

    expect(result[0]).toMatchObject({
      type: 'command',
      metadata: { command: 'InitSession', session: 'abc123' },
    });

    expect(result[1]).toMatchObject({
      type: 'response',
      metadata: { command: 'InitSession', session: 'abc123' },
    });
  });

  it('should call onProgress for each entity', async () => {
    const progress: number[] = [];

    await parseStream(makeStream(WD_LOG), {
      format: LogFormat.WebDriver,
      onProgress: ({ entitiesCount }) => progress.push(entitiesCount),
    });

    expect(progress).toEqual([1, 2]);
  });
});

describe('parseURL()', () => {
  it('should throw if response.ok === false', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404, statusText: 'Not Found' }));

    await expect(parseURL('http://example.com/log', { format: LogFormat.WebDriver })).rejects.toThrow('404');
  });

  it('should throw if response.body === null', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, body: null }));

    await expect(parseURL('http://example.com/log', { format: LogFormat.WebDriver })).rejects.toThrow(
      'Response body is null',
    );
  });

  it('should return entities on successful fetch', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        body: makeStream(WD_LOG),
      }),
    );

    const result = await parseURL('http://example.com/log', { format: LogFormat.WebDriver });

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ type: 'command', metadata: { command: 'InitSession' } });
    expect(result[1]).toMatchObject({ type: 'response', metadata: { command: 'InitSession' } });
  });
});
