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
import { CopyJsonButton } from '../../components/CopyJsonButton';

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
  messageCell: {
    position: 'relative',
  },
}));

interface FlatTableProps {
  entities: readonly EntityWithId[];
}

export function FlatTable({ entities }: FlatTableProps) {
  const { styles } = useStyles();
  const jsonTheme = useJsonViewerTheme();
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [hoveredRowKey, setHoveredRowKey] = useState<React.Key | null>(null);

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

  const renderMessage = (_: unknown, entity: EntityWithId) => {
    const payload = cleanJsonValue(entity.payload);
    const metadata = cleanJsonValue(entity.metadata);
    const payloadSrc = Array.isArray(payload) ? { items: payload } : payload;

    const copyData: Record<string, unknown> = {};

    if (isNonNullObject(payloadSrc)) {
      copyData.payload = payloadSrc;
    }

    if (isNonNullObject(metadata)) {
      copyData.metadata = metadata;
    }

    const hasCopyData = Object.keys(copyData).length > 0;

    return (
      <div className={styles.messageCell}>
        <span className={styles.message}>{extractMessage(entity)}</span>
        <CopyJsonButton
          data={hasCopyData ? copyData : null}
          visible={hoveredRowKey === entity._id}
        />
      </div>
    );
  };

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
        onMouseEnter: () => setHoveredRowKey(record._id),
        onMouseLeave: () => setHoveredRowKey(null),
        style: { cursor: 'pointer' },
      })}
    />
  );
}
