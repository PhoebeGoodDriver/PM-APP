import { makeStyles, tokens, Text } from '@fluentui/react-components';
import type { ReactNode } from 'react';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  label: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground2,
  },
  value: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground1,
  },
});

export function ReadOnlyField({ label, children }: { label: string; children: ReactNode }) {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <Text className={styles.label}>{label}</Text>
      <Text className={styles.value}>{children}</Text>
    </div>
  );
}
