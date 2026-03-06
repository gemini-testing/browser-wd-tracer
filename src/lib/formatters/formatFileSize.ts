import bytes from 'bytes';

export function formatFileSize(byteCount: number): string {
  return bytes(byteCount, { unitSeparator: ' ' }) || '0 B';
}
