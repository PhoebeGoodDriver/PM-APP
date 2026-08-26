import { makeStyles, tokens, Badge, Text } from '@fluentui/react-components';
import { ReadOnlyField } from '../../../components/ReadOnlyField';
import { EditTrackingNumberDialog } from './EditTrackingNumberDialog';
import { resolveName } from '../../../lib/buildNameMap';
import { resolveOptionLabel } from '../utils/optionSet';
import {
  Cre2b_workorderscre2b_wotype,
  Cre2b_workorderscre2b_producttype,
  Cre2b_workorderscre2b_problemtype,
  Cre2b_workorderscre2b_assignpool,
  Cre2b_workorderscre2b_status,
} from '../../../generated/models/Cre2b_workordersModel';
import type { Cre2b_workorders } from '../../../generated/models/Cre2b_workordersModel';

const useStyles = makeStyles({
  card: {
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '20px',
  },
  top: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  woNumber: {
    fontSize: '20px',
    fontWeight: 700,
    color: tokens.colorNeutralForeground1,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '20px',
  },
  fullGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  trackingRow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
});

const STATUS_COLOR: Record<string, 'informative' | 'warning' | 'success' | 'danger' | 'subtle'> = {
  Assigned: 'informative',
  Accepted: 'informative',
  Scheduled: 'warning',
  OnSite: 'warning',
  ReturnVisit: 'warning',
  'Closed-Completed': 'success',
  'Closed-Canceled': 'danger',
};

export function WorkOrderHeader({
  workOrder,
  serviceCenterNames,
  personnelNames,
}: {
  workOrder: Cre2b_workorders;
  serviceCenterNames: Record<string, string>;
  personnelNames: Record<string, string>;
}) {
  const styles = useStyles();
  const statusLabel = resolveOptionLabel(
    Cre2b_workorderscre2b_status,
    workOrder.cre2b_status,
    workOrder.cre2b_statusname,
  );
  const serviceCenterName = resolveName(
    serviceCenterNames,
    workOrder._cre2b_servicecenter_value,
    workOrder.cre2b_servicecentername,
  );
  const assignedToName = resolveName(
    personnelNames,
    workOrder._cre2b_assignedto_value,
    workOrder.cre2b_assignedtoname,
  );
  const wotypeLabel = resolveOptionLabel(
    Cre2b_workorderscre2b_wotype,
    workOrder.cre2b_wotype,
    workOrder.cre2b_wotypename,
  );
  const producttypeLabel = resolveOptionLabel(
    Cre2b_workorderscre2b_producttype,
    workOrder.cre2b_producttype,
    workOrder.cre2b_producttypename,
  );
  const problemtypeLabel = resolveOptionLabel(
    Cre2b_workorderscre2b_problemtype,
    workOrder.cre2b_problemtype,
    workOrder.cre2b_problemtypename,
  );
  const assignpoolLabel = resolveOptionLabel(
    Cre2b_workorderscre2b_assignpool,
    workOrder.cre2b_assignpool,
    workOrder.cre2b_assignpoolname,
  );

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <Text className={styles.woNumber}>{workOrder.cre2b_wonumber}</Text>
        <Badge appearance="filled" color={STATUS_COLOR[statusLabel] ?? 'subtle'} size="large">
          {statusLabel}
        </Badge>
      </div>

      <div className={styles.grid}>
        <ReadOnlyField label="Service Center">{serviceCenterName}</ReadOnlyField>
        <ReadOnlyField label="W/O Type">{wotypeLabel}</ReadOnlyField>
        <ReadOnlyField label="Assigned To">{assignedToName}</ReadOnlyField>
        <ReadOnlyField label="Expiration Date">
          {workOrder.cre2b_expirationdate
            ? new Date(workOrder.cre2b_expirationdate).toLocaleDateString()
            : '—'}
        </ReadOnlyField>
        <ReadOnlyField label="Product Type">{producttypeLabel}</ReadOnlyField>
        <ReadOnlyField label="Problem Type">{problemtypeLabel}</ReadOnlyField>
        <ReadOnlyField label="Assignment Pool">{assignpoolLabel}</ReadOnlyField>
        <ReadOnlyField label="Project Name">{workOrder.cre2b_projectname || '—'}</ReadOnlyField>
      </div>

      <div className={styles.fullGrid}>
        <ReadOnlyField label="Problem Description">
          {workOrder.cre2b_problemdescription || '—'}
        </ReadOnlyField>
        <ReadOnlyField label="Problem Details">{workOrder.cre2b_problemdetails || '—'}</ReadOnlyField>
        <ReadOnlyField label="Product/Part Numbers Comments">
          {workOrder.cre2b_productpartnumberscomments || '—'}
        </ReadOnlyField>
        <ReadOnlyField label="Room/Area">{workOrder.cre2b_roomarea || '—'}</ReadOnlyField>
        <ReadOnlyField label="Tracking Number">
          <span className={styles.trackingRow}>
            <span>{workOrder.cre2b_trackingnumber || '—'}</span>
            <EditTrackingNumberDialog
              workOrderId={workOrder.cre2b_workorderid}
              currentValue={workOrder.cre2b_trackingnumber}
            />
          </span>
        </ReadOnlyField>
        <ReadOnlyField label="Network Detail">
          {workOrder.cre2b_networkcircuitcomputernamedetail || '—'}
        </ReadOnlyField>
        <ReadOnlyField label="Circuit Details">{workOrder.cre2b_circuitdetails || '—'}</ReadOnlyField>
        <ReadOnlyField label="Computer/Host Name">
          {workOrder.cre2b_computerhostname || '—'}
        </ReadOnlyField>
        {workOrder.cre2b_link && (
          <ReadOnlyField label="Reference Link">
            <a href={workOrder.cre2b_link} target="_blank" rel="noreferrer">
              {workOrder.cre2b_link}
            </a>
          </ReadOnlyField>
        )}
      </div>
    </div>
  );
}
