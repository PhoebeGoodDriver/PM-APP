import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { useWorkOrder } from '../features/work-orders/hooks/useWorkOrder';
import { WorkOrderHeader } from '../features/work-orders/components/WorkOrderHeader';
import { WorkOrderStatusHistoryList } from '../features/work-orders/components/WorkOrderStatusHistoryList';
import { ReassignDialog } from '../features/work-orders/components/ReassignDialog';
import { CancelWorkOrderDialog } from '../features/work-orders/components/CancelWorkOrderDialog';
import { EditExpirationDateDialog } from '../features/work-orders/components/EditExpirationDateDialog';
import { useServiceCenterList } from '../features/service-centers/hooks/useServiceCenterList';
import { usePersonnelRoster } from '../features/personnel/hooks/usePersonnelRoster';
import { buildNameMap, resolveName } from '../lib/buildNameMap';
import { buildServiceCenterNameMap } from '../features/service-centers/utils/formatServiceCenterName';
import { resolveOptionLabel } from '../features/work-orders/utils/optionSet';
import { Cre2b_workorderscre2b_status } from '../generated/models/Cre2b_workordersModel';

export function WorkOrderDetailPage() {
  const { id } = useParams();
  const { data: workOrder, isLoading, isError } = useWorkOrder(id);
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
  const currentAssigneeName = workOrder
    ? resolveName(personnelNames, workOrder._cre2b_assignedto_value, workOrder.cre2b_assignedtoname)
    : '';
  const statusLabel = workOrder
    ? resolveOptionLabel(Cre2b_workorderscre2b_status, workOrder.cre2b_status, workOrder.cre2b_statusname)
    : undefined;
  const isClosed = statusLabel === 'Closed-Completed' || statusLabel === 'Closed-Canceled';

  return (
    <div>
      <PageHeader
        title="Work Order"
        subtitle={workOrder?.cre2b_wonumber}
        actions={
          workOrder && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <ReassignDialog
                workOrderId={workOrder.cre2b_workorderid}
                currentAssigneeId={workOrder._cre2b_assignedto_value ?? ''}
                currentAssigneeName={currentAssigneeName === '—' ? '' : currentAssigneeName}
              />
              {!isClosed && (
                <EditExpirationDateDialog
                  workOrderId={workOrder.cre2b_workorderid}
                  currentExpirationDate={workOrder.cre2b_expirationdate}
                />
              )}
              {!isClosed && workOrder.cre2b_status !== undefined && (
                <CancelWorkOrderDialog
                  workOrderId={workOrder.cre2b_workorderid}
                  currentStatus={workOrder.cre2b_status}
                />
              )}
            </div>
          )
        }
      />
      {isLoading && <LoadingState label="Loading work order…" />}
      {isError && <EmptyState message="Could not load this work order." />}
      {workOrder && (
        <>
          <WorkOrderHeader
            workOrder={workOrder}
            serviceCenterNames={serviceCenterNames}
            personnelNames={personnelNames}
          />
          <WorkOrderStatusHistoryList workOrderId={workOrder.cre2b_workorderid} />
        </>
      )}
    </div>
  );
}
