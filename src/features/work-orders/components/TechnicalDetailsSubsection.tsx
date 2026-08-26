import { useState } from 'react';
import { Field, Input, Button, makeStyles, tokens } from '@fluentui/react-components';
import { ChevronDownRegular, ChevronRightRegular } from '@fluentui/react-icons';
import { useFormContext } from 'react-hook-form';
import type { CreateWorkOrderFormValues } from './CreateWorkOrderForm';

const useStyles = makeStyles({
  toggle: {
    marginBottom: '12px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    paddingTop: '4px',
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
});

export function TechnicalDetailsSubsection() {
  const styles = useStyles();
  const { register } = useFormContext<CreateWorkOrderFormValues>();
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <Button
        className={styles.toggle}
        appearance="subtle"
        size="small"
        icon={expanded ? <ChevronDownRegular /> : <ChevronRightRegular />}
        onClick={() => setExpanded((v) => !v)}
      >
        Technical Details (optional)
      </Button>
      {expanded && (
        <div className={styles.grid}>
          <Field label="Network Detail">
            <Input {...register('networkdetail')} placeholder="IP, host name, etc." />
          </Field>
          <Field label="Circuit Details">
            <Input {...register('circuitdetails')} />
          </Field>
          <Field label="Computer/Host Name">
            <Input {...register('computerhostname')} />
          </Field>
        </div>
      )}
    </div>
  );
}
