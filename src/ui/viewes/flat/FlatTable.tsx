import { useState } from 'react';
import { Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import { createStyles } from 'antd-style';
import JsonView from '@microlink/react-json-view';

import type { EntityWithId } from '@/ui/stores/log';
import { extractMessage, getLogLevel } from '@/lib/entity';
import { formatTime } from '@/lib/formatters';
import { LEVEL_COLORS } from './types';
import { cleanJsonValue } from '@/lib/json';
import { isNonNullObject } from '@/lib/guards/isNonNullObject';
import { useJsonViewerTheme } from '@/ui/hooks/useJsonViewerTheme';
import { toggleArrayItem } from '@/lib/utils/toggleArrayItem';
import { BaseTable } from '../../components/BaseTable';

const useStyles = createStyles(() => ({
  time: {
    fontWeight: 500,
  },
  message: {
    fontFamily: 'monospace',
    fontSize: '12px',
  },
  expandWrapper: {
    padding: '4px',
  },
}));

interface FlatTableProps {
  entities: readonly EntityWithId[];
}

export function FlatTable({ entities }: FlatTableProps) {
  const { styles } = useStyles();
  const jsonTheme = useJsonViewerTheme();
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

  const handleToggle = (key: React.Key) => {
    setExpandedRowKeys((prev) => toggleArrayItem(prev, key));
  };

  const renderLevel = (_: unknown, entity: EntityWithId) => {
    const level = getLogLevel(entity);
    const levelColor = LEVEL_COLORS[level];

    return <Tag color={levelColor}>{level.toLowerCase()}</Tag>;
  };

  const renderTime = (_: unknown, entity: EntityWithId) => {
    const ts = (entity.metadata?.timestamp as string | undefined) ?? entity.timestamp;

    return <span className={styles.time}>{formatTime(ts)}</span>;
  };

  const renderMessage = (_: unknown, entity: EntityWithId) => (
    <span className={styles.message}>{extractMessage(entity)}</span>
  );

  const renderExpanded = (entity: EntityWithId) => {
    const payload = cleanJsonValue(entity.payload);
    const metadata = cleanJsonValue(entity.metadata);

    const jsonProps = {
      collapsed: 2 as const,
      displayDataTypes: false,
      displayObjectSize: true,
      enableClipboard: false,
      iconStyle: 'square' as const,
      theme: jsonTheme,
      style: { padding: '4px', fontSize: '12px', background: 'transparent' },
    };

    const payloadSrc = Array.isArray(payload) ? { items: payload } : payload;

    return (
      <div className={styles.expandWrapper}>
        {isNonNullObject(payloadSrc) && (
          <JsonView {...jsonProps} src={payloadSrc} name="payload" />
        )}
        {isNonNullObject(metadata) && (
          <JsonView {...jsonProps} src={metadata} name="metadata" collapsed={true} />
        )}
      </div>
    );
  };

  const columns: TableColumnsType<EntityWithId> = [
    { title: 'Level', key: 'level', width: 120, render: renderLevel },
    { title: 'Time', key: 'timestamp', width: 80, render: renderTime },
    { title: 'Type', key: 'type', width: 100, dataIndex: 'type' },
    { title: 'Message', key: 'message', ellipsis: true, render: renderMessage },
  ];

  return (
    <BaseTable<EntityWithId>
      dataSource={entities}
      columns={columns}
      rowKey={(entity) => entity._id}
      expandable={{
        columnWidth: 48,
        expandedRowKeys,
        onExpand: (_, record) => handleToggle(record._id),
        expandedRowRender: renderExpanded,
      }}
      onRow={(record) => ({
        onClick: () => handleToggle(record._id),
        style: { cursor: 'pointer' },
      })}
    />
  );
}
