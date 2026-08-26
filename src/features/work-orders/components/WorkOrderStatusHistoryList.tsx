import { makeStyles, tokens, Text, Badge } from '@fluentui/react-components';
import { NumberedSectionCard } from '../../../components/NumberedSectionCard';
import { LoadingState } from '../../../components/LoadingState';
import { EmptyState } from '../../../components/EmptyState';
import { useWorkOrderStatusHistory } from '../hooks/useWorkOrderStatusHistory';
import { resolveOptionLabelOrUndefined } from '../utils/optionSet';
import { describeHistoryEntry } from '../utils/describeHistoryEntry';
import { getFormattedValueAnnotation } from '../../../lib/odataAnnotation';
import {
  Cre2b_workorderstatushistoriescre2b_actiontype,
  Cre2b_workorderstatushistoriescre2b_fromstatus,
  Cre2b_workorderstatushistoriescre2b_tostatus,
} from '../../../generated/models/Cre2b_workorderstatushistoriesModel';

const useStyles = makeStyles({
  row: {
    display: 'flex',
    gap: '16px',
    padding: '12px 0',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  timestamp: {
    width: '170px',
    flexShrink: 0,
    color: tokens.colorNeutralForeground3,
    fontSize: '13px',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  transition: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground1,
    fontWeight: 600,
  },
  comment: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground2,
  },
  by: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
});

export function WorkOrderStatusHistoryList({ workOrderId }: { workOrderId: string }) {
  const styles = useStyles();
  const { data: history, isLoading } = useWorkOrderStatusHistory(workOrderId);

  return (
    <NumberedSectionCard number={4} title="Status History">
      {isLoading && <LoadingState label="Loading history…" />}
      {!isLoading && (!history || history.length === 0) && (
        <EmptyState message="No status history yet." />
      )}
      {!isLoading &&
        history?.map((entry) => {
          // cre2b_actiontypename / cre2b_fromstatusname / cre2b_tostatusname are
          // server-computed formatted-value annotations that can come back blank —
          // resolve from the raw numeric codes via the local option-set constants
          // first, the same pattern already fixed on the WorkOrder detail view.
          const actionType = resolveOptionLabelOrUndefined(
            Cre2b_workorderstatushistoriescre2b_actiontype,
            entry.cre2b_actiontype,
            entry.cre2b_actiontypename,
          );
          const fromStatus = resolveOptionLabelOrUndefined(
            Cre2b_workorderstatushistoriescre2b_fromstatus,
            entry.cre2b_fromstatus,
            entry.cre2b_fromstatusname,
          );
          const toStatus = resolveOptionLabelOrUndefined(
            Cre2b_workorderstatushistoriescre2b_tostatus,
            entry.cre2b_tostatus,
            entry.cre2b_tostatusname,
          );
          const isTransfer = actionType === 'Transfer' || actionType === 'Reassign';
          const description = describeHistoryEntry({
            actionType,
            fromStatus,
            toStatus,
            comment: entry.cre2b_comment,
          });
          // cre2b_changedat is a custom field not every write path populates —
          // createdon is Dataverse's own system field, guaranteed to be set on every
          // record by every app. The actor always comes from Dataverse's own createdby
          // lookup — confirmed via a raw JSON dump of an actual SDK response that the
          // generated model's `createdbyname` field is never actually populated at
          // runtime; the real display name lives under the raw OData annotation key
          // `_createdby_value@OData.Community.Display.V1.FormattedValue` instead.
          const changedAt = entry.cre2b_changedat || entry.createdon;
          const byName = getFormattedValueAnnotation(entry, '_createdby_value') || 'Unknown';

          return (
            <div key={entry.cre2b_workorderstatushistoryid} className={styles.row}>
              <Text className={styles.timestamp}>
                {changedAt ? new Date(changedAt).toLocaleString() : '—'}
              </Text>
              <div className={styles.content}>
                <div className={styles.badgeRow}>
                  <Badge appearance="tint" color={isTransfer ? 'brand' : 'informative'} size="small">
                    {actionType ?? 'Status Change'}
                  </Badge>
                </div>
                <Text className={styles.transition}>{description}</Text>
                {!isTransfer && entry.cre2b_comment && description !== entry.cre2b_comment && (
                  <Text className={styles.comment}>{entry.cre2b_comment}</Text>
                )}
                <Text className={styles.by}>by {byName}</Text>
              </div>
            </div>
          );
        })}
    </NumberedSectionCard>
  );
}
