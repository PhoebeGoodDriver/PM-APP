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
  Input,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components';
import { EditRegular } from '@fluentui/react-icons';
import {
  useUpdateTrackingNumber,
  UpdateTrackingNumberPartialFailureError,
} from '../hooks/useUpdateTrackingNumber';

export function EditTrackingNumberDialog({
  workOrderId,
  currentValue,
}: {
  workOrderId: string;
  currentValue: string | undefined;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(currentValue ?? '');
  const updateTrackingNumber = useUpdateTrackingNumber(workOrderId);

  const isPartialFailure =
    updateTrackingNumber.error instanceof UpdateTrackingNumberPartialFailureError;
  const actionLabel = currentValue ? 'Edit' : 'Add';

  function closeDialog() {
    setOpen(false);
    setValue(currentValue ?? '');
    updateTrackingNumber.reset();
  }

  function handleConfirm() {
    const trimmed = value.trim();
    if (trimmed === (currentValue ?? '')) return;
    updateTrackingNumber.mutate(
      { workOrderId, previousValue: currentValue, newValue: trimmed },
      { onSuccess: closeDialog },
    );
  }

  const isUnchanged = value.trim() === (currentValue ?? '');

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
        <Button appearance="subtle" size="small" icon={<EditRegular />}>
          {actionLabel} Tracking Number
        </Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{actionLabel} Tracking Number</DialogTitle>
          <DialogContent>
            <Field label="Tracking Number">
              <Input value={value} onChange={(_, data) => setValue(data.value)} />
            </Field>

            {updateTrackingNumber.isError && (
              <MessageBar
                intent={isPartialFailure ? 'warning' : 'error'}
                style={{ marginTop: '12px' }}
              >
                <MessageBarBody>{updateTrackingNumber.error.message}</MessageBarBody>
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
                disabled={isUnchanged || updateTrackingNumber.isPending}
                onClick={handleConfirm}
              >
                {updateTrackingNumber.isPending ? 'Saving…' : 'Save'}
              </Button>
            )}
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
