import { WebDriverParser } from './parsers/webdriver/WebDriverParser.js';
import type { IParser, Entity } from './parsers/IParser.js';

export enum LogFormat {
  WebDriver = 'webdriver',
}

export interface ParseOptions {
  format: LogFormat;
  maxLineLength?: number;
  onProgress?: (progress: { entitiesCount: number }) => void;
}

export async function parseStream(
  stream: ReadableStream<Uint8Array>,
  options: ParseOptions,
): Promise<Entity[]> {
  const { format, maxLineLength, onProgress } = options;

  const parser = createParser(format, { maxLineLength });
  const entities: Entity[] = [];

  parser.on('entity', (entity: Entity) => {
    entities.push(entity);
    onProgress?.({ entitiesCount: entities.length });
  });

  await parser.read(stream);

  return entities;
}

export async function parseURL(
  url: string,
  options: ParseOptions,
): Promise<Entity[]> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

  return parseStream(response.body, options);
}

function createParser(
  format: LogFormat,
  options: { maxLineLength?: number } = {},
): IParser<Entity> {
  const dispatch: Record<LogFormat, () => IParser<Entity>> = {
    [LogFormat.WebDriver]: () => new WebDriverParser(options),
  };

  return dispatch[format]();
}

export { LogSource } from './types/LogSource.js';
export { LogLevel } from './types/LogLevel.js';
export type { Entity } from './parsers/IParser.js';
export type { WebDriverEntity } from './parsers/webdriver/WebDriverParser.js';
