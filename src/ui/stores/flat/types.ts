export enum SortMode {
  Natural = 'natural',
  Execution = 'execution',
}

export interface FlatFilters {
  levels: string[];
  types: string[];
  search: string;
  sortMode: SortMode;
}
