import { useQuery } from '@tanstack/react-query';
import { Cre2b_workorderbatchsService } from '../../../generated/services/Cre2b_workorderbatchsService';

async function fetchBatch(id: string) {
  const result = await Cre2b_workorderbatchsService.get(id);
  if (!result.success) {
    throw result.error ?? new Error('Failed to load batch');
  }
  return result.data;
}

export function useBatch(id: string | undefined) {
  return useQuery({
    queryKey: ['batch', id],
    queryFn: () => fetchBatch(id as string),
    enabled: Boolean(id),
  });
}
