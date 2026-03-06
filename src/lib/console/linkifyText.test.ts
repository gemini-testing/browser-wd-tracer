import { describe, it, expect } from 'vitest';

import { linkifyText } from './linkifyText';

describe('linkifyText', () => {
  it('should return empty array for an empty string', () => {
    expect(linkifyText('')).toEqual([]);
  });

  it('should return a single URL segment for a string that is only a URL', () => {
    expect(linkifyText('https://example.com')).toEqual([
      { text: 'https://example.com', href: 'https://example.com' },
    ]);
  });

  it('should split a string into text and URL segments', () => {
    expect(linkifyText('visit https://example.com now')).toEqual([
      { text: 'visit ' },
      { text: 'https://example.com', href: 'https://example.com' },
      { text: ' now' },
    ]);
  });

  it('should handle multiple URLs in a string', () => {
    expect(linkifyText('https://a.com and https://b.com')).toEqual([
      { text: 'https://a.com', href: 'https://a.com' },
      { text: ' and ' },
      { text: 'https://b.com', href: 'https://b.com' },
    ]);
  });
});
