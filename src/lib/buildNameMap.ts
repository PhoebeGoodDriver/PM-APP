/**
 * Builds an id -> display-name lookup from a fetched list. Used to resolve lookup/relationship
 * fields client-side from an already-cached reference list, rather than relying solely on the
 * server-returned `...name` formatted-value annotation (which can lag briefly right after a
 * related record is created, or be absent for other reasons outside our control).
 */
export function buildNameMap<T>(
  list: T[] | undefined,
  idKey: keyof T,
  nameKey: keyof T,
): Record<string, string> {
  const map: Record<string, string> = {};
  (list ?? []).forEach((item) => {
    const id = item[idKey] as unknown as string | undefined;
    const name = item[nameKey] as unknown as string | undefined;
    if (id) map[id] = name ?? '';
  });
  return map;
}

export function resolveName(
  map: Record<string, string>,
  id: string | undefined,
  serverName: string | undefined,
): string {
  if (id && map[id]) return map[id];
  return serverName || '—';
}
