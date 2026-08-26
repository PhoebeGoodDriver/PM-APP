import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Cre2b_workordersService } from '../../../generated/services/Cre2b_workordersService';
import { Cre2b_workorderstatushistoriesService } from '../../../generated/services/Cre2b_workorderstatushistoriesService';
import { buildODataBind } from '../utils/odataBind';

export interface UpdateTrackingNumberInput {
  workOrderId: string;
  previousValue: string | undefined;
  newValue: string;
}

/**
 * Thrown when the WorkOrder's tracking number was successfully updated but the
 * WorkOrderStatusHistory row logging that change failed to write. Mirrors
 * ReassignPartialFailureError / UpdateExpirationDatePartialFailureError — the UI must
 * surface this distinctly from a total failure, since the field change already happened.
 */
export class UpdateTrackingNumberPartialFailureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UpdateTrackingNumberPartialFailureError';
  }
}

const ACTIONTYPE_COMMENT_UPDATE = 200080003;

async function updateTrackingNumber(input: UpdateTrackingNumberInput) {
  const updateResult = await Cre2b_workordersService.update(input.workOrderId, {
    cre2b_trackingnumber: input.newValue,
  });
  if (!updateResult.success) {
    throw updateResult.error ?? new Error('Failed to update the tracking number.');
  }

  const comment = input.previousValue
    ? `Tracking number changed from ${input.previousValue} to ${input.newValue}.`
    : `Tracking number set to ${input.newValue}.`;

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
    throw new UpdateTrackingNumberPartialFailureError(
      `The tracking number was updated, but logging it to history failed` +
        `${historyResult.error?.message ? `: ${historyResult.error.message}` : '.'} ` +
        'Please note this change manually — the work order itself was updated correctly.',
    );
  }

  return updateResult.data;
}

export function useUpdateTrackingNumber(workOrderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTrackingNumber,
    onSettled: () => {
      // Invalidate regardless of outcome — even a "failed" mutation may have already
      // changed the WorkOrder's tracking number (see UpdateTrackingNumberPartialFailureError).
      queryClient.invalidateQueries({ queryKey: ['workOrder', workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['workOrderStatusHistory', workOrderId] });
    },
  });
}
