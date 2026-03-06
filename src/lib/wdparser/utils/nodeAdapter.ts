import { Readable } from 'stream';

export function nodeToWebStream(nodeStream: Readable): ReadableStream<Uint8Array> {
  const iterator = nodeStream[Symbol.asyncIterator]();

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await iterator.next();

      if (done) {
        controller.close();

        return;
      }

      const chunk = value instanceof Buffer ? value : Buffer.from(value);

      controller.enqueue(new Uint8Array(chunk));
    },

    async cancel() {
      if (iterator.return) {
        await iterator.return();
      }
    },
  });
}
