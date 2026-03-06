import { useSnapshot } from 'valtio';
import { createStyles } from 'antd-style';

import { layout, ViewMode } from '@/ui/stores/layout';
import { FlatView } from '../viewes/flat';
import { ConsoleView } from '../viewes/console';
import { CommandsView } from '../viewes/commands';

const useStyles = createStyles(() => ({
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
}));

const viewMap: Record<ViewMode, React.FC> = {
  [ViewMode.Flat]: FlatView,
  [ViewMode.Commands]: CommandsView,
  [ViewMode.Console]: ConsoleView,
};

export function MainContent() {
  const { styles } = useStyles();
  const { viewMode } = useSnapshot(layout);

  const View = viewMap[viewMode];

  return (
    <div className={styles.container}>
      <View />
    </div>
  );
}
