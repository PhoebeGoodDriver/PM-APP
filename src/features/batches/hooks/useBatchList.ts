import { useQuery } from '@tanstack/react-query';
import { Cre2b_workorderbatchsService } from '../../../generated/services/Cre2b_workorderbatchsService';

async function fetchBatches() {
  const result = await Cre2b_workorderbatchsService.getAll({
    filter: 'statecode eq 0',
    orderBy: ['createdon desc'],
  });
  if (!result.success) {
    throw result.error ?? new Error('Failed to load batches');
  }
  return result.data;
}

export function useBatchList() {
  return useQuery({
    queryKey: ['batchList'],
    queryFn: fetchBatches,
    staleTime: 30_000,
  });
}
