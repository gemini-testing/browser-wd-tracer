import { useState } from 'react';
import { Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import { createStyles } from 'antd-style';
import JsonView from '@microlink/react-json-view';

import { formatTime } from '@/lib/formatters';
import type { ConsolePayload } from '@/lib/console';
import {
  parseConsoleMessage,
  formatStackTrace,
  remoteObjectToJson,
  getObjectArgs,
  getLongStringArgs,
} from '@/lib/console';
import { useJsonViewerTheme } from '@/ui/hooks/useJsonViewerTheme';
import { toggleArrayItem } from '@/lib/utils/toggleArrayItem';
import { BaseTable } from '../../components/BaseTable';
import { CONSOLE_LEVEL_COLOR } from './types';
import { SegmentWithLinks } from './components/SegmentWithLinks';
import type { NormalizedConsoleEntity } from './useConsoleEntities';

const useStyles = createStyles(() => ({
  time: {
    fontWeight: 500,
  },
  message: {
    fontFamily: 'monospace',
    fontSize: '12px',
    overflow: 'hidden',
    display: 'block',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  expandWrapper: {
    padding: '4px 8px',
  },
  stackTrace: {
    margin: '8px 0 0',
    padding: '8px 16px',
    fontFamily: 'monospace',
    fontSize: '12px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    color: 'inherit',
    background: 'transparent',
  },
}));

interface ConsoleTableProps {
  entities: readonly NormalizedConsoleEntity[];
}

function hasExpandContent(payload: ConsolePayload): boolean {
  const hasStack = (payload.stackTrace?.callFrames?.length ?? 0) > 0;
  const hasObjects = getObjectArgs(payload.args).length > 0;
  const hasLongMessage = getLongStringArgs(payload.args).length > 0;

  return hasStack || hasObjects || hasLongMessage;
}

export function ConsoleTable({ entities }: ConsoleTableProps) {
  const { styles } = useStyles();
  const jsonTheme = useJsonViewerTheme();
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

  const handleRowClick = (record: NormalizedConsoleEntity) => {
    if (!hasExpandContent(record.payload)) {
      return;
    }

    const key = record.entity._id;

    setExpandedRowKeys((prev) => toggleArrayItem(prev, key));
  };

  const renderLevel = (_: unknown, record: NormalizedConsoleEntity) => {
    const color = CONSOLE_LEVEL_COLOR[record.payload.type] ?? CONSOLE_LEVEL_COLOR.log;

    return <Tag color={color}>{record.payload.type}</Tag>;
  };

  const renderTime = (_: unknown, record: NormalizedConsoleEntity) => (
    <span className={styles.time}>{formatTime(record.payload.timestamp)}</span>
  );

  const renderMessage = (_: unknown, record: NormalizedConsoleEntity) => {
    const segments = parseConsoleMessage(record.payload.args);

    return (
      <span className={styles.message}>
        {segments.map((seg, i) => (
          <SegmentWithLinks key={i} segment={seg} singleLine />
        ))}
      </span>
    );
  };

  const renderExpanded = (record: NormalizedConsoleEntity) => {
    const { payload } = record;
    const objectArgs = getObjectArgs(payload.args);
    const longArgs = getLongStringArgs(payload.args);
    const hasStack = (payload.stackTrace?.callFrames?.length ?? 0) > 0;

    return (
      <div className={styles.expandWrapper}>
        {longArgs.map((text, i) => (
          <pre key={`msg-${i}`} className={styles.stackTrace}>
            {text}
          </pre>
        ))}

        {objectArgs.map((arg, i) => {
          const json = remoteObjectToJson(arg);

          if (!json) {
            return null;
          }

          return (
            <JsonView
              key={i}
              src={json}
              name={false}
              collapsed={2}
              displayDataTypes={false}
              displayObjectSize={true}
              enableClipboard={false}
              iconStyle="square"
              theme={jsonTheme}
              style={{ padding: '4px', fontSize: '12px', background: 'transparent' }}
            />
          );
        })}

        {hasStack && (
          <pre className={styles.stackTrace}>
            {formatStackTrace(payload.stackTrace!)}
          </pre>
        )}
      </div>
    );
  };

  const columns: TableColumnsType<NormalizedConsoleEntity> = [
    { title: 'Level', key: 'level', width: 140, render: renderLevel },
    { title: 'Time', key: 'timestamp', width: 80, render: renderTime },
    { title: 'Message', key: 'message', render: renderMessage },
  ];

  return (
    <BaseTable<NormalizedConsoleEntity>
      dataSource={entities}
      columns={columns}
      rowKey={(record) => record.entity._id}
      expandable={{
        columnWidth: 48,
        expandedRowKeys,
        rowExpandable: (record) => hasExpandContent(record.payload),
        onExpand: (_, record) => handleRowClick(record),
        expandedRowRender: renderExpanded,
      }}
      onRow={(record) => ({
        onClick: () => handleRowClick(record),
        style: { cursor: hasExpandContent(record.payload) ? 'pointer' : 'default' },
      })}
    />
  );
}
