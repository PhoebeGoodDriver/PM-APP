import { useQuery } from '@tanstack/react-query';
import { Cre2b_servicecentersService } from '../../../generated/services/Cre2b_servicecentersService';
import type { Cre2b_servicecenters } from '../../../generated/models/Cre2b_servicecentersModel';

async function fetchActiveServiceCenters(): Promise<Cre2b_servicecenters[]> {
  const result = await Cre2b_servicecentersService.getAll({
    filter: 'statecode eq 0',
    orderBy: ['cre2b_locationalphacode asc'],
  });
  if (!result.success) {
    throw result.error ?? new Error('Failed to load service centers');
  }
  return result.data;
}

export function useServiceCenterList() {
  return useQuery({
    queryKey: ['serviceCenters'],
    queryFn: fetchActiveServiceCenters,
    staleTime: 5 * 60_000,
  });
}
