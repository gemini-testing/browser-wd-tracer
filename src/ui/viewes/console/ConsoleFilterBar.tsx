import { useState, useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { Input, Select, Flex } from 'antd';
import { createStyles } from 'antd-style';

import { consoleFilters, setConsoleFilters } from '@/ui/stores/console';
import { useConsoleEntities } from './useConsoleEntities';

const { Search } = Input;

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

export function ConsoleFilterBar() {
  const { styles } = useStyles();
  const snap = useSnapshot(consoleFilters);
  const { availableLevels } = useConsoleEntities();

  const [searchInput, setSearchInput] = useState(snap.search);

  useEffect(() => {
    const timer = setTimeout(() => setConsoleFilters({ search: searchInput }), 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <div className={styles.container}>
      <Flex gap="middle" wrap="wrap" align="center">
        <span className={styles.label}>Level:</span>
        <Select
          mode="multiple"
          placeholder="Select levels"
          style={{ minWidth: 180 }}
          maxTagCount={0}
          value={[...snap.levels]}
          onChange={(values) => setConsoleFilters({ levels: values })}
          options={availableLevels.map((level) => ({ label: level, value: level }))}
        />

        <span className={styles.label}>Search:</span>
        <Search
          placeholder="Search messages..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onSearch={(value) => {
            setSearchInput(value);
            setConsoleFilters({ search: value });
          }}
          style={{ flex: 1, minWidth: 200 }}
          allowClear
        />
      </Flex>
    </div>
  );
}
