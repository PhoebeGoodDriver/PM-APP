import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { makeStyles, tokens } from '@fluentui/react-components';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { ReadOnlyField } from '../components/ReadOnlyField';
import { WorkOrderTable } from '../features/dashboard/components/WorkOrderTable';
import { useBatch } from '../features/batches/hooks/useBatch';
import { useBatchWorkOrders } from '../features/batches/hooks/useBatchWorkOrders';
import { useServiceCenterList } from '../features/service-centers/hooks/useServiceCenterList';
import { usePersonnelRoster } from '../features/personnel/hooks/usePersonnelRoster';
import { buildServiceCenterNameMap } from '../features/service-centers/utils/formatServiceCenterName';
import { buildNameMap } from '../lib/buildNameMap';
import { getFormattedValueAnnotation } from '../lib/odataAnnotation';

const useStyles = makeStyles({
  card: {
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '20px',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
});

export function BatchDetailPage() {
  const styles = useStyles();
  const { id } = useParams();
  const { data: batch, isLoading: batchLoading, isError: batchError } = useBatch(id);
  const { data: workOrders, isLoading: woLoading, isError: woError } = useBatchWorkOrders(id);
  const { data: serviceCenters } = useServiceCenterList();
  const { data: personnel } = usePersonnelRoster();

  const serviceCenterNames = useMemo(
    () => buildServiceCenterNameMap(serviceCenters),
    [serviceCenters],
  );
  const personnelNames = useMemo(
    () => buildNameMap(personnel, 'cre2b_personnelid', 'cre2b_fullname'),
    [personnel],
  );

  return (
    <div>
      <PageHeader title="Batch" subtitle={batch?.cre2b_batchnumber} />

      {batchLoading && <LoadingState label="Loading batch…" />}
      {batchError && <EmptyState message="Could not load this batch." />}
      {batch && (
        <div className={styles.card}>
          <ReadOnlyField label="Batch Number">{batch.cre2b_batchnumber || '—'}</ReadOnlyField>
          <ReadOnlyField label="Created By">
            {getFormattedValueAnnotation(batch, '_createdby_value') || 'Unknown'}
          </ReadOnlyField>
          <ReadOnlyField label="Created On">
            {batch.createdon ? new Date(batch.createdon).toLocaleString() : '—'}
          </ReadOnlyField>
        </div>
      )}

      {woLoading && <LoadingState label="Loading work orders…" />}
      {woError && <EmptyState message="Could not load work orders for this batch." />}
      {workOrders && workOrders.length === 0 && (
        <EmptyState message="No work orders in this batch." />
      )}
      {workOrders && workOrders.length > 0 && (
        <WorkOrderTable
          workOrders={workOrders}
          serviceCenterNames={serviceCenterNames}
          personnelNames={personnelNames}
        />
      )}
    </div>
  );
}
