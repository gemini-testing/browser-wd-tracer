import { Menu } from 'antd';
import { ApiOutlined, UnorderedListOutlined, BugOutlined } from '@ant-design/icons';
import { useSnapshot } from 'valtio';
import { layout, setViewMode, ViewMode } from '@/ui/stores/layout';
import { createStyles } from 'antd-style';

import logo from '../assets/logo.png';

const useStyles = createStyles(({ token }) => ({
  logoWrapper: {
    height: 65,
    margin: '15px 5px 5px',
    position: 'relative',
    overflow: 'hidden',
  },
  logoImage: {
    position: 'absolute',
    inset: 0,
    background: `url(${logo}) center/contain no-repeat`,
    transition: 'opacity 0.3s ease',
  },
  logoText: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: token.colorTextLightSolid,
    fontSize: 18,
    fontWeight: 700,
    fontFamily: 'monospace',
    letterSpacing: 1,
    transition: 'opacity 0.3s ease',
  },
}));

interface AppSidebarProps {
  collapsed: boolean;
}

export function AppSidebar({ collapsed }: AppSidebarProps) {
  const snap = useSnapshot(layout);
  const { styles } = useStyles();

  const handleMenuClick = ({ key }: { key: string }) => {
    setViewMode(key as ViewMode);
  };

  return (
    <>
      <div className={styles.logoWrapper}>
        <div className={styles.logoImage} style={{ opacity: collapsed ? 0 : 1 }} />
        <span className={styles.logoText} style={{ opacity: collapsed ? 1 : 0 }}>WDT</span>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[snap.viewMode]}
        onClick={handleMenuClick}
        items={[
          {
            key: ViewMode.Flat,
            icon: <UnorderedListOutlined />,
            label: 'Flat View',
          },
          {
            key: ViewMode.Commands,
            icon: <ApiOutlined />,
            label: 'Commands',
          },
          {
            key: ViewMode.Console,
            icon: <BugOutlined />,
            label: 'Console',
          },
        ]}
      />
    </>
  );
}
