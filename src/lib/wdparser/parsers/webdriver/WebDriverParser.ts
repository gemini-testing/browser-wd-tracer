import { BaseParser, type ParserOptions } from '../BaseParser.js';
import { WebDriverTokenizer, type WebDriverToken } from '../tokenizers/webdriver/WebDriverTokenizer.js';
import { parseTimestamp } from '../tokenizers/utils/json-parser.js';
import type { Entity, EntityMetadata } from '../IParser.js';
import { LogLevel } from '../../types/LogLevel.js';
import { parseLogLevel } from '../../utils/parseLogLevel.js';
import { WebDriverEntityType } from '../../types/EntityType.js';

export type WebDriverEntity =
  | Entity<WebDriverEntityType.Command>
  | Entity<WebDriverEntityType.Response>
  | Entity<WebDriverEntityType.Event>
  | Entity<WebDriverEntityType.System>
  | Entity<WebDriverEntityType.Unknown>;

type FieldsRecord = Record<string, unknown>;

export class WebDriverParser extends BaseParser<WebDriverEntity, WebDriverToken> {
  private static readonly TIMESTAMP_PATTERNS = [
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2} \[\d+(?:\.\d+)?\]\[\w+\]: /, // 2026-01-15T19:54:15+03:00 [1768496055.945][INFO]:
    /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2} \[\w+\]\s*/, // 2026-01-15T19:54:15+03:00
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}\s*/, // 2026/01/15 19:54:14 [TAG]
  ];

  private static readonly ISO_TIMESTAMP_REGEX =
    /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2})/;   // 2026-01-15T19:54:15+03:00

  private static readonly EXTRA_METADATA_BUILDERS: Partial<
    Record<WebDriverEntityType, (fields: FieldsRecord) => EntityMetadata>
  > = {
    [WebDriverEntityType.Command]: WebDriverParser.buildCommandResponseMetadata,
    [WebDriverEntityType.Response]: WebDriverParser.buildCommandResponseMetadata,
    [WebDriverEntityType.Event]: WebDriverParser.buildEventMetadata,
    [WebDriverEntityType.System]: WebDriverParser.buildSystemMetadata,
  };

  constructor(options: ParserOptions = {}) {
    super(new WebDriverTokenizer(), options);
  }

  protected createUnknownEntity(line: string): WebDriverEntity {
    const message = WebDriverParser.stripLineTimestamps(line);
    const timestamp = WebDriverParser.extractLineTimestamp(line);

    return {
      type: WebDriverEntityType.Unknown,
      timestamp,
      raw: line,
      metadata: {
        reason: 'no pattern matched',
        level: LogLevel.UNKNOWN,
        rawLine: line,
        message: message || '[empty line]',
      },
    };
  }

  protected tokenToEntity(token: WebDriverToken): WebDriverEntity | null {
    const timestamp = parseTimestamp(token.fields.unix);
    const tokenLevel = parseLogLevel(token.fields.level);

    const detectedLevel =
      token.type === WebDriverEntityType.System
        ? tokenLevel
        : this.detectErrorLevel(token.payload, tokenLevel);

    const baseMetadata: EntityMetadata = {
      level: detectedLevel,
      timestamp: token.fields.timestamp,
    };

    const extraMetadata = WebDriverParser.EXTRA_METADATA_BUILDERS[token.type as WebDriverEntityType];

    return {
      type: token.type as WebDriverEntity['type'],
      timestamp,
      payload: token.payload,
      metadata: {
        ...baseMetadata,
        ...(extraMetadata ? extraMetadata(token.fields as FieldsRecord) : {}),
      },
    };
  }

  private static stripLineTimestamps(line: string): string {
    let message = line;
    let prev: string;

    do {
      prev = message;

      for (const pattern of WebDriverParser.TIMESTAMP_PATTERNS) {
        message = message.replace(pattern, '').trim();
      }
    } while (message !== prev);

    return message;
  }

  private static extractLineTimestamp(line: string): number {
    const [, isoTimestamp] = line.match(WebDriverParser.ISO_TIMESTAMP_REGEX) ?? [];

    return isoTimestamp ? new Date(isoTimestamp).getTime() / 1000 : Date.now() / 1000;
  }

  private static stripJsonOpenSuffix(text: string): string {
    return text.replace(/:\s*[{[]$/, '').trim();
  }

  private static extractCommandFromUrl(url: string): string {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  }

  private static buildCommandResponseMetadata(fields: FieldsRecord): EntityMetadata {
    const commandFromUrl =
      fields.url ? WebDriverParser.extractCommandFromUrl(fields.url as string) : undefined;

    return {
      session: fields.session as string,
      command: (fields.command as string | undefined) ?? commandFromUrl,
      ...(fields.broken !== undefined ? { broken: fields.broken } : {}),
      ...(fields.id !== undefined ? { devtoolsId: fields.id } : {}),
      ...(fields.devtoolsSession ? { devtoolsSession: fields.devtoolsSession } : {}),
      ...(fields.url !== undefined ? { url: fields.url } : {}),
    };
  }

  private static buildEventMetadata(fields: FieldsRecord): EntityMetadata {
    return {
      event: fields.event as string,
      ...(fields.devtoolsSession ? { devtoolsSession: fields.devtoolsSession } : {}),
    };
  }

  private static buildSystemMetadata(fields: FieldsRecord): EntityMetadata {
    return {
      message: fields.message
        ? WebDriverParser.stripJsonOpenSuffix(fields.message as string)
        : undefined,
    };
  }
}
