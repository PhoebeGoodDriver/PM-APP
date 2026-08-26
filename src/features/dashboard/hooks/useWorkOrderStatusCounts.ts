import { useQuery } from '@tanstack/react-query';
import { Cre2b_workordersService } from '../../../generated/services/Cre2b_workordersService';
import { Cre2b_workorderscre2b_status } from '../../../generated/models/Cre2b_workordersModel';

export interface StatusCount {
  code: number;
  label: string;
  count: number;
}

async function fetchStatusCounts(): Promise<StatusCount[]> {
  const codes = Object.keys(Cre2b_workorderscre2b_status).map(Number);
  const counts = await Promise.all(
    codes.map(async (code) => {
      const result = await Cre2b_workordersService.getAll({
        filter: `statecode eq 0 and cre2b_status eq ${code}`,
        select: ['cre2b_workorderid'],
        count: true,
        top: 1,
      });
      if (!result.success) {
        throw result.error ?? new Error('Failed to load work order status counts');
      }
      return {
        code,
        label: Cre2b_workorderscre2b_status[code as keyof typeof Cre2b_workorderscre2b_status],
        count: result.count ?? result.data.length,
      };
    }),
  );
  return counts;
}

export function useWorkOrderStatusCounts() {
  return useQuery({
    queryKey: ['workOrderStatusCounts'],
    queryFn: fetchStatusCounts,
    staleTime: 30_000,
  });
}
