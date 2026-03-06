import { useState, useEffect, useRef } from 'react';
import { Statistic, Row, Col, Button, Input, Space, Dropdown, Modal, Switch } from 'antd';
import { SettingOutlined, FolderOpenOutlined, BulbOutlined } from '@ant-design/icons';
import { createStyles } from 'antd-style';
import { useSnapshot } from 'valtio';

import { log } from '../stores/log';
import { layout, setTheme, Theme } from '../stores/layout';
import { formatDurationHMS, formatFileSize, formatTime } from '@/lib/formatters';

const PROGRESS_HIDE_DELAY_MS = 600;

const useStyles = createStyles(({ token }) => ({
  container: {
    padding: token.paddingXXS,
  },
  row: {
    flexWrap: 'nowrap',
  },
  statistic: {
    borderRight: `1px solid ${token.colorBorderSecondary}`,
    paddingRight: token.paddingXXS,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',

    '& .ant-statistic-header': {
      marginBottom: 0,
      paddingBottom: 0,
    },
    '& .ant-statistic-title': {
      marginBottom: 0,
      paddingBottom: 0,
    },
    '& .ant-statistic-content': {
      fontSize: token.fontSizeSM,
      fontWeight: token.fontWeightStrong,
    },
  },
  statisticNarrow: {
    width: 80,
  },
  statisticMedium: {
    width: 120,
  },
  statisticWide: {
    width: 150,
  },
  progressCol: {
    textAlign: 'center',
    position: 'relative',
    alignSelf: 'stretch',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: `0 ${token.marginXXS}px`,
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    background: 'rgba(22, 119, 255, 0.12)',
    borderRadius: token.borderRadiusSM,
    transition: 'width 0.2s ease',
    pointerEvents: 'none',
  },
  fileName: {
    fontSize: token.fontSizeSM,
    fontWeight: token.fontWeightStrong,
    opacity: 0.8,
    lineHeight: 1,
    position: 'relative',
  },
  progressIndeterminate: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    borderRadius: token.borderRadiusSM,
    pointerEvents: 'none',

    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      width: '40%',
      background: 'rgba(22, 119, 255, 0.15)',
      borderRadius: token.borderRadiusSM,
      willChange: 'transform',
      animation: 'indeterminate-slide 1.4s ease-in-out infinite',
    },

    '@keyframes indeterminate-slide': {
      '0%': { transform: 'translateX(-100%)' },
      '100%': { transform: 'translateX(350%)' },
    },
  },
  settingsButton: {
    padding: 0,
    display: 'flex',
    alignItems: 'center',
  },
  settingsButtonIcon: {
    fontSize: token.fontSizeLG,
  },
  modalSpace: {
    width: '100%',
  },
}));

function SettingsMenu() {
  const { styles } = useStyles();
  const [modalOpen, setModalOpen] = useState(false);
  const [url, setUrl] = useState('');
  const uiSnap = useSnapshot(layout);

  const handleLoad = () => {
    if (!url.trim()) {
      return;
    }

    window.location.href = `?logUrl=${encodeURIComponent(url.trim())}`;
  };

  const items = [
    {
      key: 'load-trace',
      icon: <FolderOpenOutlined />,
      label: 'Load trace',
      onClick: () => setModalOpen(true),
    },
    { type: 'divider' as const },
    {
      key: 'dark-mode',
      icon: <BulbOutlined />,
      label: (
        <Space>
          Dark mode
          <Switch
            size="small"
            checked={uiSnap.theme === Theme.Dark}
            onChange={(checked) => setTheme(checked ? Theme.Dark : Theme.Light)}
            onClick={(_, e) => e.stopPropagation()}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <Dropdown menu={{ items }} trigger={['click']}>
        <Button
          icon={<SettingOutlined className={styles.settingsButtonIcon} />}
          type="text"
          className={styles.settingsButton}
        />
      </Dropdown>

      <Modal
        title="Load trace from URL"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleLoad}
        okText="Load"
        width={400}
        afterOpenChange={(isOpen) => {
          if (!isOpen) {
            setUrl('');
          }
        }}
      >
        <Space direction="vertical" className={styles.modalSpace}>
          <Input
            placeholder="https://example.com/trace.log"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onPressEnter={handleLoad}
            autoFocus
          />
        </Space>
      </Modal>
    </>
  );
}

export function Summary() {
  const { styles } = useStyles();
  const logSnap = useSnapshot(log);

  const entitiesCount = logSnap.metadata.linesCount;
  const fileSize = formatFileSize(logSnap.metadata.fileSize);
  const fileName = logSnap.metadata.fileUrl || null;

  const { bytesLoaded, totalBytes } = logSnap.progress;
  const isLoading = logSnap.isLoading;
  const isIndeterminate = isLoading && totalBytes === 0;
  const rawProgress = totalBytes > 0
    ? Math.min(bytesLoaded / totalBytes, 1)
    : 0;

  const [showProgress, setShowProgress] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);
  const wasIndeterminate = useRef(false);

  useEffect(() => {
    if (isLoading) {
      setShowProgress(true);

      if (isIndeterminate) {
        wasIndeterminate.current = true;
      } else {
        setDisplayProgress(rawProgress);
      }
    }
  }, [rawProgress, isLoading, isIndeterminate]);

  useEffect(() => {
    if (!isLoading && showProgress) {
      if (!wasIndeterminate.current) {
        setDisplayProgress(1);
      }

      const timer = setTimeout(() => {
        setShowProgress(false);
        wasIndeterminate.current = false;
      }, PROGRESS_HIDE_DELAY_MS);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [isLoading]);

  const { firstTimestamp, lastTimestamp } = logSnap.metadata;

  const timeRange = firstTimestamp && lastTimestamp
    ? `${formatTime(firstTimestamp)} → ${formatTime(lastTimestamp)}`
    : 'N/A';

  const timeDuration = firstTimestamp && lastTimestamp
    ? formatDurationHMS(lastTimestamp - firstTimestamp)
    : 'N/A';

  return (
    <div className={styles.container}>
      <Row className={styles.row} align="middle">
        <Col>
          <Statistic className={`${styles.statistic} ${styles.statisticNarrow}`} title="Entities" value={entitiesCount} />
        </Col>

        <Col>
          <Statistic className={`${styles.statistic} ${styles.statisticNarrow}`} title="File Size" value={fileSize} />
        </Col>

        <Col>
          <Statistic className={`${styles.statistic} ${styles.statisticWide}`} title="Time Range" value={timeRange} />
        </Col>

        <Col>
          <Statistic className={`${styles.statistic} ${styles.statisticMedium}`} title="Time Duration" value={timeDuration} />
        </Col>

        <Col flex="auto" className={styles.progressCol}>
          {showProgress && isIndeterminate && (
            <div className={styles.progressIndeterminate} />
          )}
          {showProgress && !isIndeterminate && (
            <div className={styles.progressBar} style={{ width: `${displayProgress * 100}%` }} />
          )}
          {fileName && (
            <a
              href={fileName}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.fileName}
            >
              {fileName.split('/').pop() ?? fileName}
            </a>
          )}
        </Col>

        <Col>
          <SettingsMenu />
        </Col>
      </Row>
    </div>
  );
}
