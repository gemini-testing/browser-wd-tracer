import { useSnapshot } from 'valtio';
import type { ThemeKeys } from '@microlink/react-json-view';

import { layout, Theme } from '@/ui/stores/layout';

export function useJsonViewerTheme(): ThemeKeys {
  const { theme } = useSnapshot(layout);

  return theme === Theme.Dark ? 'monokai' : 'rjv-default';
}
