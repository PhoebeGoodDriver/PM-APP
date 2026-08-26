# PM App — Dashboard & Expiration Date Fixes

Three small fixes to the already-built PM app (Power Apps Code App, Dataverse
backend). Reference the real files below — don't guess field or component
names, they're all confirmed against the current repo.

## 1. Dashboard table: "Service Center" column shows the city, not a service
   center name

Today `src/features/dashboard/components/WorkOrderTable.tsx` resolves that
column with `resolveName(serviceCenterNames, wo._cre2b_servicecenter_value,
wo.cre2b_servicecentername)`, where `serviceCenterNames` is built in
`DashboardPage.tsx` from `ServiceCenter.cre2b_locationname` — which genuinely
is the "location name" field, distinct from `cre2b_city` (see
`src/generated/models/Cre2b_servicecentersModel.ts`: `cre2b_locationname` is
required/primary, `cre2b_city` is a separate optional field). So the code is
already pulling the right field — the values in `cre2b_locationname` itself
are apparently just the city ("ATLANTA", "PITTSBURGH", etc.).

**Before changing any code**, pull a few real ServiceCenter records and check
what's actually in `cre2b_locationname` vs. `cre2b_locationalphacode` (e.g.
`ATL`) vs. `cre2b_city`. Two possible outcomes:

- If `cre2b_locationname` is genuinely just the city by design for this data
  set, the fix is a data problem, not a code problem — flag that back to me
  rather than papering over it in the UI.
- If there's a more specific name available (e.g. combine the alpha code with
  the location name, like `ATL — ATLANTA`), update the display to use that
  combined format everywhere a service center name currently renders —
  `WorkOrderTable.tsx`, `WorkOrderHeader.tsx`, and any other place going
  through `buildNameMap`/`resolveName` for ServiceCenter — so it's consistent
  across the app, not just fixed on the dashboard.

## 2. Let the user change the Expiration Date after a work order is created

Right now `cre2b_expirationdate` is set once in `CreateWorkOrderForm.tsx` and
shown read-only afterward as a `ReadOnlyField` in
`src/features/work-orders/components/WorkOrderHeader.tsx` — there's no update
path.

Add an inline edit action on the work order detail page, following the same
pattern already used for reassignment:

- UI: a small Dialog + trigger button, same shape as
  `src/features/work-orders/components/ReassignDialog.tsx` (Dialog /
  DialogSurface / DialogBody / DialogActions from Fluent UI). Use the same
  date picker already in use for Expiration Date elsewhere
  (`@fluentui/react-datepicker-compat`, see `CreateWorkOrderForm.tsx` /
  `WorkOrderDetailsSection.tsx`).
- Only show this action while the work order is open — same rule the rest of
  the Actions area already follows (disappears once status is
  Closed-Completed or Closed-Canceled).
- Data write: new hook mirroring
  `src/features/work-orders/hooks/useReassignWorkOrder.ts` — call
  `Cre2b_workordersService.update(workOrderId, { cre2b_expirationdate:
  newDate.toISOString() })`, then log a WorkOrderStatusHistory row using
  `cre2b_actiontype: 200080003` (`Comment/Update` — see
  `Cre2b_workorderstatushistoriesModel.ts`), with a plain-sentence comment
  like `"Expiration date changed from 9/1/2026 to 9/15/2026."`, bound to the
  work order the same way `useReassignWorkOrder.ts` binds its Transfer row.
- On success, invalidate the same query keys `useReassignWorkOrder` does
  (`['workOrder', workOrderId]`, `['workOrderStatusHistory', workOrderId]`,
  `['workOrderList']`) so both the detail header and the dashboard's Expires
  column update without a manual refresh.
- This new history entry should render sensibly in
  `WorkOrderStatusHistoryList.tsx` / `describeHistoryEntry.ts`, same as other
  Comment/Update rows.

## 3. Dashboard: filter by status

`DashboardPage.tsx` currently renders 7 `StatusCountTile`s (one per status,
from `useWorkOrderStatusCounts.ts`) purely as static counts — clicking one
does nothing — and a separate `WorkOrderTable` below with no relationship to
them.

Make the tiles double as a filter:

- Clicking a status tile filters the table below to just that status;
  clicking it again (or an explicit "All" tile/control) clears the filter
  back to showing everything, which is today's default behavior.
- Visually indicate which filter is active — e.g. a highlighted border/
  background on the selected tile using the app's purple accent (`#4B2E83`),
  consistent with the status badge colors already defined in
  `WorkOrderTable.tsx`'s `STATUS_COLOR` map.
- This can be done client-side with local component state (e.g. `useState<number
  | 'all'>`) filtering the array `useWorkOrderList.ts` already fetches — no
  new query needed, all 7 statuses are non-closed-and-closed rows already
  present in that result set (`statecode eq 0`).
- Keep the status labels/values in sync with the existing
  `Cre2b_workorderscre2b_status` enum in `Cre2b_workordersModel.ts` — don't
  hardcode a separate list.

## Before you start

Item 1 needs you to look at real ServiceCenter data first and tell me what
you find before changing the display logic — don't guess at a fix. Items 2
and 3 are fully specified — build them.
