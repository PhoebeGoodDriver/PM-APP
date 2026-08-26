import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Cre2b_workordersService } from '../../../generated/services/Cre2b_workordersService';
import { Cre2b_workorderstatushistoriesService } from '../../../generated/services/Cre2b_workorderstatushistoriesService';
import type { Cre2b_workorderscre2b_status } from '../../../generated/models/Cre2b_workordersModel';
import { buildODataBind } from '../utils/odataBind';

export interface CancelWorkOrderInput {
  workOrderId: string;
  currentStatus: Cre2b_workorderscre2b_status;
  reason: string;
}

/**
 * Thrown when the WorkOrder's status was successfully updated to Closed-Canceled but the
 * WorkOrderStatusHistory row logging that cancellation failed to write. Mirrors
 * ReassignPartialFailureError — the UI must surface this distinctly from a total failure,
 * since the status change already happened.
 */
export class CancelPartialFailureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CancelPartialFailureError';
  }
}

const ACTIONTYPE_STATUS_CHANGE = 200080000;
const STATUS_CLOSED_CANCELED = 200080006;

async function cancelWorkOrder(input: CancelWorkOrderInput) {
  const updateResult = await Cre2b_workordersService.update(input.workOrderId, {
    cre2b_status: STATUS_CLOSED_CANCELED,
  });
  if (!updateResult.success) {
    throw updateResult.error ?? new Error('Failed to cancel the work order.');
  }

  const historyResult = await Cre2b_workorderstatushistoriesService.create({
    statecode: 0,
    cre2b_actiontype: ACTIONTYPE_STATUS_CHANGE,
    cre2b_fromstatus: input.currentStatus,
    cre2b_tostatus: STATUS_CLOSED_CANCELED,
    cre2b_changedat: new Date().toISOString(),
    // Changed By is deliberately not set here — Dataverse's own createdby system field
    // already records who made the write, correctly and automatically. Don't shadow it.
    cre2b_comment: input.reason,
    'cre2b_WorkOrder@odata.bind': buildODataBind('cre2b_workorders', input.workOrderId),
  });

  if (!historyResult.success) {
    throw new CancelPartialFailureError(
      `The work order was canceled, but logging it to history failed` +
        `${historyResult.error?.message ? `: ${historyResult.error.message}` : '.'} ` +
        'Please note this cancellation manually — the work order itself was updated correctly.',
    );
  }

  return updateResult.data;
}

export function useCancelWorkOrder(workOrderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelWorkOrder,
    onSettled: () => {
      // Invalidate regardless of outcome — even a "failed" mutation may have already
      // changed the WorkOrder's status (see CancelPartialFailureError).
      queryClient.invalidateQueries({ queryKey: ['workOrder', workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['workOrderStatusHistory', workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['workOrderList'] });
      queryClient.invalidateQueries({ queryKey: ['workOrderStatusCounts'] });
    },
  });
}
