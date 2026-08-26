import { NavLink } from 'react-router-dom';
import { makeStyles, tokens, Text } from '@fluentui/react-components';
import {
  Board20Regular,
  Board20Filled,
  DocumentAdd20Regular,
  DocumentAdd20Filled,
  ArrowUpload20Regular,
  ArrowUpload20Filled,
  Layer20Regular,
  Layer20Filled,
  ChatMultiple20Regular,
  ChatMultiple20Filled,
} from '@fluentui/react-icons';
import type { ComponentType } from 'react';

const useStyles = makeStyles({
  root: {
    width: '240px',
    minWidth: '240px',
    height: '100vh',
    backgroundColor: '#2B1855',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 12px',
    boxSizing: 'border-box',
  },
  brand: {
    color: '#FFFFFF',
    fontSize: '18px',
    fontWeight: 700,
    padding: '0 12px',
    marginBottom: '28px',
  },
  brandSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '12px',
    padding: '0 12px',
    marginTop: '2px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '6px',
    color: 'rgba(255,255,255,0.85)',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.08)',
    },
  },
  linkActive: {
    backgroundColor: tokens.colorBrandBackground,
    color: '#FFFFFF',
  },
});

const navItems: {
  to: string;
  label: string;
  Icon: ComponentType;
  ActiveIcon: ComponentType;
  end?: boolean;
}[] = [
  { to: '/', label: 'Dashboard', Icon: Board20Regular, ActiveIcon: Board20Filled, end: true },
  {
    to: '/create',
    label: 'Create Work Order',
    Icon: DocumentAdd20Regular,
    ActiveIcon: DocumentAdd20Filled,
  },
  {
    to: '/batch-upload',
    label: 'Batch Upload',
    Icon: ArrowUpload20Regular,
    ActiveIcon: ArrowUpload20Filled,
  },
  {
    to: '/batches',
    label: 'Batches',
    Icon: Layer20Regular,
    ActiveIcon: Layer20Filled,
  },
  {
    to: '/feedback',
    label: 'Feedback',
    Icon: ChatMultiple20Regular,
    ActiveIcon: ChatMultiple20Filled,
  },
];

export function Sidebar() {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <div>
        <Text className={styles.brand} block>
          FedEx Freight
        </Text>
        <Text className={styles.brandSub} block>
          Field Service PM
        </Text>
      </div>
      <nav className={styles.nav} style={{ marginTop: '28px' }}>
        {navItems.map(({ to, label, Icon, ActiveIcon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.linkActive}` : styles.link
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? <ActiveIcon /> : <Icon />}
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
