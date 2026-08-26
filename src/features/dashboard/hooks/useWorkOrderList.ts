import { useQuery } from '@tanstack/react-query';
import { Cre2b_workordersService } from '../../../generated/services/Cre2b_workordersService';

async function fetchWorkOrders() {
  const result = await Cre2b_workordersService.getAll({
    filter: 'statecode eq 0',
    orderBy: ['createdon desc'],
  });
  if (!result.success) {
    throw result.error ?? new Error('Failed to load work orders');
  }
  return result.data;
}

export function useWorkOrderList() {
  return useQuery({
    queryKey: ['workOrderList'],
    queryFn: fetchWorkOrders,
    staleTime: 30_000,
  });
}
