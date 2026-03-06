import { proxy, subscribe } from 'valtio';
import type { Layout } from './types';
import { ViewMode, Theme } from './types';

const LS_THEME_KEY = 'wd2trace:theme';

function loadTheme(): Theme {
  try {
    const stored = localStorage.getItem(LS_THEME_KEY);

    return stored === Theme.Dark ? Theme.Dark : Theme.Light;
  } catch (err) {
    console.error('Failed to read theme from localStorage', err);

    return Theme.Light;
  }
}

export const layout = proxy<Layout>({
  viewMode: ViewMode.Flat,
  sidebarOpen: true,
  theme: loadTheme(),
  selectedRowIndex: null,
  expandedRows: new Set<number>(),
  timelineZoom: { start: 0, end: 1 },
});

export function setViewMode(mode: ViewMode): void {
  layout.viewMode = mode;
}

export function toggleSidebar(): void {
  layout.sidebarOpen = !layout.sidebarOpen;
}

export function setTheme(theme: Theme): void {
  layout.theme = theme;
}

export function scrollToRow(index: number): void {
  layout.selectedRowIndex = index;
}

export function toggleRowExpanded(index: number): void {
  if (layout.expandedRows.has(index)) {
    layout.expandedRows.delete(index);

    return;
  }

  layout.expandedRows.add(index);
}

subscribe(layout, () => {
  try {
    localStorage.setItem(LS_THEME_KEY, layout.theme);
  } catch (err) {
    console.error('Failed to persist theme to localStorage', err);
  }
});
