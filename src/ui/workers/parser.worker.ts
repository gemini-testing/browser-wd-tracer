import { WebDriverParser } from '@/lib/wdparser/parsers/webdriver/WebDriverParser';
import type { Entity } from '@/lib/wdparser/parsers/IParser';
import {
  WorkerInMessageType,
  WorkerOutMessageType,
  type WorkerInMessage,
  type WorkerOutMessage,
} from './parser.types';

const BATCH_SIZE = 500;
const PROGRESS_INTERVAL_MS = 200;

let controller: AbortController | null = null;

self.onmessage = (event: MessageEvent<WorkerInMessage>) => {
  const msg = event.data;

  const dispatch: Record<WorkerInMessageType, () => void> = {
    [WorkerInMessageType.Start]: () => {
      if (msg.type === WorkerInMessageType.Start) {
        run(msg.logUrl);
      }
    },
    [WorkerInMessageType.Abort]: () => controller?.abort(),
  };

  dispatch[msg.type]?.();
};

function post(message: WorkerOutMessage): void {
  self.postMessage(message);
}

async function run(logUrl: string): Promise<void> {
  controller = new AbortController();

  const { signal } = controller;

  let entityBuffer: Entity[] = [];
  let bytesLoaded = 0;
  let totalBytes = 0;
  let lastProgressUpdate = 0;

  const flushBatch = () => {
    if (entityBuffer.length === 0) {
      return;
    }

    post({ type: WorkerOutMessageType.Batch, entities: entityBuffer });
    entityBuffer = [];
  };

  try {
    const headResponse = await fetch(logUrl, { method: 'HEAD', signal });
    const contentLength = headResponse.headers.get('content-length') ?? '0';

    totalBytes = parseInt(contentLength, 10);

    post({ type: WorkerOutMessageType.Progress, bytesLoaded: 0, totalBytes });

    const parser = new WebDriverParser();

    parser.on('entity', (entity: Entity) => {
      entityBuffer.push(entity);

      if (entityBuffer.length >= BATCH_SIZE) {
        flushBatch();
      }
    });

    const response = await fetch(logUrl, { signal });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const progressStream = new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, ctrl) {
        bytesLoaded += chunk.byteLength;

        const now = Date.now();

        if (now - lastProgressUpdate > PROGRESS_INTERVAL_MS) {
          post({ type: WorkerOutMessageType.Progress, bytesLoaded, totalBytes });

          lastProgressUpdate = now;
        }

        ctrl.enqueue(chunk);
      },
    });

    await parser.read(response.body.pipeThrough(progressStream));

    flushBatch();
    post({ type: WorkerOutMessageType.Done, bytesLoaded, totalBytes });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return;
    }

    flushBatch();
    post({
      type: WorkerOutMessageType.Error,
      message: err instanceof Error ? err.message : String(err),
    });
  }
}
