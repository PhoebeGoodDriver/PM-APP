import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Cre2b_workordersService } from '../../../generated/services/Cre2b_workordersService';
import { Cre2b_workorderstatushistoriesService } from '../../../generated/services/Cre2b_workorderstatushistoriesService';
import type {
  Cre2b_workorderscre2b_wotype,
  Cre2b_workorderscre2b_producttype,
  Cre2b_workorderscre2b_problemtype,
  Cre2b_workorderscre2b_assignpool,
} from '../../../generated/models/Cre2b_workordersModel';
import { generateNextWorkOrderNumber } from '../utils/generateWorkOrderNumber';
import { buildODataBind } from '../utils/odataBind';

/**
 * The generated option-set types (e.g. Cre2b_workorderscre2b_wotype) are unions of the
 * Dataverse numeric option codes (200080000, ...), not the string labels — `keyof` on a
 * const object with numeric keys yields numeric literal types. Callers pass the numeric
 * code directly (see optionSetEntries in ../utils/optionSet for building dropdown options).
 */
export interface CreateWorkOrderInput {
  serviceCenterId: string;
  wotype: Cre2b_workorderscre2b_wotype;
  producttype: Cre2b_workorderscre2b_producttype;
  problemtype: Cre2b_workorderscre2b_problemtype;
  problemdescription: string;
  problemdetails?: string;
  productpartnumberscomments?: string;
  roomarea?: string;
  trackingnumber?: string;
  networkdetail?: string;
  circuitdetails?: string;
  computerhostname?: string;
  referencelink?: string;
  expirationdate: string;
  projectname?: string;
  assignpool: Cre2b_workorderscre2b_assignpool;
  assignedToPersonnelId: string;
  createdBy?: string;
  batchId?: string;
}

const STATUS_ASSIGNED = 200080000;
const ACTIONTYPE_STATUS_CHANGE = 200080000;
const TOSTATUS_ASSIGNED = 200080000;

export async function createWorkOrder(input: CreateWorkOrderInput) {
  const wonumber = await generateNextWorkOrderNumber();

  const createResult = await Cre2b_workordersService.create({
    cre2b_wonumber: wonumber,
    statecode: 0,
    cre2b_status: STATUS_ASSIGNED,
    cre2b_wotype: input.wotype,
    cre2b_producttype: input.producttype,
    cre2b_problemtype: input.problemtype,
    cre2b_problemdescription: input.problemdescription,
    cre2b_problemdetails: input.problemdetails,
    cre2b_productpartnumberscomments: input.productpartnumberscomments,
    cre2b_roomarea: input.roomarea,
    cre2b_trackingnumber: input.trackingnumber,
    cre2b_networkcircuitcomputernamedetail: input.networkdetail,
    cre2b_circuitdetails: input.circuitdetails,
    cre2b_computerhostname: input.computerhostname,
    cre2b_link: input.referencelink,
    cre2b_expirationdate: input.expirationdate,
    cre2b_projectname: input.projectname,
    cre2b_assignpool: input.assignpool,
    cre2b_createdby: input.createdBy,
    cre2b_createdat: new Date().toISOString(),
    'cre2b_ServiceCenter@odata.bind': buildODataBind('cre2b_servicecenters', input.serviceCenterId),
    'cre2b_AssignedTo@odata.bind': buildODataBind('cre2b_personnels', input.assignedToPersonnelId),
    ...(input.batchId
      ? { 'cre2b_Batch@odata.bind': buildODataBind('cre2b_workorderbatchs', input.batchId) }
      : {}),
  });

  if (!createResult.success) {
    throw createResult.error ?? new Error('Failed to create work order');
  }

  const workOrder = createResult.data;

  const historyResult = await Cre2b_workorderstatushistoriesService.create({
    statecode: 0,
    cre2b_actiontype: ACTIONTYPE_STATUS_CHANGE,
    cre2b_tostatus: TOSTATUS_ASSIGNED,
    cre2b_changedat: new Date().toISOString(),
    // Changed By is deliberately not set here — Dataverse's own createdby system
    // field already records who made the write, correctly and automatically, for
    // every history row. Don't shadow it with a client-resolved name.
    cre2b_comment: 'Work order opened',
    'cre2b_WorkOrder@odata.bind': buildODataBind('cre2b_workorders', workOrder.cre2b_workorderid),
  });

  if (!historyResult.success) {
    throw (
      historyResult.error ?? new Error('Work order created, but failed to log initial status history')
    );
  }

  return workOrder;
}

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWorkOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workOrderStatusCounts'] });
      queryClient.invalidateQueries({ queryKey: ['projectNames'] });
    },
  });
}
