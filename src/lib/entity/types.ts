export enum PairedEntityType {
  Pair = 'pair',
  OrphanedCommand = 'orphanedCommand',
  OrphanedResponse = 'orphanedResponse',
}

export interface PairedEntity<TType extends PairedEntityType = PairedEntityType> {
  type: TType;
  command: string;
  request?: {
    timestamp: number;
    payload?: unknown;
    metadata?: Record<string, unknown>;
  };
  response?: {
    timestamp: number;
    payload?: unknown;
    metadata?: Record<string, unknown>;
    duration?: number;
    error?: string;
    errorMessage?: string;
  };
  metadata?: {
    session?: string;
    level?: string;
    [key: string]: unknown;
  };
}

export type PairEntity = PairedEntity<PairedEntityType.Pair>;
export type OrphanedCommandEntity = PairedEntity<PairedEntityType.OrphanedCommand>;
export type OrphanedResponseEntity = PairedEntity<PairedEntityType.OrphanedResponse>;

export type AnyPairedEntity = PairEntity | OrphanedCommandEntity | OrphanedResponseEntity;
