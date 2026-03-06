import { useState, useMemo, useSyncExternalStore, useCallback } from 'react';
import { Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import { createStyles } from 'antd-style';
import { useSnapshot } from 'valtio';
import JsonView from '@microlink/react-json-view';

import { formatTime, formatDurationMs } from '@/lib/formatters';
import { cleanJsonValue } from '@/lib/json';
import { CommandStatus, getPairStatus, CommandSortMode } from '@/ui/stores/commands';
import { getPairDuration } from '@/lib/entity';
import { commandsFilters } from '@/ui/stores/commands/store';
import { pairedEntities, type PairedEntityWithId } from '@/ui/observables/pairedEntities';
import { useJsonViewerTheme } from '@/ui/hooks/useJsonViewerTheme';
import type { AnyPairedEntity } from '@/lib/entity/types';
import { isNonNullObject } from '@/lib/guards/isNonNullObject';
import { toggleArrayItem } from '@/lib/utils/toggleArrayItem';
import { BaseTable } from '../../components/BaseTable';
import { STATUS_COLOR } from './types';

const useStyles = createStyles(() => ({
  monospace: {
    fontFamily: 'monospace',
    fontSize: '12px',
  },
  time: {
    fontWeight: 500,
  },
  dimmed: {
    opacity: 0.4,
  },
  expandWrapper: {
    padding: '4px',
  },
}));

function renderStatus(_: unknown, row: AnyPairedEntity) {
  const status: CommandStatus = getPairStatus(row);

  return <Tag color={STATUS_COLOR[status]}>{status}</Tag>;
}

function renderTime(_: unknown, row: AnyPairedEntity) {
  const ts = row.request?.timestamp ?? row.response?.timestamp ?? 0;

  return <span style={{ fontWeight: 500 }}>{formatTime(ts)}</span>;
}

const sortFn: Record<CommandSortMode, (a: PairedEntityWithId, b: PairedEntityWithId) => number> = {
  [CommandSortMode.Natural]: () => 0,
  [CommandSortMode.Heaviest]: (a, b) => getPairDuration(b) - getPairDuration(a),
  [CommandSortMode.Lightest]: (a, b) => getPairDuration(a) - getPairDuration(b),
};

export function CommandsTable() {
  const snap = useSnapshot(commandsFilters);
  useSyncExternalStore(pairedEntities.subscribe, pairedEntities.getVersion);
  const jsonTheme = useJsonViewerTheme();
  const { styles } = useStyles();
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

  const filteredPairs = useMemo(() => {
    let result: PairedEntityWithId[] = pairedEntities.getItems();

    if (snap.statuses.length > 0) {
      result = result.filter((pair) => snap.statuses.includes(getPairStatus(pair)));
    }

    if (snap.search.trim()) {
      const query = snap.search.toLowerCase();
      result = result.filter((pair) => pair.command.toLowerCase().includes(query));
    }

    return [...result].sort(sortFn[snap.sortMode]);
  }, [pairedEntities.getVersion(), snap.statuses, snap.search, snap.sortMode]);

  const handleToggle = useCallback((key: React.Key) => {
    setExpandedRowKeys((prev) => toggleArrayItem(prev, key));
  }, []);

  const renderDuration = (_: unknown, row: PairedEntityWithId) => {
    const duration = row.response?.duration;

    if (duration == null) {
      return <span className={styles.dimmed}>—</span>;
    }

    return <span className={styles.monospace}>{formatDurationMs(duration)}</span>;
  };

  const renderCommand = (_: unknown, row: PairedEntityWithId) => (
    <span className={styles.monospace}>{row.command}</span>
  );

  const renderExpanded = (row: PairedEntityWithId) => {
    const jsonProps = {
      displayDataTypes: false,
      displayObjectSize: true,
      enableClipboard: false,
      iconStyle: 'square' as const,
      theme: jsonTheme,
      style: { padding: '4px', fontSize: '12px', background: 'transparent' },
    };

    const reqPayload = cleanJsonValue(row.request?.payload);
    const resPayload = cleanJsonValue(row.response?.payload);
    const reqMeta = cleanJsonValue(row.request?.metadata);
    const resMeta = cleanJsonValue(row.response?.metadata);

    const metaSrc: Record<string, unknown> = {};

    if (reqMeta) {
      metaSrc.request = reqMeta;
    }

    if (resMeta) {
      metaSrc.response = resMeta;
    }

    return (
      <div className={styles.expandWrapper}>
        {isNonNullObject(reqPayload) && (
          <JsonView {...jsonProps} src={reqPayload} name="request" collapsed={false} />
        )}
        {isNonNullObject(resPayload) && (
          <JsonView {...jsonProps} src={resPayload} name="response" collapsed={false} />
        )}
        {Object.keys(metaSrc).length > 0 && (
          <JsonView {...jsonProps} src={metaSrc} name="metadata" collapsed={true} />
        )}
      </div>
    );
  };

  const columns: TableColumnsType<PairedEntityWithId> = [
    { title: 'Status', key: 'status', width: 100, render: renderStatus },
    { title: 'Time', key: 'time', width: 80, render: renderTime },
    { title: 'Duration ms', key: 'duration', width: 100, render: renderDuration },
    { title: 'Command', key: 'command', ellipsis: true, render: renderCommand },
  ];

  return (
    <BaseTable<PairedEntityWithId>
      dataSource={filteredPairs}
      columns={columns}
      rowKey={(record) => record._id}
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
