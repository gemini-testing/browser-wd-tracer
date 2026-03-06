import { describe, it, expect } from 'vitest';

import { toggleArrayItem } from './toggleArrayItem';

describe('toggleArrayItem', () => {
  it('should add an item if it is not in the array', () => {
    expect(toggleArrayItem([1, 2], 3)).toEqual([1, 2, 3]);
  });

  it('should remove an item if it is in the array', () => {
    expect(toggleArrayItem([1, 2, 3], 2)).toEqual([1, 3]);
  });

  it('should add an item to an empty array', () => {
    expect(toggleArrayItem([], 'a')).toEqual(['a']);
  });

  it('should return an empty array when removing the only element', () => {
    expect(toggleArrayItem(['x'], 'x')).toEqual([]);
  });
});
