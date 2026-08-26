import { useQuery } from '@tanstack/react-query';
import { Cre2b_servicecenterproximitiesService } from '../../../generated/services/Cre2b_servicecenterproximitiesService';
import type { Cre2b_servicecenterproximities } from '../../../generated/models/Cre2b_servicecenterproximitiesModel';

async function fetchProximity(
  serviceCenterId: string,
): Promise<Cre2b_servicecenterproximities | null> {
  const result = await Cre2b_servicecenterproximitiesService.getAll({
    filter: `_cre2b_servicecenterlookup_value eq ${serviceCenterId}`,
    top: 1,
  });
  if (!result.success) {
    throw result.error ?? new Error('Failed to load service center proximity');
  }
  return result.data[0] ?? null;
}

export function useServiceCenterProximity(serviceCenterId: string | undefined) {
  return useQuery({
    queryKey: ['serviceCenterProximity', serviceCenterId],
    queryFn: () => fetchProximity(serviceCenterId as string),
    enabled: Boolean(serviceCenterId),
    staleTime: 5 * 60_000,
  });
}

async function fetchAllProximities(): Promise<Cre2b_servicecenterproximities[]> {
  const result = await Cre2b_servicecenterproximitiesService.getAll({});
  if (!result.success) {
    throw result.error ?? new Error('Failed to load service center proximity data');
  }
  return result.data;
}

/**
 * Fetches every ServiceCenterProximity row in one shot, for callers (like Batch Upload
 * validation) that need to rank personnel for many different service centers at once rather
 * than one at a time via useServiceCenterProximity.
 */
export function useServiceCenterProximityList() {
  return useQuery({
    queryKey: ['serviceCenterProximityList'],
    queryFn: fetchAllProximities,
    staleTime: 5 * 60_000,
  });
}

export interface RankedPersonnelEntry {
  personnelId: string;
  name: string;
  distance: number | undefined;
}

/**
 * `personnelNames` resolves each entry's display name client-side from the already-cached
 * Personnel roster (keyed by cre2b_personnelid), falling back to the ServiceCenterProximity
 * record's own `...name` formatted-value annotation. This guards against that annotation
 * being blank on some pre-existing proximity rows while the raw lookup id is still present.
 */
export function getRankedPersonnel(
  proximity: Cre2b_servicecenterproximities | null | undefined,
  pool: 'TSR Only' | 'TSR + Advisor',
  personnelNames: Record<string, string> = {},
): RankedPersonnelEntry[] {
  if (!proximity) return [];

  const resolve = (id: string | undefined, serverName: string | undefined) =>
    (id && personnelNames[id]) || serverName || '';

  if (pool === 'TSR Only') {
    return [
      {
        personnelId: proximity._cre2b_closesttsr1tsronly_value ?? '',
        name: resolve(proximity._cre2b_closesttsr1tsronly_value, proximity.cre2b_closesttsr1tsronlyname),
        distance: proximity.cre2b_distancetotsr1,
      },
      {
        personnelId: proximity._cre2b_closesttsr2tsronly_value ?? '',
        name: resolve(proximity._cre2b_closesttsr2tsronly_value, proximity.cre2b_closesttsr2tsronlyname),
        distance: proximity.cre2b_distancetotsr2,
      },
      {
        personnelId: proximity._cre2b_closesttsr3tsronly_value ?? '',
        name: resolve(proximity._cre2b_closesttsr3tsronly_value, proximity.cre2b_closesttsr3tsronlyname),
        distance: proximity.cre2b_distancetotsr3,
      },
    ].filter((entry) => entry.personnelId);
  }

  return [
    {
      personnelId: proximity._cre2b_closest1tsradvisor_value ?? '',
      name: resolve(proximity._cre2b_closest1tsradvisor_value, proximity.cre2b_closest1tsradvisorname),
      distance: proximity.cre2b_distancetoclosesttsroradvisor1,
    },
    {
      personnelId: proximity._cre2b_closest2tsradvisor_value ?? '',
      name: resolve(proximity._cre2b_closest2tsradvisor_value, proximity.cre2b_closest2tsradvisorname),
      distance: proximity.cre2b_distancetoclosesttsroradvisor2,
    },
    {
      personnelId: proximity._cre2b_closest3tsradvisor_value ?? '',
      name: resolve(proximity._cre2b_closest3tsradvisor_value, proximity.cre2b_closest3tsradvisorname),
      distance: proximity.cre2b_distancetoclosesttsroradvisor3,
    },
  ].filter((entry) => entry.personnelId);
}
