import { createStyles } from 'antd-style';

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
      <ConsoleTable entities={filteredEntities} />
    </div>
  );
}
