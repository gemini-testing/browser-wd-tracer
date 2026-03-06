import { proxy } from 'valtio';

import { CommandSortMode } from './types';
import type { CommandsFilters } from './types';

const defaultFilters = (): CommandsFilters => ({
  statuses: [],
  search: '',
  sortMode: CommandSortMode.Natural,
});

export const commandsFilters = proxy<CommandsFilters>(defaultFilters());

export function setCommandsFilters(filters: Partial<CommandsFilters>) {
  Object.assign(commandsFilters, filters);
}

export function resetCommandsFilters() {
  Object.assign(commandsFilters, defaultFilters());
}
