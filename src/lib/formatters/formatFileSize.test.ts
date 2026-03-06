import { describe, it, expect } from 'vitest';

import { formatFileSize } from './formatFileSize';

describe('formatFileSize', () => {
  it('should return "0 B" for 0', () => {
    expect(formatFileSize(0)).toBe('0 B');
  });

  it('should return "1 KB" for 1024 bytes', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
  });

  it('should return "1 MB" for 1048576 bytes', () => {
    expect(formatFileSize(1048576)).toBe('1 MB');
  });
});
