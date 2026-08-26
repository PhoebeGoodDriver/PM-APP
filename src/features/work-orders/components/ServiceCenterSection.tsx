import { NumberedSectionCard } from '../../../components/NumberedSectionCard';
import { ServiceCenterTypeahead } from '../../service-centers/components/ServiceCenterTypeahead';
import { ServiceCenterReadOnlyCard } from '../../service-centers/components/ServiceCenterReadOnlyCard';
import type { Cre2b_servicecenters } from '../../../generated/models/Cre2b_servicecentersModel';

export function ServiceCenterSection({
  serviceCenter,
  onSelect,
  onClear,
}: {
  serviceCenter: Cre2b_servicecenters | null;
  onSelect: (serviceCenter: Cre2b_servicecenters) => void;
  onClear: () => void;
}) {
  return (
    <NumberedSectionCard number={1} title="Service Center">
      {!serviceCenter && <ServiceCenterTypeahead onSelect={onSelect} />}
      {serviceCenter && (
        <ServiceCenterReadOnlyCard serviceCenter={serviceCenter} onClear={onClear} />
      )}
    </NumberedSectionCard>
  );
}
