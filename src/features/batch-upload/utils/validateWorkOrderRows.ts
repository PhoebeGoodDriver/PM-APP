import {
  Cre2b_workorderscre2b_wotype,
  Cre2b_workorderscre2b_producttype,
  Cre2b_workorderscre2b_problemtype,
  Cre2b_workorderscre2b_assignpool,
} from '../../../generated/models/Cre2b_workordersModel';
import type { Cre2b_servicecenters } from '../../../generated/models/Cre2b_servicecentersModel';
import type { Cre2b_personnels } from '../../../generated/models/Cre2b_personnelsModel';
import type { Cre2b_servicecenterproximities } from '../../../generated/models/Cre2b_servicecenterproximitiesModel';
import type { CreateWorkOrderInput } from '../../work-orders/hooks/useCreateWorkOrder';
import type { RawWorkOrderRow } from './parseWorkOrderWorkbook';
import { WORK_ORDER_COLUMNS } from './workOrderColumnTemplate';
import { buildNameMap } from '../../../lib/buildNameMap';
import { getRankedPersonnel } from '../../service-centers/hooks/useServiceCenterProximity';

export interface ValidatedRow {
  rowNumber: number;
  raw: RawWorkOrderRow;
  input: CreateWorkOrderInput | null;
  errors: string[];
  /** Resolved assignee display name — set for both manual and pool-driven assignment. */
  assignedDisplayName?: string;
  assignmentMethod?: 'manual' | 'pool';
}

function findOptionCode(optionSet: Record<number, string>, label: string): number | undefined {
  const normalized = label.trim().toLowerCase();
  const entry = Object.entries(optionSet).find(([, l]) => l.toLowerCase() === normalized);
  return entry ? Number(entry[0]) : undefined;
}

function cellString(value: RawWorkOrderRow[string]): string {
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString();
  return String(value).trim();
}

const DEFAULT_ASSIGNPOOL_CODE = 200080000; // 'TSR Only' — used only to populate storage when a
// row assigns manually and leaves AssignPool blank; it does not drive assignment in that case.

