import { useQuery } from '@tanstack/react-query';
import { Cre2b_workordersService } from '../../../generated/services/Cre2b_workordersService';

async function fetchBatchWorkOrders(batchId: string) {
  const result = await Cre2b_workordersService.getAll({
    filter: `_cre2b_batch_value eq ${batchId}`,
  });
  if (!result.success) {
    throw result.error ?? new Error('Failed to load work orders for this batch');
  }
  return result.data;
}

export function useBatchWorkOrders(batchId: string | undefined) {
  return useQuery({
    queryKey: ['batchWorkOrders', batchId],
    queryFn: () => fetchBatchWorkOrders(batchId as string),
    enabled: Boolean(batchId),
  });
}
