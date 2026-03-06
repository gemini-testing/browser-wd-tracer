import { describe, it, expect, vi } from 'vitest';
import { TokenizerCore } from './TokenizerCore.js';
import type { TokenizerStrategy } from './TokenizerStrategy.js';
import type { Token } from './ITokenizer.js';

function makeStrategy(overrides: Partial<TokenizerStrategy> = {}): TokenizerStrategy {
  return {
    patterns: [
      { regex: /^CMD (?<name>\w+)/, type: 'cmd', multiline: true },
      { regex: /^INLINE (?<name>\w+)/, type: 'inline', multiline: false },
    ],
    preprocessLine: vi.fn((line: string) => line),
    isNewRecord: vi.fn(() => false),
    isComplete: vi.fn(() => false),
    extractJsonStart: vi.fn((_fields, remainder) => remainder.trim() || null),
    parsePayload: vi.fn(() => ({ parsed: true })),
    parseInlinePayload: vi.fn(() => undefined),
    ...overrides,
  };
}

describe('TokenizerCore', () => {
  describe('tokenize() — Idle state', () => {
    it('should call parseInlinePayload for a non-multiline pattern', () => {
      const strategy = makeStrategy();
      const tokenizer = new TokenizerCore<Token>(strategy);

      tokenizer.tokenize('INLINE myAction');

      expect(strategy.parseInlinePayload).toHaveBeenCalled();
    });

    it('should not call preprocessLine on match in Idle state', () => {
      const strategy = makeStrategy();
      const tokenizer = new TokenizerCore<Token>(strategy);

      tokenizer.tokenize('CMD myAction {');

      expect(strategy.preprocessLine).not.toHaveBeenCalled();
    });

    it('should call extractJsonStart for a multiline pattern', () => {
      const strategy = makeStrategy();
      const tokenizer = new TokenizerCore<Token>(strategy);

      tokenizer.tokenize('CMD myAction {');

      expect(strategy.extractJsonStart).toHaveBeenCalled();
    });

    it('should call isComplete after starting a multiline record', () => {
      const strategy = makeStrategy();
      const tokenizer = new TokenizerCore<Token>(strategy);

      tokenizer.tokenize('CMD myAction {');

      expect(strategy.isComplete).toHaveBeenCalled();
    });
  });

  describe('tokenize() — Collecting state', () => {
    it('should call preprocessLine for each continuation line', () => {
      const strategy = makeStrategy();
      const tokenizer = new TokenizerCore<Token>(strategy);

      tokenizer.tokenize('CMD myAction {');
      tokenizer.tokenize('  "key": "value"');
      tokenizer.tokenize('  "key2": "value2"');

      expect(strategy.preprocessLine).toHaveBeenCalledTimes(2);
    });

    it('should call isNewRecord for each line in Collecting (not for the first in Idle)', () => {
      const strategy = makeStrategy();
      const tokenizer = new TokenizerCore<Token>(strategy);

      tokenizer.tokenize('CMD myAction {');
      tokenizer.tokenize('  "key": "value"');
      tokenizer.tokenize('}');

      // handleIdle does not call isNewRecord — only handleCollecting does
      expect(strategy.isNewRecord).toHaveBeenCalledTimes(2);
    });

    it('should call parsePayload when finalizing a multiline record', () => {
      const strategy = makeStrategy({
        isComplete: vi.fn(() => true),
      });
      const tokenizer = new TokenizerCore<Token>(strategy);

      tokenizer.tokenize('CMD myAction {');
      tokenizer.tokenize('}');

      expect(strategy.parsePayload).toHaveBeenCalled();
    });

    it('should call isNewRecord and finalize when a new record starts', () => {
      const strategy = makeStrategy({
        isNewRecord: vi.fn((line: string) => line.startsWith('CMD') || line.startsWith('INLINE')),
      });
      const tokenizer = new TokenizerCore<Token>(strategy);

      tokenizer.tokenize('CMD first {');

      const token = tokenizer.tokenize('CMD second {');

      expect(strategy.parsePayload).toHaveBeenCalled();
      expect(token?.fields).toMatchObject({ name: 'first' });
    });
  });

  describe('flush()', () => {
    it('should not call parsePayload in Idle state', () => {
      const strategy = makeStrategy();
      const tokenizer = new TokenizerCore<Token>(strategy);

      tokenizer.flush();

      expect(strategy.parsePayload).not.toHaveBeenCalled();
    });

    it('should call parsePayload when flushing in Collecting state', () => {
      const strategy = makeStrategy();
      const tokenizer = new TokenizerCore<Token>(strategy);

      tokenizer.tokenize('CMD myAction {');
      tokenizer.flush();

      expect(strategy.parsePayload).toHaveBeenCalled();
    });
  });
});
