import type { ITokenizer, Token } from './ITokenizer.js';
import type { TokenizerStrategy } from './TokenizerStrategy.js';

export enum TokenizerState {
  Idle = 'idle',
  Collecting = 'collecting',
}

export class TokenizerCore<TToken extends Token> implements ITokenizer<TToken> {
  private state: TokenizerState = TokenizerState.Idle;
  private buffer: string[] = [];
  private currentToken: { type: string; fields: Record<string, unknown> } | null = null;
  private braceCount = 0;
  private bracketCount = 0;

  constructor(private readonly strategy: TokenizerStrategy) {}

  tokenize(line: string): TToken | null {
    if (this.state === TokenizerState.Collecting) {
      return this.handleCollecting(line);
    }

    return this.handleIdle(line);
  }

  flush(): TToken | null {
    if (this.state === TokenizerState.Collecting) {
      return this.finalize();
    }

    return null;
  }

  reset(): void {
    this.state = TokenizerState.Idle;
    this.buffer = [];
    this.currentToken = null;
    this.braceCount = 0;
    this.bracketCount = 0;
  }

  isCollecting(): boolean {
    return this.state === TokenizerState.Collecting;
  }

  private handleIdle(line: string): TToken | null {
    for (const pattern of this.strategy.patterns) {
      const match = pattern.regex.exec(line);

      if (!match) {
        continue;
      }

      const fields = match.groups ?? {};
      const matchEnd = match.index + match[0].length;
      const remainder = line.substring(matchEnd).trim();

      if (!pattern.multiline) {
        const payload = this.strategy.parseInlinePayload(fields, remainder);

        return this.buildToken(pattern.type, fields, payload);
      }

      const jsonStart = this.strategy.extractJsonStart(fields, remainder);

      if (jsonStart === null) {
        const payload = this.strategy.parseInlinePayload(fields, remainder);

        return this.buildToken(pattern.type, fields, payload);
      }

      this.state = TokenizerState.Collecting;
      this.buffer = [jsonStart];
      this.currentToken = { type: pattern.type, fields };
      this.updateBraceCount(jsonStart);

      if (this.strategy.isComplete(this.buffer, this.braceCount, this.bracketCount)) {
        return this.finalize();
      }

      return null;
    }

    return null;
  }

  private handleCollecting(line: string): TToken | null {
    if (this.strategy.isNewRecord(line)) {
      const token = this.finalize();

      this.tokenize(line);

      return token;
    }

    const processed = this.strategy.preprocessLine(line);

    this.buffer.push(processed);
    this.updateBraceCount(processed);

    if (this.strategy.isComplete(this.buffer, this.braceCount, this.bracketCount)) {
      return this.finalize();
    }

    return null;
  }

  private finalize(): TToken | null {
    if (!this.currentToken) return null;

    const payload = this.strategy.parsePayload(this.buffer.join('\n'));
    const token = this.buildToken(this.currentToken.type, this.currentToken.fields, payload);

    this.reset();

    return token;
  }

  private buildToken(type: string, fields: Record<string, unknown>, payload: unknown): TToken {
    const token: Token = { type, fields };

    if (payload !== undefined) {
      token.payload = payload as Record<string, unknown>;
    }

    return token as TToken;
  }

  private updateBraceCount(line: string): void {
    for (const char of line) {
      if (char === '{') this.braceCount++;
      if (char === '}') this.braceCount--;
      if (char === '[') this.bracketCount++;
      if (char === ']') this.bracketCount--;
    }
  }
}
