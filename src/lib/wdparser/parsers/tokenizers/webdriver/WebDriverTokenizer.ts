import { TokenizerCore } from '../core/TokenizerCore.js';
import { webDriverStrategy } from './webDriverStrategy.js';
import type { Token, TokenFields } from '../core/ITokenizer.js';

interface CommandResponseFields extends TokenFields {
  unix: string;
  level: string;
  timestamp: string;
  session?: string;
  command?: string;
  id?: string;
  devtoolsSession?: string;
  url?: string;
  broken?: boolean;
}

interface EventFields extends TokenFields {
  unix: string;
  level: string;
  timestamp: string;
  event: string;
  devtoolsSession?: string;
}

interface SystemFields extends TokenFields {
  unix: string;
  level: string;
  timestamp: string;
  message?: string;
}

export type WebDriverToken =
  | Token<'command', CommandResponseFields>
  | Token<'response', CommandResponseFields>
  | Token<'event', EventFields>
  | Token<'system', SystemFields>;

export class WebDriverTokenizer extends TokenizerCore<WebDriverToken> {
  constructor() {
    super(webDriverStrategy);
  }
}
