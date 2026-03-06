import type { AnyPairedEntity } from '@/lib/entity/types';

export enum CommandStatus {
  Succeed = 'succeed',
  Failed = 'failed',
  Orphaned = 'orphaned',
}

export enum CommandSortMode {
  Natural = 'natural',
  Heaviest = 'heaviest',
  Lightest = 'lightest',
}

export interface CommandsFilters {
  statuses: CommandStatus[];
  search: string;
  sortMode: CommandSortMode;
}

export interface CommandsDerived {
  pairs: AnyPairedEntity[];
  availableStatuses: CommandStatus[];
}
