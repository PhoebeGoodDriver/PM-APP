import type { Cre2b_servicecenters } from '../../../generated/models/Cre2b_servicecentersModel';

/**
 * cre2b_locationname is a market/metro label (e.g. "Atlanta") that can differ from the
 * service center's actual city (e.g. "Conley") — confirmed against real data, so it isn't
 * specific enough on its own to identify a service center. Alpha code + city/state is what
 * ServiceCenterTypeahead already uses to disambiguate centers when creating a work order;
 * this reuses that same format everywhere else a service center name renders.
 */
export function formatServiceCenterName(
  sc: Pick<Cre2b_servicecenters, 'cre2b_locationalphacode' | 'cre2b_locationname' | 'cre2b_city' | 'cre2b_state'>,
): string {
  const code = sc.cre2b_locationalphacode ?? sc.cre2b_locationname;
  const cityState = [sc.cre2b_city, sc.cre2b_state].filter(Boolean).join(', ');
  return cityState ? `${code} — ${cityState}` : code;
}

export function buildServiceCenterNameMap(
  serviceCenters: Cre2b_servicecenters[] | undefined,
): Record<string, string> {
  const map: Record<string, string> = {};
  (serviceCenters ?? []).forEach((sc) => {
    map[sc.cre2b_servicecenterid] = formatServiceCenterName(sc);
  });
  return map;
}
