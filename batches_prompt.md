# PM App — Batches: create-on-batch-upload + a Batches review page

The schema is in and refreshed — confirmed in the generated files:
`src/generated/models/Cre2b_workorderbatchsModel.ts` /
`Cre2b_workorderbatchsService.ts` (note the generated name is
`workorderbatchs`, not `workorderbatches` — Dataverse's own pluralization,
don't "fix" it, just use it as generated). Its only meaningful field is
`cre2b_batchnumber` (Autonumber — system-generated on create, never pass a
value for it yourself). `WorkOrder` now has `cre2b_batch` /
`_cre2b_batch_value` (the lookup) and `"cre2b_Batch@odata.bind"` (the bind
key for writes), plus a denormalized `cre2b_batchname`.

Single work orders created through the regular Create Work Order screen
should **not** get a batch — `cre2b_batch` stays unset there. Only rows
created through Batch Upload get grouped under one Batch record per upload
run.

## 1. Create one Batch record per batch-upload run, and bind every row to it

- `src/features/work-orders/hooks/useCreateWorkOrder.ts`: add `batchId?:
  string` to `CreateWorkOrderInput`. In the `Cre2b_workordersService.create(...)`
  call, conditionally include the bind — only when `batchId` is set:
  `...(input.batchId ? { 'cre2b_Batch@odata.bind':
  buildODataBind('cre2b_workorderbatchs', input.batchId) } : {})`. Leave
  everything else in that function unchanged.
- `src/features/batch-upload/hooks/useBulkCreateWorkOrders.ts`: at the start
  of `run()`, before the row loop, create one batch record —
  `Cre2b_workorderbatchsService.create({ statecode: 0 })` (that's the only
  field it needs; `cre2b_batchnumber` fills in automatically). If that create
  fails, bail out of the whole run and report it as a failure — don't fall
  back to creating ungrouped work orders. On success, pass the returned
  `cre2b_workorderbatchid` through to every `createWorkOrder({ ...row.input,
  createdBy, batchId })` call in the loop, and expose the created batch (its
  id and `cre2b_batchnumber`) from the hook so the page can show it — e.g.
  add a `batch: { id: string; number: string } | null` bit of state next to
  the existing `results`/`progress`.
- `src/pages/BatchUploadPage.tsx`: the success `MessageBar` after a commit
  currently just says "Created X of Y work orders." — extend it to also name
  the batch, e.g. "Created 8 of 8 work orders under Batch BATCH-000042.",
  with a link/button to jump straight to that batch's detail page (route
  below).

## 2. Batches list page

New page, new route, new nav item — same shape as the existing pages:

- `src/features/batches/hooks/useBatchList.ts`: fetch all
  `Cre2b_workorderbatchs` via `getAll`, `orderBy: ['createdon desc']`, same
  pattern as `useWorkOrderList.ts`.
- A work-order-count-per-batch hook or inline logic, same shape as
  `useWorkOrderStatusCounts.ts`'s `Promise.all` — for each batch id, query
  `Cre2b_workordersService.getAll({ filter: `_cre2b_batch_value eq
  ${batchId}`, select: ['cre2b_workorderid'], count: true, top: 1 })`.
- `src/pages/BatchesPage.tsx`: a table — Batch Number (as a link, see route
  below), Created By (`createdbyname` — already on `Cre2b_workorderbatchs`,
  don't add a custom field for this, same "use Dataverse's built-in
  audit fields" rule the rest of the app follows), Created On (`createdon`),
  Work Order Count.

## 3. Batch detail page

- New route `batches/:id`. Fetch the one batch record (for the header: Batch
  Number, Created By, Created On), and fetch its work orders with
  `Cre2b_workordersService.getAll({ filter: `_cre2b_batch_value eq ${id}` })`.
- For the table of work orders in the batch, **reuse the existing
  `WorkOrderTable` component** (`src/features/dashboard/components/
  WorkOrderTable.tsx`) rather than building a new one — it already takes a
  `workOrders` array plus `serviceCenterNames`/`personnelNames` maps (build
  those the same way `DashboardPage.tsx` and `WorkOrderDetailPage.tsx`
  already do via `buildNameMap`), and already has the WO # → `/work-orders/:id`
  link you asked for, the Service Center display fix, and (once built) the
  expired-red styling — so this page gets all of that for free instead of
  duplicating it.

## 4. Routing and nav

- `src/app/router.tsx`: add `{ path: 'batches', element: <BatchesPage /> }`
  and `{ path: 'batches/:id', element: <BatchDetailPage /> }`.
- `src/app/Sidebar.tsx`: add a "Batches" nav item to `navItems`, right after
  "Batch Upload" (that's where batches originate, so keep them adjacent) —
  same `NavLink` + Regular/Filled Fluent icon pair pattern as the existing
  four items. Pick an icon that reads as "grouped items" (e.g.
  `Layer20Regular`/`Layer20Filled` from `@fluentui/react-icons`, or similar —
  whatever's available and reads clearly).

## Before you start

Fully specified — build all four pieces. Nothing here needs a decision from
me first.
