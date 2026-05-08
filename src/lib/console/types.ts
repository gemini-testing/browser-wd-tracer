export interface CallFrame {
  functionName: string;
  url: string;
  lineNumber: number;
  columnNumber: number;
}

export interface StackTrace {
  callFrames: CallFrame[];
}

export interface PropertyPreview {
  name: string;
  type: string;
  value?: string;
}

export interface ObjectPreview {
  type: string;
  description?: string;
  properties?: PropertyPreview[];
}

export interface RemoteObject {
  type: string;
  value?: unknown;
  description?: string;
  preview?: ObjectPreview;
}

export interface ConsolePayload {
  type: string;
  args: RemoteObject[];
  timestamp: number;
  stackTrace?: StackTrace;
}

export interface MessageSegment {
  text: string;
  style?: React.CSSProperties;
}

export interface ExceptionObject {
  className?: string;
  description?: string;
  type: string;
  subtype?: string;
}

export interface ExceptionDetails {
  columnNumber: number;
  exception?: ExceptionObject;
  exceptionId: number;
  executionContextId?: number;
  lineNumber: number;
  scriptId?: string;
  stackTrace?: StackTrace;
  text: string;
  url?: string;
}

export interface ExceptionPayload {
  exceptionDetails: ExceptionDetails;
  timestamp: number;
}
