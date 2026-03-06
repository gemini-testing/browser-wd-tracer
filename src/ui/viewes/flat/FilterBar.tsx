import { useState } from 'react';
import { useSnapshot } from 'valtio';
import { Input, Select, Flex } from 'antd';
import { createStyles } from 'antd-style';

import { flatFilters, setFlatFilters } from '@/ui/stores/flat';
import { useDebounce } from '@/ui/hooks/useDebounce';
import { useFlatEntities } from './useFlatEntities';

const { Search } = Input;

const useStyles = createStyles(() => ({
  container: {
    padding: '10px',
    lineHeight: 0,
  },
  label: {
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
}));

export function FilterBar() {
  const snap = useSnapshot(flatFilters);
  const { availableLevels, availableTypes } = useFlatEntities();
  const { styles } = useStyles();

  const [searchInput, setSearchInput] = useState(snap.search);

  useDebounce(searchInput, (value) => setFlatFilters({ search: value }));

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
          onChange={(values) => setFlatFilters({ levels: values })}
          options={availableLevels.map((level) => ({ label: level.toLowerCase(), value: level }))}
        />

        <span className={styles.label}>Type:</span>
        <Select
          mode="multiple"
          placeholder="Select types"
          style={{ minWidth: 180 }}
          maxTagCount={0}
          value={[...snap.types]}
          onChange={(values) => setFlatFilters({ types: values })}
          options={availableTypes.map((type) => ({ label: type, value: type }))}
        />

        <span className={styles.label}>Search:</span>
        <Search
          placeholder="Search messages..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onSearch={(value) => {
            setSearchInput(value);
            setFlatFilters({ search: value });
          }}
          style={{ flex: 1, minWidth: 200 }}
          allowClear
        />
      </Flex>
    </div>
  );
}
