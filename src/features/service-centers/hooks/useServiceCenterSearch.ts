import { useMemo } from 'react';
import { useServiceCenterList } from './useServiceCenterList';
import type { Cre2b_servicecenters } from '../../../generated/models/Cre2b_servicecentersModel';

export function useServiceCenterSearch(query: string): {
  results: Cre2b_servicecenters[];
  isLoading: boolean;
} {
  const { data, isLoading } = useServiceCenterList();

  const results = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data.slice(0, 25);
    return data
      .filter((sc) => {
        const alpha = sc.cre2b_locationalphacode?.toLowerCase() ?? '';
        const city = sc.cre2b_city?.toLowerCase() ?? '';
        const state = sc.cre2b_state?.toLowerCase() ?? '';
        const name = sc.cre2b_locationname?.toLowerCase() ?? '';
        return alpha.includes(q) || city.includes(q) || state.includes(q) || name.includes(q);
      })
      .slice(0, 25);
  }, [data, query]);

  return { results, isLoading };
}
