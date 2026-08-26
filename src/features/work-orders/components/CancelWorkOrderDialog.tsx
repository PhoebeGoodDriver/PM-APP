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
import { DismissCircleRegular } from '@fluentui/react-icons';
import { useCancelWorkOrder, CancelPartialFailureError } from '../hooks/useCancelWorkOrder';
import type { Cre2b_workorderscre2b_status } from '../../../generated/models/Cre2b_workordersModel';

export function CancelWorkOrderDialog({
  workOrderId,
  currentStatus,
}: {
  workOrderId: string;
  currentStatus: Cre2b_workorderscre2b_status;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const cancelWorkOrder = useCancelWorkOrder(workOrderId);

  const isPartialFailure = cancelWorkOrder.error instanceof CancelPartialFailureError;

  function closeDialog() {
    setOpen(false);
    setReason('');
    cancelWorkOrder.reset();
  }

  function handleConfirm() {
    if (!reason.trim()) return;
    cancelWorkOrder.mutate(
      { workOrderId, currentStatus, reason: reason.trim() },
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
        <Button icon={<DismissCircleRegular />}>Cancel Work Order</Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Cancel Work Order</DialogTitle>
          <DialogContent>
            <Field label="Reason" required>
              <Textarea
                value={reason}
                onChange={(_, data) => setReason(data.value)}
                placeholder="Why is this work order being canceled?"
                rows={3}
              />
            </Field>

            {cancelWorkOrder.isError && (
              <MessageBar
                intent={isPartialFailure ? 'warning' : 'error'}
                style={{ marginTop: '12px' }}
              >
                <MessageBarBody>{cancelWorkOrder.error.message}</MessageBarBody>
              </MessageBar>
            )}
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={closeDialog}>
              {isPartialFailure ? 'Close' : 'Back'}
            </Button>
            {!isPartialFailure && (
              <Button
                appearance="primary"
                disabled={!reason.trim() || cancelWorkOrder.isPending}
                onClick={handleConfirm}
              >
                {cancelWorkOrder.isPending ? 'Canceling…' : 'Confirm Cancellation'}
              </Button>
            )}
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
