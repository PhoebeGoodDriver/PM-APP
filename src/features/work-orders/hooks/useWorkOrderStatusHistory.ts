import { useQuery } from '@tanstack/react-query';
import { Cre2b_workorderstatushistoriesService } from '../../../generated/services/Cre2b_workorderstatushistoriesService';

async function fetchHistory(workOrderId: string) {
  const result = await Cre2b_workorderstatushistoriesService.getAll({
    filter: `_cre2b_workorder_value eq ${workOrderId}`,
    // createdon is Dataverse's own system field, populated on every row regardless of
    // which app wrote it — ordering by the custom cre2b_changedat is unreliable when
    // that field is inconsistently populated across rows from different write paths.
    orderBy: ['createdon asc'],
  });
  if (!result.success) {
    throw result.error ?? new Error('Failed to load work order status history');
  }
  return result.data;
}

export function useWorkOrderStatusHistory(workOrderId: string | undefined) {
  return useQuery({
    queryKey: ['workOrderStatusHistory', workOrderId],
    queryFn: () => fetchHistory(workOrderId as string),
    enabled: Boolean(workOrderId),
  });
}
