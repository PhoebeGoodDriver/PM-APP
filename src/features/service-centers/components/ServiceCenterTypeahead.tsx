import { useState } from 'react';
import { Combobox, Option, Field, Spinner } from '@fluentui/react-components';
import { useServiceCenterSearch } from '../hooks/useServiceCenterSearch';
import type { Cre2b_servicecenters } from '../../../generated/models/Cre2b_servicecentersModel';

export function ServiceCenterTypeahead({
  onSelect,
}: {
  onSelect: (serviceCenter: Cre2b_servicecenters) => void;
}) {
  const [query, setQuery] = useState('');
  const { results, isLoading } = useServiceCenterSearch(query);

  return (
    <Field label="Service Center" required hint="Search by alpha code, city, or state">
      <Combobox
        placeholder="e.g. ATL, Atlanta, GA"
        value={query}
        onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
        onOptionSelect={(_, data) => {
          const match = results.find((sc) => sc.cre2b_servicecenterid === data.optionValue);
          if (match) {
            onSelect(match);
            setQuery('');
          }
        }}
      >
        {isLoading && <Spinner size="tiny" label="Loading…" />}
        {!isLoading &&
          results.map((sc) => (
            <Option
              key={sc.cre2b_servicecenterid}
              value={sc.cre2b_servicecenterid}
              text={`${sc.cre2b_locationalphacode ?? sc.cre2b_locationname} — ${sc.cre2b_city ?? ''}, ${sc.cre2b_state ?? ''}`}
            >
              {sc.cre2b_locationalphacode ?? sc.cre2b_locationname} — {sc.cre2b_city}, {sc.cre2b_state}
            </Option>
          ))}
        {!isLoading && results.length === 0 && <Option value="" disabled>No matches</Option>}
      </Combobox>
    </Field>
  );
}
