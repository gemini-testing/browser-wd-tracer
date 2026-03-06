import { proxy } from 'valtio';

import { SortMode } from './types';
import type { FlatFilters } from './types';

const defaultFilters = (): FlatFilters => ({
  levels: [],
  types: [],
  search: '',
  sortMode: SortMode.Natural,
});

export const flatFilters = proxy<FlatFilters>(defaultFilters());

export function setFlatFilters(filters: Partial<FlatFilters>): void {
  Object.assign(flatFilters, filters);
}

export function resetFlatFilters(): void {
  Object.assign(flatFilters, defaultFilters());
}
