import { useQuery } from '@tanstack/react-query';
import { Cre2b_workordersService } from '../../../generated/services/Cre2b_workordersService';

async function fetchBatchWorkOrderCounts(batchIds: string[]): Promise<Record<string, number>> {
  const entries = await Promise.all(
    batchIds.map(async (batchId) => {
      const result = await Cre2b_workordersService.getAll({
        filter: `_cre2b_batch_value eq ${batchId}`,
        select: ['cre2b_workorderid'],
        count: true,
        top: 1,
      });
      if (!result.success) {
        throw result.error ?? new Error('Failed to load batch work order counts');
      }
      return [batchId, result.count ?? result.data.length] as const;
    }),
  );
  return Object.fromEntries(entries);
}

export function useBatchWorkOrderCounts(batchIds: string[]) {
  return useQuery({
    queryKey: ['batchWorkOrderCounts', batchIds],
    queryFn: () => fetchBatchWorkOrderCounts(batchIds),
    enabled: batchIds.length > 0,
    staleTime: 30_000,
  });
}
