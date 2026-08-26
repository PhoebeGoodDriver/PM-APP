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
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components';
import { DatePicker } from '@fluentui/react-datepicker-compat';
import { CalendarEditRegular } from '@fluentui/react-icons';
import {
  useUpdateExpirationDate,
  UpdateExpirationDatePartialFailureError,
} from '../hooks/useUpdateExpirationDate';

function toDateOrNull(iso: string | undefined): Date | null {
  return iso ? new Date(iso) : null;
}

export function EditExpirationDateDialog({
  workOrderId,
  currentExpirationDate,
}: {
  workOrderId: string;
  currentExpirationDate: string | undefined;
}) {
  const [open, setOpen] = useState(false);
  const [newDate, setNewDate] = useState<Date | null>(toDateOrNull(currentExpirationDate));
  const updateExpirationDate = useUpdateExpirationDate(workOrderId);

  const isPartialFailure =
    updateExpirationDate.error instanceof UpdateExpirationDatePartialFailureError;

  function closeDialog() {
    setOpen(false);
    setNewDate(toDateOrNull(currentExpirationDate));
    updateExpirationDate.reset();
  }

  function handleConfirm() {
    if (!newDate) return;
    updateExpirationDate.mutate(
      { workOrderId, previousDate: currentExpirationDate, newDate: newDate.toISOString() },
      { onSuccess: closeDialog },
    );
  }

  const isUnchanged =
    !newDate ||
    (currentExpirationDate != null &&
      newDate.toDateString() === new Date(currentExpirationDate).toDateString());

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
        <Button icon={<CalendarEditRegular />}>Edit Expiration Date</Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Edit Expiration Date</DialogTitle>
          <DialogContent>
            <Field label="Expiration Date">
              <DatePicker value={newDate} onSelectDate={(date) => setNewDate(date ?? null)} />
            </Field>

            {updateExpirationDate.isError && (
              <MessageBar
                intent={isPartialFailure ? 'warning' : 'error'}
                style={{ marginTop: '12px' }}
              >
                <MessageBarBody>{updateExpirationDate.error.message}</MessageBarBody>
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
                disabled={isUnchanged || updateExpirationDate.isPending}
                onClick={handleConfirm}
              >
                {updateExpirationDate.isPending ? 'Saving…' : 'Save'}
              </Button>
            )}
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
