import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { useBatchList } from '../features/batches/hooks/useBatchList';
import { useBatchWorkOrderCounts } from '../features/batches/hooks/useBatchWorkOrderCounts';
import { getFormattedValueAnnotation } from '../lib/odataAnnotation';

const useStyles = makeStyles({
  wrapper: {
    overflowX: 'auto',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: '8px',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  batchLink: {
    color: '#4B2E83',
    fontWeight: 600,
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline',
    },
  },
});

export function BatchesPage() {
  const styles = useStyles();
  const { data: batches, isLoading, isError } = useBatchList();
  const batchIds = useMemo(() => (batches ?? []).map((b) => b.cre2b_workorderbatchid), [batches]);
  const { data: counts } = useBatchWorkOrderCounts(batchIds);

  return (
    <div>
      <PageHeader title="Batches" subtitle="Work orders grouped by batch upload run" />

      {isLoading && <LoadingState label="Loading batches…" />}
      {isError && <EmptyState message="Could not load batches." />}
      {batches && batches.length === 0 && <EmptyState message="No batches yet." />}
      {batches && batches.length > 0 && (
        <div className={styles.wrapper}>
          <Table size="small">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Batch Number</TableHeaderCell>
                <TableHeaderCell>Created By</TableHeaderCell>
                <TableHeaderCell>Created On</TableHeaderCell>
                <TableHeaderCell>Work Order Count</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((batch) => (
                <TableRow key={batch.cre2b_workorderbatchid}>
                  <TableCell>
                    <RouterLink
                      className={styles.batchLink}
                      to={`/batches/${batch.cre2b_workorderbatchid}`}
                    >
                      {batch.cre2b_batchnumber}
                    </RouterLink>
                  </TableCell>
                  <TableCell>
                    {getFormattedValueAnnotation(batch, '_createdby_value') || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    {batch.createdon ? new Date(batch.createdon).toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell>{counts?.[batch.cre2b_workorderbatchid] ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
