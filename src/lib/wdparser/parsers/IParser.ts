import { EventEmitter } from 'eventemitter3';

export interface EntityMetadata {
  timestamp?: string;
  level?: string;
  message?: string;
  duration?: number;
  event?: string;
  [key: string]: unknown;
}

export interface Entity<TType extends string = string> {
  type: TType;
  timestamp: number;
  payload?: unknown;
  metadata?: EntityMetadata;
  raw?: string;
}

export interface IParser<TEntity extends Entity = Entity> extends EventEmitter {
  read(stream: ReadableStream<Uint8Array>): Promise<void>;
  processLine(line: string): void;

  on(event: 'entity', listener: (entity: TEntity) => void): this;
  on(event: 'error', listener: (error: Error) => void): this;
  on(event: 'end', listener: () => void): this;

  flush(): void;
}
