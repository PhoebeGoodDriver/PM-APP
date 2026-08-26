import { makeStyles, tokens, Text } from '@fluentui/react-components';
import type { ReactNode } from 'react';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  subtitle: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground2,
    marginTop: '2px',
  },
});

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <div>
        <Text as="h1" className={styles.title} block>
          {title}
        </Text>
        {subtitle && (
          <Text className={styles.subtitle} block>
            {subtitle}
          </Text>
        )}
      </div>
      {actions}
    </div>
  );
}
