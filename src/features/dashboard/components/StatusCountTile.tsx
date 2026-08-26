import { makeStyles, tokens, Text } from '@fluentui/react-components';

const useStyles = makeStyles({
  tile: {
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: '8px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
    fontFamily: 'inherit',
    ':hover': {
      boxShadow: '0 0 0 1px #4B2E83',
    },
  },
  tileActive: {
    backgroundColor: 'rgba(75, 46, 131, 0.06)',
    boxShadow: '0 0 0 2px #4B2E83',
  },
  count: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#4B2E83',
  },
  label: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground2,
  },
});

export function StatusCountTile({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active?: boolean;
  onClick?: () => void;
}) {
  const styles = useStyles();
  return (
    <button
      type="button"
      className={active ? `${styles.tile} ${styles.tileActive}` : styles.tile}
      onClick={onClick}
    >
      <Text className={styles.count}>{count}</Text>
      <Text className={styles.label}>{label}</Text>
    </button>
  );
}
