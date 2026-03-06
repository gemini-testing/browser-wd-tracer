import { useSnapshot } from 'valtio';
import { createStyles } from 'antd-style';

import { layout, ViewMode } from '@/ui/stores/layout';
import { Summary } from './Summary';
import { FilterBar } from '../viewes/flat/FilterBar';
import { ConsoleFilterBar } from '../viewes/console/ConsoleFilterBar';
import { CommandsFilterBar } from '../viewes/commands/CommandsFilterBar';

const useStyles = createStyles(({ token }) => ({
  container: {},
  divider: {
    borderTop: `1px solid ${token.colorBorderSecondary}`,
  },
}));

const filterBarMap: Record<ViewMode, React.FC> = {
  [ViewMode.Flat]: FilterBar,
  [ViewMode.Commands]: CommandsFilterBar,
  [ViewMode.Console]: ConsoleFilterBar,
};

export function AppHeader() {
  const { styles } = useStyles();
  const { viewMode } = useSnapshot(layout);

  const ActiveFilterBar = filterBarMap[viewMode];

  return (
    <div className={styles.container}>
      <Summary />
      <div className={styles.divider} />
      <ActiveFilterBar />
    </div>
  );
}
