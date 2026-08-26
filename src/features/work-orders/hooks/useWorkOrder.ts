import { useQuery } from '@tanstack/react-query';
import { Cre2b_workordersService } from '../../../generated/services/Cre2b_workordersService';

async function fetchWorkOrder(id: string) {
  const result = await Cre2b_workordersService.get(id);
  if (!result.success) {
    throw result.error ?? new Error('Failed to load work order');
  }
  return result.data;
}

export function useWorkOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['workOrder', id],
    queryFn: () => fetchWorkOrder(id as string),
    enabled: Boolean(id),
  });
}
