export interface OptionSetEntry<TValue extends number> {
  value: TValue;
  label: string;
}

export function optionSetEntries<TValue extends number>(
  optionSet: Record<number, string>,
): OptionSetEntry<TValue>[] {
  return Object.entries(optionSet).map(([code, label]) => ({
    value: Number(code) as TValue,
    label,
  }));
}

/**
 * Resolves an option-set numeric code to its label using the local generated constant,
 * rather than relying solely on the server-returned `...name` formatted-value annotation
 * (which can lag briefly after a record is first created). Falls back to `serverLabel`
 * (the `...name` field from the fetched record) if the code isn't in the local map, and
 * to '—' if neither is available.
 */
export function resolveOptionLabel(
  optionSet: Record<number, string>,
  code: number | undefined,
  serverLabel: string | undefined,
): string {
  if (code != null && optionSet[code]) return optionSet[code];
  return serverLabel || '—';
}

/**
 * Same resolution order as resolveOptionLabel, but returns undefined (instead of '—')
 * when neither source resolves — for callers embedding the label in a sentence, where a
 * literal em-dash would look wrong, and for genuinely optional fields (e.g. a history
 * row's From Status, which legitimately has no value on a Transfer or first-ever entry).
 */
export function resolveOptionLabelOrUndefined(
  optionSet: Record<number, string>,
  code: number | undefined,
  serverLabel: string | undefined,
): string | undefined {
  if (code != null && optionSet[code]) return optionSet[code];
  return serverLabel || undefined;
}
