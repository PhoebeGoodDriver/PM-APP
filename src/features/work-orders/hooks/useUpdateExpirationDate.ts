import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Cre2b_workordersService } from '../../../generated/services/Cre2b_workordersService';
import { Cre2b_workorderstatushistoriesService } from '../../../generated/services/Cre2b_workorderstatushistoriesService';
import { buildODataBind } from '../utils/odataBind';

export interface UpdateExpirationDateInput {
  workOrderId: string;
  previousDate: string | undefined;
  newDate: string;
}

/**
 * Thrown when the WorkOrder's expiration date was successfully updated but the
 * WorkOrderStatusHistory row logging that change failed to write. Mirrors
 * ReassignPartialFailureError / CancelPartialFailureError — the UI must surface this
 * distinctly from a total failure, since the field change already happened.
 */
export class UpdateExpirationDatePartialFailureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UpdateExpirationDatePartialFailureError';
  }
}

const ACTIONTYPE_COMMENT_UPDATE = 200080003;

function formatShortDate(iso: string | undefined): string {
  return iso ? new Date(iso).toLocaleDateString() : 'unset';
}

async function updateExpirationDate(input: UpdateExpirationDateInput) {
  const updateResult = await Cre2b_workordersService.update(input.workOrderId, {
    cre2b_expirationdate: input.newDate,
  });
  if (!updateResult.success) {
    throw updateResult.error ?? new Error('Failed to update the expiration date.');
  }

  const comment = `Expiration date changed from ${formatShortDate(input.previousDate)} to ${formatShortDate(input.newDate)}.`;

  const historyResult = await Cre2b_workorderstatushistoriesService.create({
    statecode: 0,
    cre2b_actiontype: ACTIONTYPE_COMMENT_UPDATE,
    cre2b_changedat: new Date().toISOString(),
    // Changed By is deliberately not set here — Dataverse's own createdby system field
    // already records who made the write, correctly and automatically. Don't shadow it.
    cre2b_comment: comment,
    'cre2b_WorkOrder@odata.bind': buildODataBind('cre2b_workorders', input.workOrderId),
  });

  if (!historyResult.success) {
    throw new UpdateExpirationDatePartialFailureError(
      `The expiration date was updated, but logging it to history failed` +
        `${historyResult.error?.message ? `: ${historyResult.error.message}` : '.'} ` +
        'Please note this change manually — the work order itself was updated correctly.',
    );
  }

  return updateResult.data;
}

export function useUpdateExpirationDate(workOrderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateExpirationDate,
    onSettled: () => {
      // Invalidate regardless of outcome — even a "failed" mutation may have already
      // changed the WorkOrder's expiration date (see UpdateExpirationDatePartialFailureError).
      queryClient.invalidateQueries({ queryKey: ['workOrder', workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['workOrderStatusHistory', workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['workOrderList'] });
    },
  });
}
