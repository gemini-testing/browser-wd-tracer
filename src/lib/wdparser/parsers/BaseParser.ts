import { EventEmitter } from 'eventemitter3';
import type { IParser, Entity } from './IParser.js';
import type { ITokenizer, Token } from './tokenizers/core/ITokenizer.js';
import { LogLevel } from '../types/LogLevel.js';
import { readLines } from '../utils/readLines.js';

export interface ParserOptions {
  maxLineLength?: number;
}

export abstract class BaseParser<
  TEntity extends Entity = Entity,
  TToken extends Token = Token,
> extends EventEmitter implements IParser<TEntity>
{
  protected tokenizer: ITokenizer<TToken>;
  protected maxLineLength: number;

  constructor(tokenizer: ITokenizer<TToken>, options: ParserOptions = {}) {
    super();

    this.tokenizer = tokenizer;
    this.maxLineLength = options.maxLineLength ?? 3000;
  }

  protected abstract createUnknownEntity(line: string): TEntity;

  async read(stream: ReadableStream<Uint8Array>): Promise<void> {
    try {
      for await (const line of readLines(stream)) {
        this.processLine(line);
      }

      this.flush();
      this.emit('end');
    } catch (error) {
      this.emit('error', error as Error);
    }
  }

  processLine(line: string): void {
    try {
      const originalLength = line.length;
      const truncated = originalLength > this.maxLineLength;
      const processedLine = truncated ? line.slice(0, this.maxLineLength) : line;
      const token = this.tokenizer.tokenize(processedLine);

      if (!token) {
        if (this.tokenizer.isCollecting()) {
          return;
        }

        const unknownEntity = this.createUnknownEntity(processedLine);

        this.emitEntity(unknownEntity, truncated, originalLength);

        return;
      }

      const entity = this.tokenToEntity(token);

      if (!entity) {
        return;
      }

      this.emitEntity(entity, truncated, originalLength);
    } catch (error) {
      this.emit('error', error as Error);
    }
  }

  protected abstract tokenToEntity(token: TToken): TEntity | null;

  protected detectErrorLevel(payload: unknown, defaultLevel: LogLevel): LogLevel {
    if (!payload) {
      return defaultLevel;
    }

    try {
      const str = JSON.stringify(payload).toLowerCase();

      if (str.includes('error') || str.includes('exception')) {
        return LogLevel.ERROR;
      }

      if (str.includes('warn')) {
        return LogLevel.WARNING;
      }
    } catch {
      return defaultLevel;
    }

    return defaultLevel;
  }

  flush(): void {
    try {
      const finalToken = this.tokenizer.flush();
      if (!finalToken) {
        return;
      }

      const entity = this.tokenToEntity(finalToken);

      if (entity) {
        this.emit('entity', entity);
      }
    } catch (error) {
      this.emit('error', error as Error);
    }
  }

  private emitEntity(entity: TEntity, truncated: boolean, originalLength: number): void {
    if (truncated) {
      entity.metadata = { ...entity.metadata, truncated: true, originalLength };
    }

    this.emit('entity', entity);
  }
}
