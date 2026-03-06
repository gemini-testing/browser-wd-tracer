import { useState } from 'react';
import { Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import { createStyles } from 'antd-style';
import JsonView from '@microlink/react-json-view';

import type { EntityWithId } from '@/ui/stores/log';
import { formatTime } from '@/lib/formatters';
import type { ConsolePayload } from '@/lib/console';
import {
  parseConsoleMessage,
  formatStackTrace,
  remoteObjectToJson,
  hasExpandContent,
  getObjectArgs,
  getLongStringArgs,
} from '@/lib/console';
import { useJsonViewerTheme } from '@/ui/hooks/useJsonViewerTheme';
import { toggleArrayItem } from '@/lib/utils/toggleArrayItem';
import { BaseTable } from '../../components/BaseTable';
import { CONSOLE_LEVEL_COLOR } from './types';
import { SegmentWithLinks } from './components/SegmentWithLinks';

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
  entities: readonly EntityWithId[];
}

export function ConsoleTable({ entities }: ConsoleTableProps) {
  const { styles } = useStyles();
  const jsonTheme = useJsonViewerTheme();
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

  const handleRowClick = (record: EntityWithId) => {
    if (!hasExpandContent(record)) {
      return;
    }

    const key = record._id;

    setExpandedRowKeys((prev) => toggleArrayItem(prev, key));
  };

  const renderLevel = (_: unknown, entity: EntityWithId) => {
    const payload = entity.payload as ConsolePayload;
    const color = CONSOLE_LEVEL_COLOR[payload.type] ?? CONSOLE_LEVEL_COLOR.log;

    return <Tag color={color}>{payload.type}</Tag>;
  };

  const renderTime = (_: unknown, entity: EntityWithId) => {
    const payload = entity.payload as ConsolePayload;

    return <span className={styles.time}>{formatTime(payload.timestamp)}</span>;
  };

  const renderMessage = (_: unknown, entity: EntityWithId) => {
    const payload = entity.payload as ConsolePayload;
    const segments = parseConsoleMessage(payload.args);

    return (
      <span className={styles.message}>
        {segments.map((seg, i) => (
          <SegmentWithLinks key={i} segment={seg} singleLine />
        ))}
      </span>
    );
  };

  const renderExpanded = (entity: EntityWithId) => {
    const payload = entity.payload as ConsolePayload;
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

  const columns: TableColumnsType<EntityWithId> = [
    { title: 'Level', key: 'level', width: 140, render: renderLevel },
    { title: 'Time', key: 'timestamp', width: 80, render: renderTime },
    { title: 'Message', key: 'message', render: renderMessage },
  ];

  return (
    <BaseTable<EntityWithId>
      dataSource={entities}
      columns={columns}
      rowKey={(entity) => entity._id}
      expandable={{
        columnWidth: 48,
        expandedRowKeys,
        rowExpandable: hasExpandContent,
        onExpand: (_, record) => handleRowClick(record),
        expandedRowRender: renderExpanded,
      }}
      onRow={(record) => ({
        onClick: () => handleRowClick(record),
        style: { cursor: hasExpandContent(record) ? 'pointer' : 'default' },
      })}
    />
  );
}
