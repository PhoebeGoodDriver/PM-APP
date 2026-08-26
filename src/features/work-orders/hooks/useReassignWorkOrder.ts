import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Cre2b_workordersService } from '../../../generated/services/Cre2b_workordersService';
import { Cre2b_workorderstatushistoriesService } from '../../../generated/services/Cre2b_workorderstatushistoriesService';
import { buildODataBind } from '../utils/odataBind';

export interface ReassignWorkOrderInput {
  workOrderId: string;
  previousAssigneeName: string;
  newAssigneeId: string;
  newAssigneeName: string;
  reason?: string;
}

/**
 * Thrown when the WorkOrder's assignee was successfully updated but the
 * WorkOrderStatusHistory row logging that transfer failed to write. The UI must
 * surface this distinctly from a total failure — the assignment change already
 * happened, silently treating it as a generic error would hide that the
 * traceability record is now missing.
 */
export class ReassignPartialFailureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReassignPartialFailureError';
  }
}

const ACTIONTYPE_TRANSFER = 200080002;

async function reassignWorkOrder(input: ReassignWorkOrderInput) {
  const updateResult = await Cre2b_workordersService.update(input.workOrderId, {
    'cre2b_AssignedTo@odata.bind': buildODataBind('cre2b_personnels', input.newAssigneeId),
  });
  if (!updateResult.success) {
    throw updateResult.error ?? new Error('Failed to update the assigned technician/advisor.');
  }

  const comment = `Reassigned from ${input.previousAssigneeName || 'Unassigned'} to ${input.newAssigneeName}${
    input.reason ? ` — ${input.reason}` : ''
  }`;

  const historyResult = await Cre2b_workorderstatushistoriesService.create({
    statecode: 0,
    cre2b_actiontype: ACTIONTYPE_TRANSFER,
    cre2b_changedat: new Date().toISOString(),
    cre2b_comment: comment,
    'cre2b_WorkOrder@odata.bind': buildODataBind('cre2b_workorders', input.workOrderId),
  });

  if (!historyResult.success) {
    throw new ReassignPartialFailureError(
      `The assignee was changed to ${input.newAssigneeName}, but logging the transfer to history failed` +
        `${historyResult.error?.message ? `: ${historyResult.error.message}` : '.'} ` +
        'Please note this transfer manually — the work order itself was updated correctly.',
    );
  }

  return updateResult.data;
}

export function useReassignWorkOrder(workOrderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reassignWorkOrder,
    onSettled: () => {
      // Invalidate regardless of outcome — even a "failed" mutation may have
      // already changed the WorkOrder's assignee (see ReassignPartialFailureError).
      queryClient.invalidateQueries({ queryKey: ['workOrder', workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['workOrderStatusHistory', workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['workOrderList'] });
    },
  });
}
