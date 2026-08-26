import { useQuery } from '@tanstack/react-query';
import { Cre2b_personnelsService } from '../../../generated/services/Cre2b_personnelsService';
import type { Cre2b_personnels } from '../../../generated/models/Cre2b_personnelsModel';

async function fetchActivePersonnel(): Promise<Cre2b_personnels[]> {
  const result = await Cre2b_personnelsService.getAll({
    filter: "statecode eq 0 and (cre2b_role eq 200080000 or cre2b_role eq 200080001)",
    orderBy: ['cre2b_fullname asc'],
  });
  if (!result.success) {
    throw result.error ?? new Error('Failed to load personnel');
  }
  return result.data;
}

export function usePersonnelRoster() {
  return useQuery({
    queryKey: ['personnelRoster'],
    queryFn: fetchActivePersonnel,
    staleTime: 5 * 60_000,
  });
}
