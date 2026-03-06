import { proxy } from 'valtio';
import type { Entity } from '@/lib/wdparser/parsers/IParser';
import { unixSecondsToDate } from '@/lib/formatters';
import { commonEntities } from '@/ui/observables/commonEntities';
import { pairedEntities } from '@/ui/observables/pairedEntities';
import type { LogMetadata, Progress, LogUiState } from './types';

const defaultMetadata = (): LogMetadata => ({
  fileUrl: '',
  fileSize: 0,
  linesCount: 0,
  firstLogDate: null,
  firstTimestamp: 0,
  lastTimestamp: 0,
});

const defaultProgress = (): Progress => ({
  bytesLoaded: 0,
  totalBytes: 0,
  linesParsed: 0,
});

export const log = proxy<LogUiState>({
  metadata: defaultMetadata(),
  isLoading: false,
  error: null,
  progress: defaultProgress(),
});

export function addEntitiesBatch(entities: Entity[]): void {
  commonEntities.addBatch(entities);
  pairedEntities.addBatch(entities);

  const [firstEntity] = entities;
  const lastEntity = entities.at(-1);

  if (!log.metadata.firstLogDate && firstEntity) {
    log.metadata.firstLogDate = unixSecondsToDate(firstEntity.timestamp);
    log.metadata.firstTimestamp = firstEntity.timestamp;
  }

  if (lastEntity) {
    log.metadata.lastTimestamp = lastEntity.timestamp;
  }

  log.metadata.linesCount += entities.length;
}

export function updateProgress(progress: Partial<Progress>): void {
  Object.assign(log.progress, progress);
}

export function setLogMetadata(meta: Partial<LogMetadata>): void {
  Object.assign(log.metadata, meta);
}

export function setLoadingState(isLoading: boolean): void {
  log.isLoading = isLoading;
}

export function setError(error: string | null): void {
  log.error = error;
}

export function resetLog(): void {
  commonEntities.reset();
  pairedEntities.reset();
  log.isLoading = false;
  log.error = null;
  log.progress = defaultProgress();
  log.metadata = defaultMetadata();
}
