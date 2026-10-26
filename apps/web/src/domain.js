export const TERMINAL_INSPECTION_STATES = new Set(["completed", "cancelled"]);
export const TERMINAL_ACTION_STATES = new Set(["resolved", "verified", "cancelled"]);
export const TERMINAL_FINDING_STATES = new Set(["resolved", "verified", "dismissed"]);

function time(value) {
  const result = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(result) ? result : NaN;
}

export function isInspectionOverdue(inspection, asOf = new Date()) {
  if (!inspection || TERMINAL_INSPECTION_STATES.has(inspection.status) || !inspection.dueAt) return false;
  const due = time(inspection.dueAt);
  const now = time(asOf);
  return Number.isFinite(due) && Number.isFinite(now) && due < now;
}

export function isActionOverdue(action, asOf = new Date()) {
  if (!action || TERMINAL_ACTION_STATES.has(action.status) || !action.dueAt) return false;
  const due = time(action.dueAt);
  const now = time(asOf);
  return Number.isFinite(due) && Number.isFinite(now) && due < now;
}

export function calculateKpis(data, options = {}) {
  const asOf = options.asOf ? new Date(options.asOf) : new Date();
  const monthStart = new Date(asOf.getFullYear(), asOf.getMonth(), 1);
  const nextMonthStart = new Date(asOf.getFullYear(), asOf.getMonth() + 1, 1);
  const periodStart = options.periodStart ? new Date(options.periodStart) : monthStart;
  const periodEnd = options.periodEnd ? new Date(options.periodEnd) : nextMonthStart;
  const inspections = Array.isArray(data?.inspections) ? data.inspections : [];
  const findings = Array.isArray(data?.findings) ? data.findings : [];
  const actions = Array.isArray(data?.actions) ? data.actions : [];

  const dueCohort = inspections.filter((item) => {
    if (!item?.dueAt || item.status === "cancelled") return false;
    const due = time(item.dueAt);
    return Number.isFinite(due) && due >= time(periodStart) && due < time(periodEnd) && due < time(asOf);
  });
  const completed = dueCohort.filter((item) => {
    return item.status === "completed" && item.completedAt && time(item.completedAt) <= time(asOf);
  });
  const onTime = completed.filter((item) => time(item.completedAt) <= time(item.dueAt));
  let requiredChecks = 0;
  let completedChecks = 0;
  for (const inspection of inspections) {
    if (inspection.status === "cancelled") continue;
    for (const check of (inspection.checklist || [])) {
      if (check.required === false) continue;
      requiredChecks += 1;
      if (check.status === "done" || check.status === "not_applicable") completedChecks += 1;
    }
  }
  const openFindings = findings.filter((item) => !TERMINAL_FINDING_STATES.has(item.status));
  const overdueInspections = inspections.filter((item) => isInspectionOverdue(item, asOf));
  const overdueActions = actions.filter((item) => isActionOverdue(item, asOf));
  const openActions = actions.filter((item) => !TERMINAL_ACTION_STATES.has(item.status));

  return {
    dueInspections: dueCohort.length,
    completedInspections: completed.length,
    completionRate: dueCohort.length ? completed.length / dueCohort.length : null,
    onTimeCount: onTime.length,
    onTimeRate: dueCohort.length ? onTime.length / dueCohort.length : null,
    overdueInspections: overdueInspections.length,
    criticalOpenFindings: openFindings.filter((item) => item.severity === "critical").length,
    overdueActions: overdueActions.length,
    openActions: openActions.length,
    checklistCompleted: completedChecks,
    checklistRequired: requiredChecks,
    checklistCompletionRate: requiredChecks ? completedChecks / requiredChecks : null,
    openFindings: openFindings.length
  };
}

export function transitionInspection(inspection, targetState, now = new Date()) {
  if (!inspection) throw new Error("Inspection not found.");
  const timestamp = new Date(now).toISOString();
  if (targetState === "in_progress" && inspection.status === "scheduled") {
    return { ...inspection, status: "in_progress", startedAt: timestamp, version: (inspection.version || 1) + 1 };
  }
  if (targetState === "completed" && inspection.status === "in_progress") {
    const required = (inspection.checklist || []).filter((item) => item.required !== false);
    if (!required.length || required.some((item) => !["done", "not_applicable"].includes(item.status))) {
      throw new Error("Complete every required checklist item before completing this inspection.");
    }
    return { ...inspection, status: "completed", completedAt: timestamp, version: (inspection.version || 1) + 1 };
  }
  throw new Error("This inspection transition is not allowed.");
}

export function closeAction(action, resolutionNote, now = new Date()) {
  if (!action) throw new Error("Corrective action not found.");
  if (TERMINAL_ACTION_STATES.has(action.status)) throw new Error("This corrective action is already closed.");
  const note = String(resolutionNote || "").trim();
  if (note.length < 8) throw new Error("Add a resolution note of at least 8 characters.");
  return {
    ...action,
    status: "resolved",
    resolvedAt: new Date(now).toISOString(),
    resolutionNote: note,
    version: (action.version || 1) + 1
  };
}

export function verifyFinding(finding, linkedActions, verificationNote, now = new Date()) {
  if (!finding) throw new Error("Finding not found.");
  if (TERMINAL_FINDING_STATES.has(finding.status)) throw new Error("This finding is already in a terminal state.");
  const actions = Array.isArray(linkedActions) ? linkedActions : [];
  if (actions.some((item) => !["resolved", "verified"].includes(item.status))) {
    throw new Error("Resolve all linked corrective actions before verifying this finding.");
  }
  const note = String(verificationNote || "").trim();
  if (note.length < 8) throw new Error("Add an effectiveness verification note of at least 8 characters.");
  return {
    ...finding,
    status: "verified",
    verifiedAt: new Date(now).toISOString(),
    verificationNote: note,
    version: (finding.version || 1) + 1
  };
}

function csvCell(value) {
  let text = value == null ? "" : String(value);
  // Prevent formula execution when text fields are opened in spreadsheet software.
  if (typeof value === "string" && /^[\t\r ]*[=+@]/.test(text)) text = "'" + text;
  if (typeof value === "string" && /^-[0-9]/.test(text)) {
    // Preserve ordinary negative numeric-looking text as a safe literal.
    text = "'" + text;
  }
  return '"' + text.replace(/"/g, '""') + '"';
}

export function toCsv(columns, rows) {
  const header = columns.map((column) => csvCell(column.label)).join(",");
  const body = (rows || []).map((row) => columns.map((column) => csvCell(row[column.key])).join(","));
  return [header, ...body].join("\r\n");
}
