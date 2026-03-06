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
