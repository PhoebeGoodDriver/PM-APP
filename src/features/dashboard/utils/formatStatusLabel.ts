const OVERRIDES: Record<string, string> = {
  OnSite: 'On Site',
  ReturnVisit: 'Return Visit',
  'Closed-Completed': 'Closed – Completed',
  'Closed-Canceled': 'Closed – Canceled',
};

export function formatStatusLabel(label: string): string {
  return OVERRIDES[label] ?? label;
}
