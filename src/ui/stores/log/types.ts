export interface LogMetadata {
  fileUrl: string;
  fileSize: number;
  linesCount: number;
  firstLogDate: Date | null;
  firstTimestamp: number;
  lastTimestamp: number;
}

export interface Progress {
  bytesLoaded: number;
  totalBytes: number;
  linesParsed: number;
}

export interface LogUiState {
  metadata: LogMetadata;
  isLoading: boolean;
  error: string | null;
  progress: Progress;
}
