export interface ColumnDef {
  key: string;
  required: boolean;
  example: string;
  helpText?: string;
}

export const WORK_ORDER_COLUMNS: ColumnDef[] = [
  { key: 'ServiceCenterAlphaCode', required: true, example: 'ATL' },
  { key: 'WOType', required: true, example: 'Planned' },
  { key: 'ProductType', required: true, example: 'Laptop' },
  { key: 'ProblemType', required: true, example: 'Hardware' },
  { key: 'ProblemDescription', required: true, example: 'Screen not turning on' },
  { key: 'ProblemDetails', required: false, example: '' },
  { key: 'ProductPartNumbersComments', required: false, example: '' },
  { key: 'RoomArea', required: false, example: '' },
  { key: 'TrackingNumber', required: false, example: '' },
  { key: 'NetworkDetail', required: false, example: '' },
  { key: 'CircuitDetails', required: false, example: '' },
  { key: 'ComputerHostName', required: false, example: '' },
  { key: 'ReferenceLink', required: false, example: '' },
  { key: 'ExpirationDate', required: true, example: '2026-09-30' },
  { key: 'ProjectName', required: false, example: '' },
  {
    key: 'AssignPool',
    required: false,
    example: 'TSR Only',
    helpText:
      'TSR Only or TSR + Advisor. Leave AssignedToPersonnelName blank to auto-assign the closest match from this pool.',
  },
  {
    key: 'AssignedToPersonnelName',
    required: false,
    example: 'Jane Smith',
    helpText:
      'Optional. Fill in to assign a specific person directly. Leave blank and set AssignPool instead to auto-assign the closest match. At least one of AssignPool / AssignedToPersonnelName is required.',
  },
];

/**
 * Two example rows so the template demonstrates both supported patterns: an explicit
 * manual assignment, and a blank name relying on AssignPool to auto-assign the closest match.
 */
export function buildTemplateWorkbookRows(): Record<string, string>[] {
  const manualRow: Record<string, string> = {};
  const poolRow: Record<string, string> = {};
  WORK_ORDER_COLUMNS.forEach((c) => {
    manualRow[c.key] = c.example;
    poolRow[c.key] = c.example;
  });
  poolRow.ProblemDescription = "Won't connect to network";
  poolRow.AssignedToPersonnelName = '';
  poolRow.AssignPool = 'TSR Only';
  manualRow.AssignPool = '';
  return [manualRow, poolRow];
}
