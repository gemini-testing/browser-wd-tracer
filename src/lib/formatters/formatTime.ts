import { isString } from '@/lib/guards';

/**
 * Formats time without timezone conversion.
 * For an ISO string "2026-01-15T19:54:15+03:00" returns "19:54:15" — the time as written in the log.
 * For a number (unix seconds) converts via Date (fallback for compatibility).
 */
export function formatTime(timestamp: number | string): string {
  if (isString(timestamp)) {
    const match = timestamp.match(/T(\d{2}:\d{2}:\d{2})/);
    return match ? match[1]! : timestamp;
  }

  const date = new Date(timestamp * 1000);

  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
