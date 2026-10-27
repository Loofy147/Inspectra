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
    openFindings: openFindings.length,
    openActionsMissingOwner: openActions.filter((item) => !String(item.owner || "").trim()).length,
    openActionsMissingDueDate: openActions.filter((item) => !item.dueAt || !Number.isFinite(time(item.dueAt))).length,
    openFindingsMissingOwner: openFindings.filter((item) => !String(item.owner || "").trim()).length,
    inspectionOwnerCoverageRate: inspections.filter((item) => item.status !== "cancelled").length
      ? inspections.filter((item) => item.status !== "cancelled" && String(item.owner || "").trim()).length /
        inspections.filter((item) => item.status !== "cancelled").length
      : null
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
  if (typeof value === "string" && /^[\t\r ]*[=+\-@]/.test(text)) text = "'" + text;
  if (typeof value === "string" && /^-[0-9]/.test(text)) {
    // Preserve ordinary negative numeric-looking text as a safe literal.
    text = "'" + text;
  }
  return '"' + text.replace(/"/g, '""') + '"';
}



const WORKSPACE_COLLECTION_RULES = {
  sites: { label: "Site", page: "sites", required: ["name"] },
  assets: { label: "Asset", page: "sites", required: ["name", "siteId", "type", "criticality", "status"], dates: ["nextCheckAt"] },
  inspections: { label: "Inspection", page: "inspections", required: ["title", "siteId", "owner", "dueAt", "status"], dates: ["dueAt", "createdAt", "startedAt", "completedAt"], arrays: ["checklist"] },
  findings: { label: "Finding", page: "findings", required: ["title", "siteId", "owner", "severity", "status", "openedAt", "dueAt"], dates: ["openedAt", "dueAt", "verifiedAt"], arrays: ["actionIds"] },
  actions: { label: "Corrective action", page: "findings", required: ["title", "owner", "openedAt", "dueAt", "status"], dates: ["openedAt", "dueAt", "resolvedAt"] },
  risks: { label: "Risk", page: "risk", required: ["title", "siteId", "category", "owner", "status", "lastReviewedAt", "control"], dates: ["lastReviewedAt"] },
  audits: { label: "Audit", page: "audits", required: ["title", "scope", "criteria", "owner", "dueAt", "status"], dates: ["dueAt", "startedAt", "completedAt"], arrays: ["checklist"] },
  requirements: { label: "Requirement", page: "audits", required: ["title", "owner", "status", "evidence"] },
  people: { label: "Person", page: "people", required: ["name", "role", "siteId", "status"] },
  contractors: { label: "Supplier / contractor", page: "people", required: ["name", "service", "siteId", "credentialDueAt", "status"], dates: ["credentialDueAt"] },
  reviews: { label: "Management review", page: "reviews", required: ["title", "period", "scheduledAt", "chair", "status"], dates: ["scheduledAt", "startedAt", "completedAt", "createdAt"], arrays: ["decisionActionIds"] },
  activity: { label: "Activity event", page: "system", required: ["at", "actor", "action", "entityType", "entityId", "summary"], dates: ["at"] }
};

const WORKSPACE_RELATIONS = [
  { collection: "assets", field: "siteId", target: "sites", required: true },
  { collection: "inspections", field: "siteId", target: "sites", required: true },
  { collection: "inspections", field: "assetId", target: "assets", required: false },
  { collection: "findings", field: "siteId", target: "sites", required: true },
  { collection: "findings", field: "assetId", target: "assets", required: false },
  { collection: "risks", field: "siteId", target: "sites", required: true },
  { collection: "people", field: "siteId", target: "sites", required: true },
  { collection: "contractors", field: "siteId", target: "sites", required: true },
  { collection: "actions", field: "findingId", target: "findings", required: false },
  { collection: "actions", field: "reviewId", target: "reviews", required: false }
];

