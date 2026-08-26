import { useMemo, useState } from 'react';
import { makeStyles } from '@fluentui/react-components';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { useWorkOrderStatusCounts } from '../features/dashboard/hooks/useWorkOrderStatusCounts';
import { useWorkOrderList } from '../features/dashboard/hooks/useWorkOrderList';
import { StatusCountTile } from '../features/dashboard/components/StatusCountTile';
import { WorkOrderTable } from '../features/dashboard/components/WorkOrderTable';
import { formatStatusLabel } from '../features/dashboard/utils/formatStatusLabel';
import { useServiceCenterList } from '../features/service-centers/hooks/useServiceCenterList';
import { usePersonnelRoster } from '../features/personnel/hooks/usePersonnelRoster';
import { buildNameMap } from '../lib/buildNameMap';
import { buildServiceCenterNameMap } from '../features/service-centers/utils/formatServiceCenterName';

const useStyles = makeStyles({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
});

export function DashboardPage() {
  const styles = useStyles();
  const { data: statusCounts, isLoading: countsLoading, isError: countsError } = useWorkOrderStatusCounts();
  const { data: workOrders, isLoading: listLoading, isError: listError } = useWorkOrderList();
  const { data: serviceCenters } = useServiceCenterList();
  const { data: personnel } = usePersonnelRoster();
  const [selectedStatus, setSelectedStatus] = useState<number | 'all'>('all');

  const serviceCenterNames = useMemo(
    () => buildServiceCenterNameMap(serviceCenters),
    [serviceCenters],
  );
  const personnelNames = useMemo(
    () => buildNameMap(personnel, 'cre2b_personnelid', 'cre2b_fullname'),
    [personnel],
  );
  const totalCount = useMemo(
    () => statusCounts?.reduce((sum, sc) => sum + sc.count, 0) ?? 0,
    [statusCounts],
  );
  const filteredWorkOrders = useMemo(() => {
    if (!workOrders || selectedStatus === 'all') return workOrders;
    return workOrders.filter((wo) => wo.cre2b_status === selectedStatus);
  }, [workOrders, selectedStatus]);

  function handleTileClick(code: number) {
    setSelectedStatus((prev) => (prev === code ? 'all' : code));
  }

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of open and in-progress work orders" />

      {countsLoading && <LoadingState label="Loading status counts…" />}
      {countsError && <EmptyState message="Could not load work order status counts." />}
      {statusCounts && (
        <div className={styles.grid}>
          <StatusCountTile
            label="All"
            count={totalCount}
            active={selectedStatus === 'all'}
            onClick={() => setSelectedStatus('all')}
          />
          {statusCounts.map((sc) => (
            <StatusCountTile
              key={sc.code}
              label={formatStatusLabel(sc.label)}
              count={sc.count}
              active={selectedStatus === sc.code}
              onClick={() => handleTileClick(sc.code)}
            />
          ))}
        </div>
      )}

      {listLoading && <LoadingState label="Loading work orders…" />}
      {listError && <EmptyState message="Could not load work orders." />}
      {filteredWorkOrders && filteredWorkOrders.length === 0 && (
        <EmptyState
          message={selectedStatus === 'all' ? 'No work orders yet.' : 'No work orders with this status.'}
        />
      )}
      {filteredWorkOrders && filteredWorkOrders.length > 0 && (
        <WorkOrderTable
          workOrders={filteredWorkOrders}
          serviceCenterNames={serviceCenterNames}
          personnelNames={personnelNames}
        />
      )}
    </div>
  );
}
