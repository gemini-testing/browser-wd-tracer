import type { StackTrace } from './types';

export function formatStackTrace(stackTrace: StackTrace): string {
  return stackTrace.callFrames
    .map(({ functionName, url, lineNumber, columnNumber }) => {
      const name = functionName || '(anonymous)';
      const location = url
        ? `${url}:${lineNumber + 1}:${columnNumber + 1}`
        : '<anonymous>';

      return `    at ${name} (${location})`;
    })
    .join('\n');
}