function isNonEmpty(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function isValidCalendarDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + "T00:00:00.000Z");
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function validateWorkspaceData(data) {
  const issues = [];
  const collections = Object.keys(WORKSPACE_COLLECTION_RULES);
  const recordsByCollection = new Map();
  const idsByCollection = new Map();
  const globalIds = new Map();
  let recordCount = 0;

  const addIssue = (collection, record, code, field, message, recommendation) => {
    const rule = WORKSPACE_COLLECTION_RULES[collection] || { label: collection, page: "system" };
    issues.push({
      code,
      collection,
      recordType: rule.label,
      recordId: String(record?.id || "(missing ID)"),
      field: field || "",
      page: rule.page,
      message,
      recommendation
    });
  };

  for (const collection of collections) {
    const rows = data && Array.isArray(data[collection]) ? data[collection] : null;
    recordsByCollection.set(collection, rows || []);
    if (!rows) {
      addIssue(collection, null, "invalid_collection", collection,
        "The " + collection + " register is missing or is not a list.",
        "Restore the register as a list before editing records.");
      idsByCollection.set(collection, new Map());
      continue;
    }
    const rule = WORKSPACE_COLLECTION_RULES[collection];
    const ids = new Map();
    idsByCollection.set(collection, ids);
    for (const record of rows) {
      recordCount += 1;
      if (!record || typeof record !== "object" || Array.isArray(record)) {
        addIssue(collection, null, "invalid_record", "", "A record is not a valid object.",
          "Restore the record fields or remove the malformed sample entry.");
        continue;
      }
      if (!isNonEmpty(record.id)) {
        addIssue(collection, record, "missing_id", "id", rule.label + " has no stable ID.",
          "Assign a unique ID before using this record.");
      } else {
        const id = String(record.id).trim();
        if (ids.has(id)) {
          addIssue(collection, record, "duplicate_id", "id", "ID " + id + " is duplicated in the " + rule.label.toLowerCase() + " register.",
            "Give this record a new unique ID and update any linked references.");
        } else {
          ids.set(id, record);
        }
        if (globalIds.has(id)) {
          const first = globalIds.get(id);
          addIssue(collection, record, "duplicate_global_id", "id", "ID " + id + " is already used by a " + first.label.toLowerCase() + ".",
            "Use a unique ID across record types and repair links that depend on it.");
        } else {
          globalIds.set(id, { collection, label: rule.label });
        }
      }
      for (const field of rule.required || []) {
        if (!isNonEmpty(record[field])) {
          addIssue(collection, record, "missing_required_field", field,
            rule.label + " is missing " + field + ".",
            "Enter a value for " + field + " and save the record again.");
        }
      }
      for (const field of rule.dates || []) {
        if (record[field] === null || record[field] === undefined || record[field] === "") continue;
        if (!Number.isFinite(time(record[field]))) {
          addIssue(collection, record, "invalid_date", field,
            rule.label + " has an invalid " + field + " date.",
            "Enter a real date and time, then save the record again.");
        }
      }
      for (const field of rule.arrays || []) {
        if (!Array.isArray(record[field])) {
          addIssue(collection, record, "invalid_list", field,
            rule.label + " must contain a " + field + " list.",
            "Restore the list before adding or changing linked items.");
        }
      }
      if (collection === "reviews" && isNonEmpty(record.period) && !/^\d{4}-(0[1-9]|1[0-2])$/.test(String(record.period))) {
        addIssue(collection, record, "invalid_period", "period", "Management review period must use YYYY-MM.",
          "Choose a valid calendar month, for example 2026-10.");
      }
      if (collection === "inspections" || collection === "audits") {
        if (Array.isArray(record.checklist)) {
          const seenChecks = new Set();
          record.checklist.forEach((check, index) => {
            const location = "checklist[" + (index + 1) + "]";
            if (!check || typeof check !== "object") {
              addIssue(collection, record, "invalid_checklist_item", "checklist", location + " is malformed.",
                "Restore the checklist item or recreate the checklist.");
              return;
            }
            if (!isNonEmpty(check.id) || !isNonEmpty(check.label)) {
              addIssue(collection, record, "incomplete_checklist_item", "checklist", location + " is missing an ID or label.",
                "Give each checklist item a stable ID and a descriptive label.");
            }
            if (isNonEmpty(check.id) && seenChecks.has(String(check.id))) {
              addIssue(collection, record, "duplicate_checklist_id", "checklist", location + " repeats checklist ID " + check.id + ".",
                "Make each checklist item ID unique within this record.");
            }
            if (isNonEmpty(check.id)) seenChecks.add(String(check.id));
            if (!["open", "done", "not_applicable"].includes(check.status)) {
              addIssue(collection, record, "invalid_checklist_state", "checklist",
                location + " has an unsupported state.",
                "Use Open, Done or Not applicable for checklist state.");
            }
          });
        }
      }
    }
  }

  const collectionMaps = new Map();
  for (const collection of collections) {
    collectionMaps.set(collection, new Map((recordsByCollection.get(collection) || [])
      .filter((record) => record && typeof record === "object" && isNonEmpty(record.id))
      .map((record) => [String(record.id), record])));
  }

  for (const relation of WORKSPACE_RELATIONS) {
    const rows = recordsByCollection.get(relation.collection) || [];
    const targets = collectionMaps.get(relation.target) || new Map();
    for (const record of rows) {
      if (!record || typeof record !== "object") continue;
      const value = record[relation.field];
      if (!isNonEmpty(value)) {
        if (relation.required) addIssue(relation.collection, record, "missing_relation", relation.field,
          WORKSPACE_COLLECTION_RULES[relation.collection].label + " references no " + WORKSPACE_COLLECTION_RULES[relation.target].label.toLowerCase() + ".",
          "Choose an existing " + WORKSPACE_COLLECTION_RULES[relation.target].label.toLowerCase() + " record.");
        continue;
      }
      const target = targets.get(String(value));
      if (!target) {
        addIssue(relation.collection, record, "broken_relation", relation.field,
          relation.field + " refers to a missing " + WORKSPACE_COLLECTION_RULES[relation.target].label.toLowerCase() + " (" + value + ").",
          "Select a record that exists in the " + relation.target + " register or restore the missing linked record.");
        continue;
      }
      if (relation.field === "assetId" && record.siteId && target.siteId && record.siteId !== target.siteId) {
        addIssue(relation.collection, record, "site_asset_mismatch", relation.field,
          "The linked asset belongs to a different site than this " + WORKSPACE_COLLECTION_RULES[relation.collection].label.toLowerCase() + ".",
          "Choose an asset from the same site or correct the site assignment.");
      }
    }
  }

  for (const finding of recordsByCollection.get("findings") || []) {
    if (!finding || typeof finding !== "object" || !Array.isArray(finding.actionIds)) continue;
    const actionMap = collectionMaps.get("actions") || new Map();
    for (const actionId of finding.actionIds) {
      const action = actionMap.get(String(actionId));
      if (!action) {
        addIssue("findings", finding, "broken_action_link", "actionIds",
          "The finding links to a missing corrective action (" + actionId + ").",
          "Restore the action or remove the stale link after confirming the relationship.");
      } else if (action.findingId !== finding.id) {
        addIssue("findings", finding, "inconsistent_action_link", "actionIds",
          "The linked action does not point back to this finding.",
          "Correct the finding/action links so both records reference one another.");
      }
    }
  }

  for (const review of recordsByCollection.get("reviews") || []) {
    if (!review || typeof review !== "object" || !Array.isArray(review.decisionActionIds)) continue;
    const actionMap = collectionMaps.get("actions") || new Map();
    for (const actionId of review.decisionActionIds) {
      const action = actionMap.get(String(actionId));
      if (!action) {
        addIssue("reviews", review, "broken_follow_up_link", "decisionActionIds",
          "The review links to a missing follow-up action (" + actionId + ").",
          "Restore the action or remove the stale link after confirming the review decision.");
      } else if (action.reviewId && action.reviewId !== review.id) {
        addIssue("reviews", review, "inconsistent_follow_up_link", "decisionActionIds",
          "The linked action points to a different management review.",
          "Correct the review/action links so both records reference the same review.");
      }
    }
  }

  const entityCollections = {
    site: "sites", asset: "assets", inspection: "inspections", finding: "findings", action: "actions",
    risk: "risks", audit: "audits", requirement: "requirements", person: "people",
    contractor: "contractors", supplier: "contractors", management_review: "reviews", review: "reviews"
  };
  const activity = recordsByCollection.get("activity") || [];
  for (const event of activity) {
    if (!event || typeof event !== "object" || !entityCollections[event.entityType]) continue;
    const targetMap = collectionMaps.get(entityCollections[event.entityType]) || new Map();
    if (!targetMap.has(String(event.entityId))) {
      addIssue("activity", event, "broken_activity_link", "entityId",
        "This activity event refers to a missing " + WORKSPACE_COLLECTION_RULES[entityCollections[event.entityType]].label.toLowerCase() + " (" + event.entityId + ").",
        "Restore the referenced record or mark the historical event as referring to an archived record.");
    }
  }

  return {
    recordCount,
    issueCount: issues.length,
    valid: issues.length === 0,
    issues,
    byCode: issues.reduce((counts, issue) => {
      counts[issue.code] = (counts[issue.code] || 0) + 1;
      return counts;
    }, {})
  };
}

