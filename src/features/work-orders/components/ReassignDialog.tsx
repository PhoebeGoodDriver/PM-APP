import { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
  Button,
  Field,
  Textarea,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components';
import { ArrowSwapRegular } from '@fluentui/react-icons';
import { PersonnelFallbackPicker } from '../../personnel/components/PersonnelFallbackPicker';
import { usePersonnelRoster } from '../../personnel/hooks/usePersonnelRoster';
import { useReassignWorkOrder, ReassignPartialFailureError } from '../hooks/useReassignWorkOrder';

export function ReassignDialog({
  workOrderId,
  currentAssigneeId,
  currentAssigneeName,
}: {
  workOrderId: string;
  currentAssigneeId: string;
  currentAssigneeName: string;
}) {
  const [open, setOpen] = useState(false);
  const [newAssigneeId, setNewAssigneeId] = useState('');
  const [reason, setReason] = useState('');
  const { data: roster } = usePersonnelRoster();
  const reassign = useReassignWorkOrder(workOrderId);

  const isPartialFailure = reassign.error instanceof ReassignPartialFailureError;

  function closeDialog() {
    setOpen(false);
    setNewAssigneeId('');
    setReason('');
    reassign.reset();
  }

  function handleConfirm() {
    const newAssignee = roster?.find((p) => p.cre2b_personnelid === newAssigneeId);
    if (!newAssignee) return;
    reassign.mutate(
      {
        workOrderId,
        previousAssigneeName: currentAssigneeName,
        newAssigneeId,
        newAssigneeName: newAssignee.cre2b_fullname ?? 'Unknown',
        reason: reason.trim() || undefined,
      },
      { onSuccess: closeDialog },
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(_, data) => {
        if (data.open) {
          setOpen(true);
        } else {
          closeDialog();
        }
      }}
    >
      <DialogTrigger disableButtonEnhancement>
        <Button icon={<ArrowSwapRegular />}>Reassign</Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Reassign Work Order</DialogTitle>
          <DialogContent>
            <Field label="Currently assigned to">{currentAssigneeName || 'Unassigned'}</Field>
            <PersonnelFallbackPicker selectedId={newAssigneeId} onSelect={setNewAssigneeId} />
            <Field label="Reason (optional)" style={{ marginTop: '12px' }}>
              <Textarea
                value={reason}
                onChange={(_, data) => setReason(data.value)}
                placeholder="Why is this work order being reassigned?"
                rows={3}
              />
            </Field>

            {reassign.isError && (
              <MessageBar intent={isPartialFailure ? 'warning' : 'error'} style={{ marginTop: '12px' }}>
                <MessageBarBody>{reassign.error.message}</MessageBarBody>
              </MessageBar>
            )}
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={closeDialog}>
              {isPartialFailure ? 'Close' : 'Cancel'}
            </Button>
            {!isPartialFailure && (
              <Button
                appearance="primary"
                disabled={!newAssigneeId || newAssigneeId === currentAssigneeId || reassign.isPending}
                onClick={handleConfirm}
              >
                {reassign.isPending ? 'Transferring…' : 'Confirm Transfer'}
              </Button>
            )}
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
