import { useRef, useState, useEffect } from 'react';
import { Table, Empty } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import { createStyles } from 'antd-style';

const TABLE_HEADER_HEIGHT = 40;
const MIN_SCROLL_Y = 300;
const INITIAL_SCROLL_Y = 600;

const useStyles = createStyles(() => ({
  wrapper: {
    height: '100%',
    '& .ant-table-cell': {
      paddingTop: '4px !important',
      paddingBottom: '4px !important',
      verticalAlign: 'middle',
      fontSize: '13px',
    },
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

interface BaseTableProps<T extends object> {
  dataSource: readonly T[];
  columns: TableColumnsType<T>;
  rowKey: (record: T) => React.Key;
  expandable?: TableProps<T>['expandable'];
  onRow?: TableProps<T>['onRow'];
}

export function BaseTable<T extends object>({
  dataSource,
  columns,
  rowKey,
  expandable,
  onRow,
}: BaseTableProps<T>) {
  const { styles } = useStyles();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(INITIAL_SCROLL_Y);

  useEffect(() => {
    const updateHeight = () => {
      if (wrapperRef.current) {
        const height = wrapperRef.current.clientHeight - TABLE_HEADER_HEIGHT;

        setScrollY(Math.max(height, MIN_SCROLL_Y));
      }
    };

    const resizeObserver = new ResizeObserver(updateHeight);
    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
      updateHeight();
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <Table<T>
        columns={columns}
        dataSource={dataSource as T[]}
        rowKey={rowKey}
        pagination={false}
        virtual={dataSource.length > 0}
        scroll={dataSource.length > 0 ? { y: scrollY } : undefined}
        size="small"
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              className={styles.emptyContainer}
              style={{ height: scrollY }}
            />
          ),
        }}
        expandable={expandable}
        onRow={onRow}
      />
    </div>
  );
}