export function isValidDateInput(value) {
  return isValidCalendarDate(value);
}

const SEARCHABLE_COLLECTIONS = [
  { key: "inspections", type: "Inspection", page: "inspections", openType: "inspection" },
  { key: "findings", type: "Finding", page: "findings", openType: "finding" },
  { key: "actions", type: "Corrective action", page: "findings", openType: "action" },
  { key: "audits", type: "Audit", page: "audits", openType: "audit" },
  { key: "reviews", type: "Management review", page: "reviews", openType: "review" },
  { key: "sites", type: "Site", page: "sites", openType: null },
  { key: "assets", type: "Asset", page: "sites", openType: null },
  { key: "risks", type: "Risk", page: "risk", openType: null },
  { key: "people", type: "Person", page: "people", openType: null },
  { key: "contractors", type: "Supplier / contractor", page: "people", openType: null },
  { key: "requirements", type: "Requirement", page: "audits", openType: null }
];

function collectSearchText(value, output = [], seen = new Set()) {
  if (typeof value === "string" || typeof value === "number") {
    output.push(String(value));
    return output;
  }
  if (!value || typeof value !== "object" || seen.has(value)) return output;
  seen.add(value);
  if (Array.isArray(value)) {
    for (const item of value) collectSearchText(item, output, seen);
  } else {
    for (const item of Object.values(value)) collectSearchText(item, output, seen);
  }
  return output;
}

