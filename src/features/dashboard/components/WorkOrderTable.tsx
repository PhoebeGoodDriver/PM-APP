import { Link as RouterLink } from 'react-router-dom';
import {
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Badge,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { resolveName } from '../../../lib/buildNameMap';
import { resolveOptionLabel } from '../../work-orders/utils/optionSet';
import {
  Cre2b_workorderscre2b_producttype,
  Cre2b_workorderscre2b_problemtype,
  Cre2b_workorderscre2b_status,
} from '../../../generated/models/Cre2b_workordersModel';
import type { Cre2b_workorders } from '../../../generated/models/Cre2b_workordersModel';

const useStyles = makeStyles({
  wrapper: {
    overflowX: 'auto',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: '8px',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  woLink: {
    color: '#4B2E83',
    fontWeight: 600,
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline',
    },
  },
  statusBadge: {
    whiteSpace: 'nowrap',
  },
  expired: {
    color: tokens.colorPaletteRedForeground1,
  },
});

function isPastCalendarDate(iso: string): boolean {
  const date = new Date(iso);
  date.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

const STATUS_COLOR: Record<string, 'informative' | 'warning' | 'success' | 'danger' | 'subtle'> = {
  Assigned: 'informative',
  Accepted: 'informative',
  Scheduled: 'warning',
  OnSite: 'warning',
  ReturnVisit: 'warning',
  'Closed-Completed': 'success',
  'Closed-Canceled': 'danger',
};

export function WorkOrderTable({
  workOrders,
  serviceCenterNames,
  personnelNames,
}: {
  workOrders: Cre2b_workorders[];
  serviceCenterNames: Record<string, string>;
  personnelNames: Record<string, string>;
}) {
  const styles = useStyles();

  return (
    <div className={styles.wrapper}>
      <Table size="small">
        <TableHeader>
          <TableRow>
            <TableHeaderCell>WO #</TableHeaderCell>
            <TableHeaderCell>Service Center</TableHeaderCell>
            <TableHeaderCell>Project</TableHeaderCell>
            <TableHeaderCell>Product / Problem</TableHeaderCell>
            <TableHeaderCell>Assigned To</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Expires</TableHeaderCell>
            <TableHeaderCell>Created</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.map((wo) => {
            const statusLabel = resolveOptionLabel(
              Cre2b_workorderscre2b_status,
              wo.cre2b_status,
              wo.cre2b_statusname,
            );
            const serviceCenterName = resolveName(
              serviceCenterNames,
              wo._cre2b_servicecenter_value,
              wo.cre2b_servicecentername,
            );
            const assignedToName = resolveName(
              personnelNames,
              wo._cre2b_assignedto_value,
              wo.cre2b_assignedtoname,
            );
            const productTypeLabel = resolveOptionLabel(
              Cre2b_workorderscre2b_producttype,
              wo.cre2b_producttype,
              wo.cre2b_producttypename,
            );
            const problemTypeLabel = resolveOptionLabel(
              Cre2b_workorderscre2b_problemtype,
              wo.cre2b_problemtype,
              wo.cre2b_problemtypename,
            );
            const createdAt = wo.cre2b_createdat || wo.createdon;
            const isClosed = statusLabel === 'Closed-Completed' || statusLabel === 'Closed-Canceled';
            const isExpired =
              !isClosed && !!wo.cre2b_expirationdate && isPastCalendarDate(wo.cre2b_expirationdate);

            return (
              <TableRow key={wo.cre2b_workorderid}>
                <TableCell>
                  <RouterLink className={styles.woLink} to={`/work-orders/${wo.cre2b_workorderid}`}>
                    {wo.cre2b_wonumber}
                  </RouterLink>
                </TableCell>
                <TableCell>{serviceCenterName}</TableCell>
                <TableCell>{wo.cre2b_projectname || '—'}</TableCell>
                <TableCell>
                  {productTypeLabel} / {problemTypeLabel}
                </TableCell>
                <TableCell>{assignedToName}</TableCell>
                <TableCell>
                  <Badge
                    className={styles.statusBadge}
                    appearance="filled"
                    color={STATUS_COLOR[statusLabel] ?? 'subtle'}
                  >
                    {statusLabel}
                  </Badge>
                </TableCell>
                <TableCell className={isExpired ? styles.expired : undefined}>
                  {wo.cre2b_expirationdate
                    ? new Date(wo.cre2b_expirationdate).toLocaleDateString()
                    : '—'}
                </TableCell>
                <TableCell>{createdAt ? new Date(createdAt).toLocaleDateString() : '—'}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
