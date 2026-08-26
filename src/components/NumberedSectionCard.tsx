import { makeStyles, tokens, Text } from '@fluentui/react-components';
import type { ReactNode } from 'react';

const useStyles = makeStyles({
  card: {
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '20px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#4B2E83',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: 600,
    flexShrink: 0,
  },
  title: {
    fontSize: '16px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
});

export function NumberedSectionCard({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: ReactNode;
}) {
  const styles = useStyles();
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.badge}>{number}</div>
        <Text className={styles.title}>{title}</Text>
      </div>
      {children}
    </div>
  );
}
