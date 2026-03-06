import { useState, useEffect, useMemo, useSyncExternalStore } from 'react';
import { useSnapshot } from 'valtio';
import { Input, Select, Flex } from 'antd';
import { createStyles } from 'antd-style';

import {
  commandsFilters,
  CommandSortMode,
  setCommandsFilters,
} from '@/ui/stores/commands';
import { pairedEntities } from '@/ui/observables/pairedEntities';
import { getPairStatus } from '@/ui/stores/commands/utils';

const { Search } = Input;

const SORT_OPTIONS = [
  { label: 'Natural', value: CommandSortMode.Natural },
  { label: 'Heaviest first', value: CommandSortMode.Heaviest },
  { label: 'Lightest first', value: CommandSortMode.Lightest },
];

const useStyles = createStyles(() => ({
  container: {
    padding: '10px 10px',
    lineHeight: 0,
  },
  label: {
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
}));

export function CommandsFilterBar() {
  const { styles } = useStyles();
  const snap = useSnapshot(commandsFilters);
  useSyncExternalStore(pairedEntities.subscribe, pairedEntities.getVersion);

  const [searchInput, setSearchInput] = useState(snap.search);

  const availableStatuses = useMemo(
    () => [...new Set(pairedEntities.getItems().map(getPairStatus))],
    [pairedEntities.getVersion()],
  );

  useEffect(() => {
    const timer = setTimeout(() => setCommandsFilters({ search: searchInput }), 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <div className={styles.container}>
      <Flex gap="middle" wrap="wrap" align="center">
        <span className={styles.label}>Status:</span>
        <Select
          mode="multiple"
          placeholder="All statuses"
          style={{ minWidth: 160 }}
          maxTagCount={0}
          value={[...snap.statuses]}
          onChange={(values) => setCommandsFilters({ statuses: values })}
          options={availableStatuses.map((s) => ({ label: s, value: s }))}
        />

        <span className={styles.label}>Sort:</span>
        <Select
          style={{ minWidth: 140 }}
          value={snap.sortMode}
          onChange={(value) => setCommandsFilters({ sortMode: value })}
          options={SORT_OPTIONS}
        />

        <span className={styles.label}>Search:</span>
        <Search
          placeholder="Search commands..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onSearch={(value) => {
            setSearchInput(value);
            setCommandsFilters({ search: value });
          }}
          style={{ flex: 1, minWidth: 200 }}
          allowClear
        />
      </Flex>
    </div>
  );
}
