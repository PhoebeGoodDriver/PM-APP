import {
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Badge,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import type { ValidatedRow } from '../utils/validateWorkOrderRows';

const useStyles = makeStyles({
  wrapper: {
    overflowX: 'auto',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: '8px',
  },
  errorRow: {
    backgroundColor: 'rgba(196, 49, 75, 0.05)',
  },
  errorText: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: '12px',
  },
});

export function ValidationPreviewTable({ rows }: { rows: ValidatedRow[] }) {
  const styles = useStyles();

  return (
    <div className={styles.wrapper}>
      <Table size="small">
        <TableHeader>
          <TableRow>
            <TableHeaderCell>Row</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Service Center</TableHeaderCell>
            <TableHeaderCell>Assigned To</TableHeaderCell>
            <TableHeaderCell>Problem Description</TableHeaderCell>
            <TableHeaderCell>Issues</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.rowNumber} className={row.errors.length > 0 ? styles.errorRow : undefined}>
              <TableCell>{row.rowNumber}</TableCell>
              <TableCell>
                {row.errors.length === 0 ? (
                  <Badge color="success" appearance="filled">
                    Valid
                  </Badge>
                ) : (
                  <Badge color="danger" appearance="filled">
                    Error
                  </Badge>
                )}
              </TableCell>
              <TableCell>{String(row.raw.ServiceCenterAlphaCode ?? '')}</TableCell>
              <TableCell>
                {row.assignedDisplayName ?? String(row.raw.AssignedToPersonnelName ?? '')}
                {row.assignmentMethod === 'pool' && (
                  <Badge appearance="tint" color="brand" size="small" style={{ marginLeft: '6px' }}>
                    auto
                  </Badge>
                )}
              </TableCell>
              <TableCell>{String(row.raw.ProblemDescription ?? '')}</TableCell>
              <TableCell>
                {row.errors.map((err) => (
                  <div key={err} className={styles.errorText}>
                    {err}
                  </div>
                ))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
