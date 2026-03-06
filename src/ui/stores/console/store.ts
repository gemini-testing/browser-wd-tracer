import { proxy } from 'valtio';

import type { ConsoleFilters } from './types';

const defaultFilters = (): ConsoleFilters => ({
  levels: [],
  search: '',
});

export const consoleFilters = proxy<ConsoleFilters>(defaultFilters());

export function setConsoleFilters(filters: Partial<ConsoleFilters>): void {
  Object.assign(consoleFilters, filters);
}

export function resetConsoleFilters(): void {
  Object.assign(consoleFilters, defaultFilters());
}