export function searchWorkspaceRecords(data, query) {
  const needle = String(query || "").trim().toLocaleLowerCase();
  if (!needle || !data || typeof data !== "object") return [];
  const sitesById = new Map((Array.isArray(data.sites) ? data.sites : []).map((site) => [site.id, site.name]));
  const matches = [];
  for (const collection of SEARCHABLE_COLLECTIONS) {
    const records = Array.isArray(data[collection.key]) ? data[collection.key] : [];
    for (const record of records) {
      const siteName = sitesById.get(record.siteId) || "";
      const searchable = collectSearchText(record).concat(siteName).join(" ").toLocaleLowerCase();
      if (!searchable.includes(needle)) continue;
      matches.push({
        type: collection.type,
        page: collection.page,
        openType: collection.openType,
        id: String(record.id || record.name || collection.type),
        title: String(record.title || record.name || record.id || collection.type),
        owner: String(record.owner || record.manager || record.chair || ""),
        status: String(record.status || ""),
        dueAt: record.dueAt || record.nextCheckAt || "",
        siteName,
        record
      });
    }
  }
  return matches;
}

export function toCsv(columns, rows) {
  const header = columns.map((column) => csvCell(column.label)).join(",");
  const body = (rows || []).map((row) => columns.map((column) => csvCell(row[column.key])).join(","));
  return [header, ...body].join("\r\n");
}

