import { createStyles } from 'antd-style';

import type { EntityWithId } from '@/ui/observables/commonEntities';
import { ConsoleTable } from './ConsoleTable';
import { useConsoleEntities } from './useConsoleEntities';

const useStyles = createStyles(() => ({
  wrapper: {
    flex: 1,
    minHeight: 0,
  },
}));

export function ConsoleView() {
  const { styles } = useStyles();
  const { filteredEntities } = useConsoleEntities();

  return (
    <div className={styles.wrapper}>
      <ConsoleTable entities={filteredEntities as EntityWithId[]} />
    </div>
  );
}
