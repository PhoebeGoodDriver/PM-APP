import { Outlet } from 'react-router-dom';
import { makeStyles } from '@fluentui/react-components';
import { Sidebar } from './Sidebar';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#F3F2F1',
  },
  content: {
    flex: 1,
    padding: '32px',
    minWidth: 0,
  },
});

export function AppShell() {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <Sidebar />
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
