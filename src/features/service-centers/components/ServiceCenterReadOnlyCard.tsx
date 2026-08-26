import { makeStyles, tokens, Link, Button } from '@fluentui/react-components';
import { DismissRegular, LocationRegular, OpenRegular } from '@fluentui/react-icons';
import { ReadOnlyField } from '../../../components/ReadOnlyField';
import { buildGoogleMapsLink } from '../../work-orders/utils/buildGoogleMapsLink';
import { buildServiceCenterInfoLink } from '../utils/buildServiceCenterInfoLink';
import type { Cre2b_servicecenters } from '../../../generated/models/Cre2b_servicecentersModel';

const useStyles = makeStyles({
  root: {
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: '8px',
    padding: '16px',
    marginTop: '8px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  name: {
    fontSize: '15px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
});

export function ServiceCenterReadOnlyCard({
  serviceCenter,
  onClear,
}: {
  serviceCenter: Cre2b_servicecenters;
  onClear: () => void;
}) {
  const styles = useStyles();
  const mapsLink = buildGoogleMapsLink({
    street1: serviceCenter.cre2b_streetaddress1,
    street2: serviceCenter.cre2b_streetaddress2,
    city: serviceCenter.cre2b_city,
    state: serviceCenter.cre2b_state,
    zip: serviceCenter.cre2b_zipcode,
  });
  const infoLink = buildServiceCenterInfoLink(serviceCenter.cre2b_locationalphacode);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.name}>
          {serviceCenter.cre2b_locationalphacode ?? serviceCenter.cre2b_locationname} —{' '}
          {serviceCenter.cre2b_locationname}
        </span>
        <Button
          appearance="subtle"
          size="small"
          icon={<DismissRegular />}
          onClick={onClear}
        >
          Change
        </Button>
      </div>
      <div className={styles.grid}>
        <ReadOnlyField label="Address">
          <Link href={mapsLink} target="_blank" rel="noreferrer">
            <LocationRegular /> {serviceCenter.cre2b_streetaddress1}
            {serviceCenter.cre2b_streetaddress2 ? `, ${serviceCenter.cre2b_streetaddress2}` : ''},{' '}
            {serviceCenter.cre2b_city}, {serviceCenter.cre2b_state} {serviceCenter.cre2b_zipcode}
          </Link>
        </ReadOnlyField>
        <ReadOnlyField label="Service Center Info">
          {infoLink ? (
            <Link href={infoLink} target="_blank" rel="noreferrer">
              <OpenRegular /> Service Center Info
            </Link>
          ) : (
            '—'
          )}
        </ReadOnlyField>
      </div>
    </div>
  );
}
