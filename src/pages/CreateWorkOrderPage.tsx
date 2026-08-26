import { PageHeader } from '../components/PageHeader';
import { CreateWorkOrderForm } from '../features/work-orders/components/CreateWorkOrderForm';

export function CreateWorkOrderPage() {
  return (
    <div>
      <PageHeader title="Create Work Order" subtitle="Open a new field service work order" />
      <CreateWorkOrderForm />
    </div>
  );
}
