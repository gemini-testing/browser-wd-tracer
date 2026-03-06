import { createStyles } from 'antd-style';

import type { EntityWithId } from '@/ui/observables/commonEntities';
import { FlatTable } from './FlatTable';
import { useFlatEntities } from './useFlatEntities';

const useStyles = createStyles(() => ({
  wrapper: {
    flex: 1,
    minHeight: 0,
  },
}));

export function FlatView() {
  const { styles } = useStyles();
  const { filteredEntities } = useFlatEntities();

  return (
    <div className={styles.wrapper}>
      <FlatTable entities={filteredEntities as EntityWithId[]} />
    </div>
  );
}