export function validateWorkOrderRows(
  rows: RawWorkOrderRow[],
  serviceCenters: Cre2b_servicecenters[],
  personnel: Cre2b_personnels[],
  proximities: Cre2b_servicecenterproximities[] = [],
): ValidatedRow[] {
  const personnelNames = buildNameMap(personnel, 'cre2b_personnelid', 'cre2b_fullname');
  const proximityByServiceCenterId: Record<string, Cre2b_servicecenterproximities> = {};
  proximities.forEach((p) => {
    if (p._cre2b_servicecenterlookup_value) {
      proximityByServiceCenterId[p._cre2b_servicecenterlookup_value] = p;
    }
  });

  return rows.map((raw, idx) => {
    const errors: string[] = [];
    const get = (key: string) => cellString(raw[key]);

    for (const col of WORK_ORDER_COLUMNS) {
      if (col.required && !get(col.key)) {
        errors.push(`${col.key} is required`);
      }
    }

    const alphaCode = get('ServiceCenterAlphaCode');
    const serviceCenter = serviceCenters.find(
      (sc) => sc.cre2b_locationalphacode?.toLowerCase() === alphaCode.toLowerCase(),
    );
    if (alphaCode && !serviceCenter) {
      errors.push(`Unknown service center alpha code "${alphaCode}"`);
    }

    const wotypeLabel = get('WOType');
    const wotype = wotypeLabel ? findOptionCode(Cre2b_workorderscre2b_wotype, wotypeLabel) : undefined;
    if (wotypeLabel && wotype === undefined) {
      errors.push(`Unknown W/O Type "${wotypeLabel}"`);
    }

    const producttypeLabel = get('ProductType');
    const producttype = producttypeLabel
      ? findOptionCode(Cre2b_workorderscre2b_producttype, producttypeLabel)
      : undefined;
    if (producttypeLabel && producttype === undefined) {
      errors.push(`Unknown Product Type "${producttypeLabel}"`);
    }

    const problemtypeLabel = get('ProblemType');
    const problemtype = problemtypeLabel
      ? findOptionCode(Cre2b_workorderscre2b_problemtype, problemtypeLabel)
      : undefined;
    if (problemtypeLabel && problemtype === undefined) {
      errors.push(`Unknown Problem Type "${problemtypeLabel}"`);
    }

    const assignPoolLabel = get('AssignPool');
    const assignedName = get('AssignedToPersonnelName');

    if (!assignedName && !assignPoolLabel) {
      errors.push('Either AssignedToPersonnelName or AssignPool is required');
    }

    let assignpool: number | undefined;
    if (assignPoolLabel) {
      assignpool = findOptionCode(Cre2b_workorderscre2b_assignpool, assignPoolLabel);
      if (assignpool === undefined) {
        errors.push(`Unknown Assign Pool "${assignPoolLabel}"`);
      }
    } else {
      // No pool given and a manual name is present — the field is still written to
      // Dataverse for record-keeping, but it plays no role in picking the assignee.
      assignpool = DEFAULT_ASSIGNPOOL_CODE;
    }

    let assignedToPersonnelId: string | undefined;
    let assignedDisplayName: string | undefined;
    let assignmentMethod: 'manual' | 'pool' | undefined;

    if (assignedName) {
      const matches = personnel.filter(
        (p) => p.cre2b_fullname?.toLowerCase() === assignedName.toLowerCase(),
      );
      if (matches.length === 0) {
        errors.push(`Unknown personnel "${assignedName}"`);
      } else if (matches.length > 1) {
        errors.push(`Personnel name "${assignedName}" is ambiguous (${matches.length} matches)`);
      } else {
        assignedToPersonnelId = matches[0].cre2b_personnelid;
        assignedDisplayName = matches[0].cre2b_fullname ?? assignedName;
        assignmentMethod = 'manual';
      }
    } else if (assignPoolLabel && assignpool !== undefined && serviceCenter) {
      // Reuse the exact same ServiceCenterProximity ranking logic as the Create Work Order
      // screen's Assignment section (getRankedPersonnel) rather than reimplementing it here.
      const poolName = assignpool === 200080001 ? 'TSR + Advisor' : 'TSR Only';
      const proximity = proximityByServiceCenterId[serviceCenter.cre2b_servicecenterid];
      const ranked = getRankedPersonnel(proximity ?? null, poolName, personnelNames);
      if (ranked.length === 0) {
        errors.push(
          `No available personnel found for pool "${assignPoolLabel}" at service center "${alphaCode}"`,
        );
      } else {
        assignedToPersonnelId = ranked[0].personnelId;
        assignedDisplayName = ranked[0].name || 'Unknown';
        assignmentMethod = 'pool';
      }
    }

    const expirationRaw = get('ExpirationDate');
    const expirationDate = expirationRaw ? new Date(expirationRaw) : undefined;
    if (expirationRaw && (!expirationDate || Number.isNaN(expirationDate.getTime()))) {
      errors.push(`Invalid Expiration Date "${expirationRaw}"`);
    }

    // The option-set codes above are validated at runtime against the live Dataverse
    // option sets, but findOptionCode returns a plain `number` — narrower than the
    // generated literal-union types — so the object is cast once, deliberately, below.
    const input: CreateWorkOrderInput | null =
      errors.length === 0 &&
      serviceCenter &&
      wotype !== undefined &&
      producttype !== undefined &&
      problemtype !== undefined &&
      assignpool !== undefined &&
      assignedToPersonnelId &&
      expirationDate
        ? ({
            serviceCenterId: serviceCenter.cre2b_servicecenterid,
            wotype,
            producttype,
            problemtype,
            problemdescription: get('ProblemDescription'),
            problemdetails: get('ProblemDetails') || undefined,
            productpartnumberscomments: get('ProductPartNumbersComments') || undefined,
            roomarea: get('RoomArea') || undefined,
            trackingnumber: get('TrackingNumber') || undefined,
            networkdetail: get('NetworkDetail') || undefined,
            circuitdetails: get('CircuitDetails') || undefined,
            computerhostname: get('ComputerHostName') || undefined,
            referencelink: get('ReferenceLink') || undefined,
            expirationdate: expirationDate.toISOString(),
            projectname: get('ProjectName') || undefined,
            assignpool,
            assignedToPersonnelId,
          } as CreateWorkOrderInput)
        : null;

    return { rowNumber: idx + 2, raw, input, errors, assignedDisplayName, assignmentMethod };
  });
}
