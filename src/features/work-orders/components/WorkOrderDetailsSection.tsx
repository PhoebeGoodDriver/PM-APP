import { Controller, useFormContext } from 'react-hook-form';
import {
  Field,
  Input,
  Textarea,
  Dropdown,
  Option,
  Combobox,
  makeStyles,
} from '@fluentui/react-components';
import { DatePicker } from '@fluentui/react-datepicker-compat';
import { NumberedSectionCard } from '../../../components/NumberedSectionCard';
import { TechnicalDetailsSubsection } from './TechnicalDetailsSubsection';
import { optionSetEntries } from '../utils/optionSet';
import {
  Cre2b_workorderscre2b_wotype,
  Cre2b_workorderscre2b_producttype,
  Cre2b_workorderscre2b_problemtype,
} from '../../../generated/models/Cre2b_workordersModel';
import { useProjectNames } from '../hooks/useProjectNames';
import type { CreateWorkOrderFormValues } from './CreateWorkOrderForm';

const useStyles = makeStyles({
  row3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '16px',
  },
  row2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '16px',
  },
  full: {
    marginBottom: '16px',
  },
});

const wotypeOptions = optionSetEntries(Cre2b_workorderscre2b_wotype);
const producttypeOptions = optionSetEntries(Cre2b_workorderscre2b_producttype);
const problemtypeOptions = optionSetEntries(Cre2b_workorderscre2b_problemtype);

export function WorkOrderDetailsSection() {
  const styles = useStyles();
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CreateWorkOrderFormValues>();
  const { data: projectNames } = useProjectNames();

  return (
    <NumberedSectionCard number={2} title="Work Order Details">
      <div className={styles.row3}>
        <Field label="W/O Type" required validationMessage={errors.wotype?.message}>
          <Controller
            name="wotype"
            control={control}
            rules={{ required: 'Required' }}
            render={({ field }) => (
              <Dropdown
                value={wotypeOptions.find((o) => o.value === field.value)?.label ?? ''}
                selectedOptions={field.value != null ? [String(field.value)] : []}
                onOptionSelect={(_, data) =>
                  field.onChange(data.optionValue ? Number(data.optionValue) : undefined)
                }
              >
                {wotypeOptions.map((o) => (
                  <Option key={o.value} value={String(o.value)}>
                    {o.label}
                  </Option>
                ))}
              </Dropdown>
            )}
          />
        </Field>
        <Field label="Product Type" required validationMessage={errors.producttype?.message}>
          <Controller
            name="producttype"
            control={control}
            rules={{ required: 'Required' }}
            render={({ field }) => (
              <Dropdown
                value={producttypeOptions.find((o) => o.value === field.value)?.label ?? ''}
                selectedOptions={field.value != null ? [String(field.value)] : []}
                onOptionSelect={(_, data) =>
                  field.onChange(data.optionValue ? Number(data.optionValue) : undefined)
                }
              >
                {producttypeOptions.map((o) => (
                  <Option key={o.value} value={String(o.value)}>
                    {o.label}
                  </Option>
                ))}
              </Dropdown>
            )}
          />
        </Field>
        <Field label="Problem Type" required validationMessage={errors.problemtype?.message}>
          <Controller
            name="problemtype"
            control={control}
            rules={{ required: 'Required' }}
            render={({ field }) => (
              <Dropdown
                value={problemtypeOptions.find((o) => o.value === field.value)?.label ?? ''}
                selectedOptions={field.value != null ? [String(field.value)] : []}
                onOptionSelect={(_, data) =>
                  field.onChange(data.optionValue ? Number(data.optionValue) : undefined)
                }
              >
                {problemtypeOptions.map((o) => (
                  <Option key={o.value} value={String(o.value)}>
                    {o.label}
                  </Option>
                ))}
              </Dropdown>
            )}
          />
        </Field>
      </div>

      <Field
        className={styles.full}
        label="Problem Description"
        required
        validationMessage={errors.problemdescription?.message}
      >
        <Input
          {...register('problemdescription', { required: 'Required' })}
          placeholder="Short summary of the issue"
        />
      </Field>

      <Field className={styles.full} label="Problem Details">
        <Textarea
          {...register('problemdetails')}
          placeholder="IP/host name, error codes, and other technical specifics"
          rows={4}
        />
      </Field>

      <div className={styles.row3}>
        <Field label="Product/Part Numbers Comments">
          <Textarea {...register('productpartnumberscomments')} rows={2} />
        </Field>
        <Field label="Room/Area">
          <Input {...register('roomarea')} />
        </Field>
        <Field label="Tracking Number">
          <Input {...register('trackingnumber')} />
        </Field>
      </div>

      <div className={styles.full}>
        <TechnicalDetailsSubsection />
      </div>

      <div className={styles.row2}>
        <Field label="Reference Link">
          <Input {...register('referencelink')} placeholder="https://…" type="url" />
        </Field>
        <Field
          label="Expiration Date"
          required
          validationMessage={errors.expirationdate?.message}
        >
          <Controller
            name="expirationdate"
            control={control}
            rules={{ required: 'Required' }}
            render={({ field }) => (
              <DatePicker
                value={field.value ?? null}
                onSelectDate={(date) => field.onChange(date ?? null)}
              />
            )}
          />
        </Field>
      </div>

      <Field className={styles.full} label="Project Name">
        <Controller
          name="projectname"
          control={control}
          render={({ field }) => (
            <Combobox
              freeform
              value={field.value ?? ''}
              onInput={(e) => field.onChange((e.target as HTMLInputElement).value)}
              onOptionSelect={(_, data) => field.onChange(data.optionText ?? '')}
              placeholder="Pick a previous project or type a new one"
            >
              {(projectNames ?? []).map((name) => (
                <Option key={name} value={name}>
                  {name}
                </Option>
              ))}
            </Combobox>
          )}
        />
      </Field>
    </NumberedSectionCard>
  );
}
