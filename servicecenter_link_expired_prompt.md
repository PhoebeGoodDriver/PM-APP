# PM App — Service Center Info Link + Expired Date Highlight

Two small, unrelated changes.

## 1. Replace Contact Name/Phone with a Service Center Info link

Today `src/features/service-centers/components/ServiceCenterReadOnlyCard.tsx`
(shown in step 1 of Create Work Order once a service center is picked) has
three `ReadOnlyField`s in a `repeat(3, 1fr)` grid: Address, Contact Name
(`cre2b_wocontactname`), Contact Phone (`cre2b_wocontactphone`). This is the
only place those two fields are rendered anywhere in the app (confirmed —
`cre2b_wocontactname`/`cre2b_wocontactphone` don't appear elsewhere), so this
is a single-file change.

- Drop the Contact Name and Contact Phone `ReadOnlyField`s.
- In their place, add a link out to the FedEx intranet's Service Center Info
  page, built from the service center's alpha code
  (`cre2b_locationalphacode`):
  `https://eai3534679.prod.cloud.fedex.com/fxfIntranet/servlet/ServiceCenterInfo?Action=SCDisplay&SCID={alphaCode}`
  — e.g. alpha code `BHM` → `...&SCID=BHM`, alpha code `MEM` → `...&SCID=MEM`.
- Add a small util for this, mirroring the existing
  `src/features/work-orders/utils/buildGoogleMapsLink.ts` pattern — something
  like `buildServiceCenterInfoLink(alphaCode: string | undefined): string |
  null`, returning `null` when the alpha code is missing/blank so the UI can
  fall back to `—` instead of rendering a broken link (some service centers
  may not have one set).
- Render it the same way the Address field already does — a Fluent `Link`
  with `target="_blank" rel="noreferrer"` — labeled something like "Service
  Center Info".
- Since the card goes from 3 fields to 2, change the grid from
  `repeat(3, 1fr)` to `repeat(2, 1fr)` so it doesn't leave an empty column.

## 2. Dashboard: flag expired work orders in red

`src/features/dashboard/components/WorkOrderTable.tsx`'s "Expires" column
just renders the date today, no matter how far in the past it is:

```
{wo.cre2b_expirationdate
  ? new Date(wo.cre2b_expirationdate).toLocaleDateString()
  : '—'}
```

- When `cre2b_expirationdate` is before today, render that cell's text in
  red — use `tokens.colorPaletteRedForeground1`, the same token
  `ValidationPreviewTable.tsx` already uses for error text, so it matches the
  rest of the app rather than introducing a new red.
- Compare by calendar date, not exact timestamp (strip time off both sides
  before comparing) — a WO expiring "today" shouldn't flip to red at 12:01am
  local time due to a timezone quirk.
- Default I'm building to: only flag it red while the work order is still
  open — i.e. skip the red styling when status is `Closed-Completed` or
  `Closed-Canceled` (`STATUS_COLOR` in the same file already has this status
  set). An already-closed job with a stale expiration date isn't an urgent
  signal the same way an open one is. Say so if you'd rather it stay red
  regardless of status.
- Scoped to the dashboard table only, as asked — the detail page's
  Expiration Date field (`WorkOrderHeader.tsx`) isn't part of this change
  unless you want it there too.

## Before you start

Both are fully specified — build them. The one thing to flag back if you
disagree: whether "expired" should still show red after a work order is
closed (see point 2's default above).
