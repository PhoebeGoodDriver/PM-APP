import { Cre2b_workordersService } from '../../../generated/services/Cre2b_workordersService';

const PREFIX = 'WO-';
const PAD_LENGTH = 7;

export async function generateNextWorkOrderNumber(): Promise<string> {
  const result = await Cre2b_workordersService.getAll({
    select: ['cre2b_wonumber'],
    orderBy: ['cre2b_wonumber desc'],
    top: 1,
  });
  if (!result.success) {
    throw result.error ?? new Error('Failed to determine next WO number');
  }

  const latest = result.data[0]?.cre2b_wonumber;
  const latestNumber = latest?.startsWith(PREFIX)
    ? parseInt(latest.slice(PREFIX.length), 10)
    : 0;
  const nextNumber = Number.isFinite(latestNumber) ? latestNumber + 1 : 1;
  return `${PREFIX}${String(nextNumber).padStart(PAD_LENGTH, '0')}`;
}
