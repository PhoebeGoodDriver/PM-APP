import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { Button, MessageBar, MessageBarBody, makeStyles } from '@fluentui/react-components';
import { ServiceCenterSection } from './ServiceCenterSection';
import { WorkOrderDetailsSection } from './WorkOrderDetailsSection';
import { AssignmentSection } from './AssignmentSection';
import { useCreateWorkOrder } from '../hooks/useCreateWorkOrder';
import { useCurrentUser } from '../../../lib/useCurrentUser';
import type {
  Cre2b_workorderscre2b_wotype,
  Cre2b_workorderscre2b_producttype,
  Cre2b_workorderscre2b_problemtype,
  Cre2b_workorderscre2b_assignpool,
} from '../../../generated/models/Cre2b_workordersModel';
import type { Cre2b_servicecenters } from '../../../generated/models/Cre2b_servicecentersModel';

export interface CreateWorkOrderFormValues {
  wotype: Cre2b_workorderscre2b_wotype;
  producttype: Cre2b_workorderscre2b_producttype;
  problemtype: Cre2b_workorderscre2b_problemtype;
  problemdescription: string;
  problemdetails: string;
  productpartnumberscomments: string;
  roomarea: string;
  trackingnumber: string;
  networkdetail: string;
  circuitdetails: string;
  computerhostname: string;
  referencelink: string;
  expirationdate: Date | null;
  projectname: string;
  assignpool: Cre2b_workorderscre2b_assignpool;
  assignedToPersonnelId: string;
}

const defaultValues: CreateWorkOrderFormValues = {
  wotype: 200080000,
  producttype: undefined as unknown as Cre2b_workorderscre2b_producttype,
  problemtype: undefined as unknown as Cre2b_workorderscre2b_problemtype,
  problemdescription: '',
  problemdetails: '',
  productpartnumberscomments: '',
  roomarea: '',
  trackingnumber: '',
  networkdetail: '',
  circuitdetails: '',
  computerhostname: '',
  referencelink: '',
  expirationdate: null,
  projectname: '',
  assignpool: 200080000,
  assignedToPersonnelId: '',
};

const useStyles = makeStyles({
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '8px',
  },
  error: {
    marginBottom: '16px',
  },
});

export function CreateWorkOrderForm() {
  const styles = useStyles();
  const navigate = useNavigate();
  const [serviceCenter, setServiceCenter] = useState<Cre2b_servicecenters | null>(null);
  const methods = useForm<CreateWorkOrderFormValues>({ defaultValues });
  const createWorkOrder = useCreateWorkOrder();
  const { data: currentUser } = useCurrentUser();

  const onSubmit = methods.handleSubmit((values) => {
    if (!serviceCenter) return;
    createWorkOrder.mutate(
      {
        serviceCenterId: serviceCenter.cre2b_servicecenterid,
        wotype: values.wotype,
        producttype: values.producttype,
        problemtype: values.problemtype,
        problemdescription: values.problemdescription,
        problemdetails: values.problemdetails || undefined,
        productpartnumberscomments: values.productpartnumberscomments || undefined,
        roomarea: values.roomarea || undefined,
        trackingnumber: values.trackingnumber || undefined,
        networkdetail: values.networkdetail || undefined,
        circuitdetails: values.circuitdetails || undefined,
        computerhostname: values.computerhostname || undefined,
        referencelink: values.referencelink || undefined,
        expirationdate: values.expirationdate ? values.expirationdate.toISOString() : '',
        projectname: values.projectname || undefined,
        assignpool: values.assignpool,
        assignedToPersonnelId: values.assignedToPersonnelId,
        createdBy: currentUser,
      },
      {
        onSuccess: (workOrder) => {
          navigate(`/work-orders/${workOrder.cre2b_workorderid}`);
        },
      },
    );
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit}>
        <ServiceCenterSection
          serviceCenter={serviceCenter}
          onSelect={setServiceCenter}
          onClear={() => setServiceCenter(null)}
        />
        <WorkOrderDetailsSection />
        <AssignmentSection serviceCenterId={serviceCenter?.cre2b_servicecenterid ?? null} />

        {createWorkOrder.isError && (
          <MessageBar intent="error" className={styles.error}>
            <MessageBarBody>
              {createWorkOrder.error instanceof Error
                ? createWorkOrder.error.message
                : 'Failed to open work order.'}
            </MessageBarBody>
          </MessageBar>
        )}

        <div className={styles.actions}>
          <Button
            appearance="primary"
            type="submit"
            disabled={!serviceCenter || createWorkOrder.isPending}
          >
            {createWorkOrder.isPending ? 'Opening…' : 'Open Work Order'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
