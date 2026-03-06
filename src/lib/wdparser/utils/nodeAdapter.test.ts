import { describe, it, expect, vi } from 'vitest';
import { Readable } from 'stream';

import { nodeToWebStream } from './nodeAdapter';

describe('nodeToWebStream', () => {
  it('should pass data from a Readable as text', async () => {
    const readable = Readable.from(['hello', ' ', 'world']);
    const webStream = nodeToWebStream(readable);
    const result = await new Response(webStream).text();

    expect(result).toBe('hello world');
  });

  it('should close the stream when Readable ends', async () => {
    const readable = Readable.from(['data']);
    const webStream = nodeToWebStream(readable);
    const reader = webStream.getReader();

    await reader.read();
    const { done } = await reader.read();

    expect(done).toBe(true);
  });

  it('should correctly convert Buffer to Uint8Array', async () => {
    const buf = Buffer.from([1, 2, 3]);
    const readable = Readable.from([buf]);
    const webStream = nodeToWebStream(readable);
    const reader = webStream.getReader();
    const { value } = await reader.read();

    expect(value).toBeInstanceOf(Uint8Array);
    expect(Array.from(value!)).toEqual([1, 2, 3]);
  });

  it('should call iterator.return when the stream is cancelled', async () => {
    const readable = Readable.from(['a', 'b', 'c']);
    const iter = readable[Symbol.asyncIterator]();
    const returnSpy = vi.spyOn(iter, 'return');

    const webStream = new ReadableStream<Uint8Array>({
      async pull(controller) {
        const { done, value } = await iter.next();

        if (done) {
          controller.close();
          return;
        }

        const chunk = value instanceof Buffer ? value : Buffer.from(value);
        controller.enqueue(new Uint8Array(chunk));
      },
      async cancel() {
        if (iter.return) {
          await iter.return();
        }
      },
    });

    const reader = webStream.getReader();
    await reader.read();
    await reader.cancel();

    expect(returnSpy).toHaveBeenCalled();
  });
});
