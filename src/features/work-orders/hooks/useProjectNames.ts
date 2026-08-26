import { useQuery } from '@tanstack/react-query';
import { Cre2b_workordersService } from '../../../generated/services/Cre2b_workordersService';

async function fetchProjectNames(): Promise<string[]> {
  const result = await Cre2b_workordersService.getAll({
    select: ['cre2b_projectname'],
    filter: 'cre2b_projectname ne null',
  });
  if (!result.success) {
    throw result.error ?? new Error('Failed to load project names');
  }
  const names = result.data
    .map((wo) => wo.cre2b_projectname?.trim())
    .filter((name): name is string => Boolean(name));
  return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
}

export function useProjectNames() {
  return useQuery({
    queryKey: ['projectNames'],
    queryFn: fetchProjectNames,
    staleTime: 60_000,
  });
}
