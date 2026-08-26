import { useState } from 'react';
import { Combobox, Option, Field, Spinner } from '@fluentui/react-components';
import { usePersonnelRoster } from '../hooks/usePersonnelRoster';

export function PersonnelFallbackPicker({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (personnelId: string) => void;
}) {
  const { data: roster, isLoading } = usePersonnelRoster();
  const [query, setQuery] = useState('');
  const selected = roster?.find((p) => p.cre2b_personnelid === selectedId);

  return (
    <Field label="Or assign someone else from the full roster">
      <Combobox
        placeholder="Search all TSRs and Advisors"
        value={query || selected?.cre2b_fullname || ''}
        onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
        onOptionSelect={(_, data) => {
          if (data.optionValue) {
            onSelect(data.optionValue);
            setQuery('');
          }
        }}
      >
        {isLoading && <Spinner size="tiny" label="Loading…" />}
        {!isLoading &&
          (roster ?? []).map((p) => (
            <Option key={p.cre2b_personnelid} value={p.cre2b_personnelid} text={p.cre2b_fullname ?? ''}>
              {p.cre2b_fullname}
            </Option>
          ))}
      </Combobox>
    </Field>
  );
}
