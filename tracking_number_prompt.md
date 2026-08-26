# PM App — Tracking Number: Single/Batch Open + Edit-After-Creation

`cre2b_trackingnumber` (optional text) has already been added to the
WorkOrder table in Dataverse and confirmed present in the generated model
(`src/generated/models/Cre2b_workordersModel.ts`) — no schema/refresh step
needed, go straight to the UI/logic work below.

## 1. Single Work Order creation

- `src/features/work-orders/components/WorkOrderDetailsSection.tsx`: add a
  "Tracking Number" `Input`, optional — no `required` prop, no validation
  message, same as `Room/Area`. Put it in the same area as `Product/Part
  Numbers Comments` and `Room/Area` since it's parts-related (either widen
  that `row2` grid or add it as its own row next to `Room/Area` — your call
  on layout).
- `CreateWorkOrderForm.tsx`: add `trackingnumber: string` to
  `CreateWorkOrderFormValues` (default `''`), and pass
  `trackingnumber: values.trackingnumber || undefined` into the
  `createWorkOrder.mutate(...)` call.
- `src/features/work-orders/hooks/useCreateWorkOrder.ts`: add
  `trackingnumber?: string` to `CreateWorkOrderInput`, and map it to
  `cre2b_trackingnumber: input.trackingnumber` in the
  `Cre2b_workordersService.create(...)` call.

## 2. Batch upload

- `src/features/batch-upload/utils/workOrderColumnTemplate.ts`: add
  `{ key: 'TrackingNumber', required: false, example: '' }` to
  `WORK_ORDER_COLUMNS`.
- `src/features/batch-upload/utils/validateWorkOrderRows.ts`: read it with
  `get('TrackingNumber')` and add
  `trackingnumber: get('TrackingNumber') || undefined` to the object built
  for `CreateWorkOrderInput`. No format validation needed — it's free text
  and optional, same as `ProductPartNumbersComments`.

## 3. Make it editable after creation

This is the main ask — planners frequently don't have the parts' tracking
number yet when they open a WO, and need to add or change it later.

- Show it on the work order detail page, in
  `src/features/work-orders/components/WorkOrderHeader.tsx`, as a
  `ReadOnlyField` labeled "Tracking Number" (render `—` when blank, same
  convention as the other optional fields there) — so it's visibly present
  and obviously addable even when empty, not just missing.
- Add an edit action next to it, following the exact same shape as
  `ReassignDialog.tsx`: a small `Dialog` triggered by a button (e.g. "Add/Edit
  Tracking Number"), containing one text `Input`, with Save/Cancel actions.
- New hook mirroring `useReassignWorkOrder.ts`'s structure: call
  `Cre2b_workordersService.update(workOrderId, { cre2b_trackingnumber:
  newValue })`, then log a `WorkOrderStatusHistory` row with
  `cre2b_actiontype: 200080003` (`Comment/Update`), comment text like
  `"Tracking number set to 1Z999AA10123456784."` or `"Tracking number changed
  from X to Y."`, bound to the work order the same way the Reassign/Transfer
  history row is bound. On success, invalidate `['workOrder', workOrderId]`
  and `['workOrderStatusHistory', workOrderId]`, same as reassign.
- Unlike the status-change Actions (Accept, Schedule, Close, etc.), which
  disappear once a work order is closed, **keep this edit available
  regardless of status** — a tracking number can plausibly show up after the
  job is already marked complete, and that matches how Comments already stay
  addable after close in this app. Flag it if you'd rather lock it down once
  closed — easy to change, just noting the default I'm building to.
- Should render sensibly in `WorkOrderStatusHistoryList.tsx` /
  `describeHistoryEntry.ts` like other Comment/Update rows, same as the
  Expiration Date edit history entries.

One open question for you, not something to guess at: do you also want a
Tracking Number column on the Dashboard table
(`WorkOrderTable.tsx`), or is detail-page-only enough for now? If you want it
on the dashboard too, say so and I'll fold it into this same pass so it
doesn't need a separate prompt later.

## Before you start

Nothing blocking here — the field exists and is confirmed in the generated
model. Build all three pieces above; just flag back if you disagree with the
"editable after close" default in section 3.
