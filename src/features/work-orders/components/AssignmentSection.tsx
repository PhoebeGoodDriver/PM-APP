import { useEffect, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { RadioGroup, Radio, Switch, Text, makeStyles, tokens } from '@fluentui/react-components';
import { NumberedSectionCard } from '../../../components/NumberedSectionCard';
import { PersonnelFallbackPicker } from '../../personnel/components/PersonnelFallbackPicker';
import { usePersonnelRoster } from '../../personnel/hooks/usePersonnelRoster';
import { buildNameMap } from '../../../lib/buildNameMap';
import {
  useServiceCenterProximity,
  getRankedPersonnel,
} from '../../service-centers/hooks/useServiceCenterProximity';
import type { CreateWorkOrderFormValues } from './CreateWorkOrderForm';

const useStyles = makeStyles({
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
  },
  rankedItem: {
    display: 'inline',
  },
  distance: {
    color: tokens.colorNeutralForeground3,
    fontSize: '12px',
  },
  divider: {
    margin: '20px 0',
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  empty: {
    color: tokens.colorNeutralForeground3,
    fontSize: '13px',
  },
});

export function AssignmentSection({ serviceCenterId }: { serviceCenterId: string | null }) {
  const styles = useStyles();
  const { control, watch, setValue } = useFormContext<CreateWorkOrderFormValues>();
  const { data: proximity, isLoading } = useServiceCenterProximity(serviceCenterId ?? undefined);
  const { data: roster } = usePersonnelRoster();
  const personnelNames = useMemo(
    () => buildNameMap(roster, 'cre2b_personnelid', 'cre2b_fullname'),
    [roster],
  );
  const assignpool = watch('assignpool');
  const pool = assignpool === 200080001 ? 'TSR + Advisor' : 'TSR Only';
  const ranked = getRankedPersonnel(proximity, pool, personnelNames);

  useEffect(() => {
    if (ranked.length > 0) {
      setValue('assignedToPersonnelId', ranked[0].personnelId);
    }
    // Re-rank and default to the new closest match whenever the pool toggle changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignpool, proximity]);

  if (!serviceCenterId) {
    return (
      <NumberedSectionCard number={3} title="Assignment">
        <Text className={styles.empty}>Select a service center first to see ranked technicians.</Text>
      </NumberedSectionCard>
    );
  }

  return (
    <NumberedSectionCard number={3} title="Assignment">
      <div className={styles.toggleRow}>
        <Text>TSR only</Text>
        <Switch
          checked={assignpool === 200080001}
          onChange={(_, data) => setValue('assignpool', data.checked ? 200080001 : 200080000)}
        />
        <Text>TSR + Advisor</Text>
      </div>

      {isLoading && <Text className={styles.empty}>Loading nearest technicians…</Text>}
      {!isLoading && ranked.length === 0 && (
        <Text className={styles.empty}>No proximity data found for this service center.</Text>
      )}

      {!isLoading && ranked.length > 0 && (
        <Controller
          name="assignedToPersonnelId"
          control={control}
          render={({ field }) => (
            <RadioGroup value={field.value} onChange={(_, data) => field.onChange(data.value)}>
              {ranked.map((entry, idx) => (
                <Radio
                  key={entry.personnelId}
                  value={entry.personnelId}
                  label={
                    <span className={styles.rankedItem}>
                      {idx + 1}. {entry.name || 'Unknown'}
                      {entry.distance != null && (
                        <span className={styles.distance}> — {entry.distance.toFixed(1)} mi</span>
                      )}
                    </span>
                  }
                />
              ))}
            </RadioGroup>
          )}
        />
      )}

      <div className={styles.divider} />

      <Controller
        name="assignedToPersonnelId"
        control={control}
        render={({ field }) => (
          <PersonnelFallbackPicker selectedId={field.value} onSelect={field.onChange} />
        )}
      />
    </NumberedSectionCard>
  );
}
