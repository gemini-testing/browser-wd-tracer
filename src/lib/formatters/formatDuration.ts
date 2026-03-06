import ms from 'ms';

export function formatDuration(milliseconds: number): string {
  return ms(milliseconds, { long: false });
}
