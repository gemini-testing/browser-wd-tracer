import { createStyles } from 'antd-style';
import { CommandsTable } from './CommandsTable';

const useStyles = createStyles(() => ({
  wrapper: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
}));

export function CommandsView() {
  const { styles } = useStyles();

  return (
    <div className={styles.wrapper}>
      <CommandsTable />
    </div>
  );
}
