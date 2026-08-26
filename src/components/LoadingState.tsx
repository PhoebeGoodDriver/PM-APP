import { Spinner, makeStyles } from '@fluentui/react-components';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    justifyContent: 'center',
    padding: '48px',
  },
});

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <Spinner label={label} />
    </div>
  );
}
