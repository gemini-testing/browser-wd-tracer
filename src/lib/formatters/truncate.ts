const MAX_TRUNCATE_LENGTH = 200;

export function truncate(text: string, maxLength = MAX_TRUNCATE_LENGTH): string {
  return text.length > maxLength
    ? `${text.slice(0, maxLength)}...`
    : text;
}
