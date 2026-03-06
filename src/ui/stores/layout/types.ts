export enum ViewMode {
  Flat = 'flat',
  Commands = 'commands',
  Console = 'console',
}

export enum Theme {
  Light = 'light',
  Dark = 'dark',
}

export interface Layout {
  viewMode: ViewMode;
  sidebarOpen: boolean;
  theme: Theme;
  selectedRowIndex: number | null;
  expandedRows: Set<number>;
  timelineZoom: { start: number; end: number };
}
