import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createWorkOrder } from '../../work-orders/hooks/useCreateWorkOrder';
import type { CreateWorkOrderInput } from '../../work-orders/hooks/useCreateWorkOrder';
import { Cre2b_workorderbatchsService } from '../../../generated/services/Cre2b_workorderbatchsService';

export interface BulkCreateResult {
  rowNumber: number;
  success: boolean;
  wonumber?: string;
  error?: string;
}

export interface CreatedBatch {
  id: string;
  number: string;
}

export function useBulkCreateWorkOrders() {
  const queryClient = useQueryClient();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [results, setResults] = useState<BulkCreateResult[]>([]);
  const [batch, setBatch] = useState<CreatedBatch | null>(null);

  const run = useCallback(
    async (rows: { rowNumber: number; input: CreateWorkOrderInput }[], createdBy?: string) => {
      setIsRunning(true);
      setResults([]);
      setBatch(null);
      setProgress({ done: 0, total: rows.length });

      // One Batch record per upload run — every row in this run binds to it. If the batch
      // itself fails to create, bail out entirely rather than falling back to ungrouped rows.
      const batchResult = await Cre2b_workorderbatchsService.create({ statecode: 0 });
      if (!batchResult.success) {
        const message = batchResult.error?.message ?? 'Failed to create batch record';
        const failed: BulkCreateResult[] = rows.map((row) => ({
          rowNumber: row.rowNumber,
          success: false,
          error: `Batch creation failed: ${message}`,
        }));
        setResults(failed);
        setIsRunning(false);
        return failed;
      }

      const batchId = batchResult.data.cre2b_workorderbatchid;
      setBatch({ id: batchId, number: batchResult.data.cre2b_batchnumber ?? '' });

      const collected: BulkCreateResult[] = [];
      for (const row of rows) {
        try {
          const workOrder = await createWorkOrder({ ...row.input, createdBy, batchId });
          collected.push({ rowNumber: row.rowNumber, success: true, wonumber: workOrder.cre2b_wonumber });
        } catch (error) {
          collected.push({
            rowNumber: row.rowNumber,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
        setProgress((p) => ({ ...p, done: p.done + 1 }));
        setResults([...collected]);
      }

      setIsRunning(false);
      queryClient.invalidateQueries({ queryKey: ['workOrderStatusCounts'] });
      queryClient.invalidateQueries({ queryKey: ['projectNames'] });
      queryClient.invalidateQueries({ queryKey: ['batchList'] });
      return collected;
    },
    [queryClient],
  );

  return { run, isRunning, progress, results, batch };
}
