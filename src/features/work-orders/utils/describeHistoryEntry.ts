const TO_STATUS_SENTENCE: Record<string, string> = {
  Assigned: 'Assigned the work order',
  Accepted: 'Accepted the work order',
  Scheduled: 'Scheduled the work order',
  OnSite: 'Marked the work order as on-site',
  ReturnVisit: 'Flagged the work order for a return visit',
  'Closed-Completed': 'Closed the work order as completed',
  'Closed-Canceled': 'Closed the work order as canceled',
};

/**
 * Builds a plain-English description of a WorkOrderStatusHistory row, e.g.
 * "Marked the work order as on-site" or "Moved the work order from Scheduled
 * to OnSite" — mirroring the TSR app's phrasing instead of a generic
 * "Status Change" / "Update" placeholder.
 */
export function describeHistoryEntry(params: {
  actionType: string | undefined;
  fromStatus: string | undefined;
  toStatus: string | undefined;
  comment: string | undefined;
}): string {
  const { actionType, fromStatus, toStatus, comment } = params;

  if (actionType === 'Transfer' || actionType === 'Reassign') {
    return comment || 'Reassigned the work order';
  }

  if (actionType === 'Comment/Update') {
    return comment || 'Added an update';
  }

  // 'Status Change' and anything else with a recognizable to-status.
  if (toStatus) {
    const base = TO_STATUS_SENTENCE[toStatus] ?? `Updated the work order to ${toStatus}`;
    return fromStatus && fromStatus !== toStatus
      ? `Moved the work order from ${fromStatus} to ${toStatus}`
      : base;
  }

  return comment || 'Updated the work order';
}
