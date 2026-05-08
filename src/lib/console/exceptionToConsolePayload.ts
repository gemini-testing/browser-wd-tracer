import type { ExceptionPayload, ConsolePayload } from './types';

export function exceptionToConsolePayload(payload: ExceptionPayload): ConsolePayload {
  const { exceptionDetails, timestamp } = payload;
  const description = exceptionDetails.exception?.description ?? exceptionDetails.text;

  return {
    type: 'error',
    args: [{ type: 'string', value: description }],
    timestamp,
    stackTrace: exceptionDetails.stackTrace,
  };
}
