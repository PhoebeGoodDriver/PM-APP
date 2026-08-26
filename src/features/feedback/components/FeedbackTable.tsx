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
import type { Cre2b_feedbacks } from '../../../generated/models/Cre2b_feedbacksModel';

const useStyles = makeStyles({
  wrapper: {
    overflowX: 'auto',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: '8px',
    backgroundColor: tokens.colorNeutralBackground1,
  },
});

export function FeedbackTable({ feedback }: { feedback: Cre2b_feedbacks[] }) {
  const styles = useStyles();
  return (
    <div className={styles.wrapper}>
      <Table size="small">
        <TableHeader>
          <TableRow>
            <TableHeaderCell>Submitted At</TableHeaderCell>
            <TableHeaderCell>Submitted By</TableHeaderCell>
            <TableHeaderCell>Feedback</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feedback.map((f) => (
            <TableRow key={f.cre2b_feedbackid}>
              <TableCell>
                {f.cre2b_submittedat ? new Date(f.cre2b_submittedat).toLocaleString() : '—'}
              </TableCell>
              <TableCell>{f.cre2b_submittedby || '—'}</TableCell>
              <TableCell>{f.cre2b_feedbacktext || '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
