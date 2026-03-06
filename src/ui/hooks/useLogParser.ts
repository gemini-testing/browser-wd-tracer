import { useEffect, startTransition } from 'react';
import {
  addEntitiesBatch,
  updateProgress,
  setLoadingState,
  setError,
  setLogMetadata,
  resetLog,
} from '../stores/log';
import {
  WorkerInMessageType,
  WorkerOutMessageType,
  type WorkerOutMessage,
} from '../workers/parser.types';

export function useLogParser() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const logUrl = params.get('logUrl');

    if (!logUrl) {
      setError('No logUrl provided in query params');

      return;
    }

    resetLog();
    setLoadingState(true);
    setLogMetadata({ fileUrl: logUrl });

    const worker = new Worker(
      new URL('../workers/parser.worker.ts', import.meta.url),
      { type: 'module' },
    );

    worker.onmessage = (event: MessageEvent<WorkerOutMessage>) => {
      const msg = event.data;

      if (msg.type === WorkerOutMessageType.Batch) {
        startTransition(() => addEntitiesBatch(msg.entities));

        return;
      }

      if (msg.type === WorkerOutMessageType.Progress) {
        updateProgress({ bytesLoaded: msg.bytesLoaded, totalBytes: msg.totalBytes });
        setLogMetadata({ fileSize: msg.totalBytes || msg.bytesLoaded });

        return;
      }

      if (msg.type === WorkerOutMessageType.Done) {
        setLogMetadata({ fileSize: msg.totalBytes || msg.bytesLoaded });
        setLoadingState(false);

        return;
      }

      if (msg.type === WorkerOutMessageType.Error) {
        setError(msg.message);
        setLoadingState(false);
      }
    };

    worker.onerror = (event) => {
      setError(event.message ?? 'Worker error');
      setLoadingState(false);
    };

    worker.postMessage({ type: WorkerInMessageType.Start, logUrl });

    return () => {
      worker.postMessage({ type: WorkerInMessageType.Abort });
      worker.terminate();
    };
  }, []);
}