export function startManagementReview(review, now = new Date()) {
  if (!review) throw new Error("Management review not found.");
  if (review.status !== "scheduled") throw new Error("Only a scheduled review can be started.");
  return {
    ...review,
    status: "in_progress",
    startedAt: new Date(now).toISOString(),
    version: (review.version || 1) + 1
  };
}

export function completeManagementReview(review, minutes, now = new Date()) {
  if (!review) throw new Error("Management review not found.");
  if (review.status !== "in_progress") throw new Error("Only an in-progress review can be completed.");
  const summary = String(minutes || "").trim();
  if (summary.length < 20) throw new Error("Record review minutes of at least 20 characters.");
  return {
    ...review,
    status: "completed",
    completedAt: new Date(now).toISOString(),
    minutes: summary,
    version: (review.version || 1) + 1
  };
}

export function createManagementFollowUp(review, input, id, now = new Date()) {
  if (!review) throw new Error("Management review not found.");
  if (review.status !== "in_progress") throw new Error("Follow-up decisions can only be added to an in-progress review.");
  const title = String(input?.title || "").trim();
  const owner = String(input?.owner || "").trim();
  const dueAt = input?.dueAt;
  const dueMs = dueAt ? new Date(dueAt).getTime() : NaN;
  if (title.length < 4) throw new Error("Follow-up title must be at least 4 characters.");
  if (!owner) throw new Error("A follow-up owner is required.");
  if (!id || typeof id !== "string") throw new Error("A stable follow-up ID is required.");
  if (!Number.isFinite(dueMs)) throw new Error("A valid follow-up due date is required.");
  const createdAt = new Date(now).toISOString();
  return {
    id,
    title,
    reviewId: review.id,
    sourceType: "management_review",
    findingId: null,
    owner,
    priority: ["Critical", "High", "Medium", "Low"].includes(input?.priority) ? input.priority : "Medium",
    openedAt: createdAt,
    dueAt: new Date(dueMs).toISOString(),
    status: "open",
    version: 1
  };
}

export function isAuditOverdue(audit, asOf = new Date()) {
  if (!audit || ["completed", "cancelled"].includes(audit.status) || !audit.dueAt) return false;
  const due = time(audit.dueAt);
  const now = time(asOf);
  return Number.isFinite(due) && Number.isFinite(now) && due < now;
}

export function transitionAudit(audit, targetState, completionNote = "", now = new Date()) {
  if (!audit) throw new Error("Audit record not found.");
  const timestamp = new Date(now).toISOString();
  if (targetState === "in_progress" && audit.status === "scheduled") {
    return { ...audit, status: "in_progress", startedAt: timestamp, version: (audit.version || 1) + 1 };
  }
  if (targetState === "completed" && audit.status === "in_progress") {
    const required = (audit.checklist || []).filter((item) => item.required !== false);
    if (!required.length || required.some((item) => !["done", "not_applicable"].includes(item.status))) {
      throw new Error("Complete every required audit step before completing the audit.");
    }
    const note = String(completionNote || "").trim();
    if (note.length < 12) throw new Error("Add an audit conclusion of at least 12 characters.");
    return {
      ...audit,
      status: "completed",
      completedAt: timestamp,
      completionNote: note,
      version: (audit.version || 1) + 1
    };
  }
  throw new Error("This audit transition is not allowed.");
}
