import { makeStyles, tokens, Text } from '@fluentui/react-components';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    justifyContent: 'center',
    padding: '48px',
    color: tokens.colorNeutralForeground3,
  },
});

export function EmptyState({ message }: { message: string }) {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <Text>{message}</Text>
    </div>
  );
}
