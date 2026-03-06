import { useState } from 'react';
import { Layout, ConfigProvider, theme as antdTheme } from 'antd';
import { createStyles } from 'antd-style';
import { useSnapshot } from 'valtio';

import { useLogParser } from './hooks/useLogParser';
import { layout, Theme } from './stores/layout';
import { AppSidebar } from './layout/AppSidebar';
import { AppHeader } from './layout/AppHeader';
import { MainContent } from './layout/MainContent';

const { Sider, Header, Content } = Layout;

const useStyles = createStyles(({ token }) => ({
  layout: {
    height: '100vh',
    overflow: 'hidden',
  },
  innerLayout: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  header: {
    padding: 0,
    height: 'auto',
    margin: '10px',
    marginBottom: 0,
    flexShrink: 0,
    background: `${token.colorBgContainer} !important`,
    borderRadius: token.borderRadiusLG,
  },
  content: {
    flex: 1,
    margin: '10px',
    overflow: 'hidden',
    minHeight: 0,
    background: `${token.colorBgContainer} !important`,
    borderRadius: token.borderRadiusLG,
  },
}));

function AppLayout() {
  useLogParser();
  const [collapsed, setCollapsed] = useState(false);
  const { styles } = useStyles();

  return (
    <Layout className={styles.layout}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="dark">
        <AppSidebar collapsed={collapsed} />
      </Sider>

      <Layout className={styles.innerLayout}>
        <Header className={styles.header}>
          <AppHeader />
        </Header>

        <Content className={styles.content}>
          <MainContent />
        </Content>
      </Layout>
    </Layout>
  );
}

export function App() {
  const { theme } = useSnapshot(layout);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme === Theme.Dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          borderRadius: 6,
        },
      }}
    >
      <AppLayout />
    </ConfigProvider>
  );
}
