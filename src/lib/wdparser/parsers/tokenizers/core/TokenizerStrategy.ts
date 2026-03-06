export interface PatternDef {
  regex: RegExp;
  type: string;
  multiline?: boolean;
}

export interface TokenizerStrategy {
  patterns: PatternDef[];

  preprocessLine(line: string): string;
  isNewRecord(line: string): boolean;
  isComplete(buffer: string[], braceCount: number, bracketCount: number): boolean;
  extractJsonStart(fields: Record<string, unknown>, remainder: string): string | null;
  parsePayload(text: string): unknown;
  parseInlinePayload(fields: Record<string, unknown>, remainder: string): unknown | undefined;
}
