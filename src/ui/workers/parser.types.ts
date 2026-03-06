import type { Entity } from '@/lib/wdparser/parsers/IParser';

export enum WorkerInMessageType {
  Start = 'start',
  Abort = 'abort',
}

export enum WorkerOutMessageType {
  Progress = 'progress',
  Batch = 'batch',
  Done = 'done',
  Error = 'error',
}

export type WorkerInMessage =
  | { type: WorkerInMessageType.Start; logUrl: string }
  | { type: WorkerInMessageType.Abort };

export type WorkerProgressMessage = {
  type: WorkerOutMessageType.Progress;
  bytesLoaded: number;
  totalBytes: number;
};

export type WorkerBatchMessage = {
  type: WorkerOutMessageType.Batch;
  entities: Entity[];
};

export type WorkerDoneMessage = {
  type: WorkerOutMessageType.Done;
  bytesLoaded: number;
  totalBytes: number;
};

export type WorkerErrorMessage = {
  type: WorkerOutMessageType.Error;
  message: string;
};

export type WorkerOutMessage =
  | WorkerProgressMessage
  | WorkerBatchMessage
  | WorkerDoneMessage
  | WorkerErrorMessage;
