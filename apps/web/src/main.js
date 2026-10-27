import {
  calculateKpis, closeAction, isActionOverdue, isAuditOverdue, isInspectionOverdue,
  isValidDateInput, isValidReportingMonth, searchWorkspaceRecords, toCsv, transitionAudit,
  transitionInspection, validateWorkspaceData, verifyFinding
} from "./domain.js";
import { createDemoState, dateInputAt, dateAt, makeChecklist } from "./seed.js";
import { loadWorkspace, resetWorkspace, saveWorkspace } from "./store.js";

const app = document.querySelector("#app");
let workspace = loadWorkspace();
let activePage = "overview";
let searchQuery = "";
let modalState = null;
let toastState = null;
let toastTimer = null;

const navGroups = [
  { label: "WORK", items: [
    { id: "overview", label: "Overview", icon: "grid" },
    { id: "queue", label: "Work queue", icon: "inbox", count: "queue" },
    { id: "inspections", label: "Inspections", icon: "clipboard" },
    { id: "findings", label: "Findings & actions", icon: "alert", count: "findings" },
    { id: "evidence", label: "Evidence", icon: "file" }
  ]},
  { label: "MANAGEMENT", items: [
    { id: "risk", label: "Risk & controls", icon: "shield" },
    { id: "sites", label: "Sites & assets", icon: "building" },
    { id: "audits", label: "Audit & compliance", icon: "checklist" },
    { id: "people", label: "People & suppliers", icon: "users" },
    { id: "reviews", label: "Management reviews", icon: "checklist" }
  ]},
  { label: "INSIGHT & CONTROL", items: [
    { id: "reports", label: "Reports", icon: "chart" },
    { id: "system", label: "System health", icon: "settings" }
  ]}
];

const pageMeta = {
  overview: ["Overview", "A decision-oriented snapshot of inspections, exposure and follow-up.", "MANAGEMENT SNAPSHOT"],
  queue: ["Work queue", "Work that needs an owner, review or next action.", "EXECUTION CONTROL"],
  inspections: ["Inspections", "Schedule and execute repeatable checks with required-step guardrails.", "WORK EXECUTION"],
  findings: ["Findings & actions", "Track exceptions through action closure and effectiveness verification.", "CORRECTIVE CONTROL"],
  evidence: ["Evidence", "Record provenance and link evidence references to operational records.", "EVIDENCE TRACEABILITY"],
  risk: ["Risk & controls", "Review risks and controls with an explicit, unapproved demo scoring method.", "RISK MANAGEMENT"],
  sites: ["Sites & assets", "Explore locations, equipment and linked work.", "OPERATIONAL STRUCTURE"],
  audits: ["Audit & compliance", "Coordinate audit activity and track requirements needing attention.", "ASSURANCE"],
  people: ["People & suppliers", "View demo role coverage and contractor credential states.", "READINESS"],
  reviews: ["Management reviews", "Record review minutes, decisions, accountable owners and follow-up.", "GOVERNANCE & DECISIONS"],
  reports: ["Reports", "Export visible operational records and inspect metric definitions.", "EVIDENCE & REPORTING"],
  system: ["System health", "Understand what is connected, what is local and what is not configured.", "PLATFORM STATUS"],
  search: ["Search results", "Search across the workspace registers and open a matching record.", "QUICK FIND"]
};

const iconPaths = {
  grid: "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z",
  inbox: "M4 4h16v13h-5l-2 3h-2l-2-3H4z M4 13h5l2 3h2l2-3h5",
  clipboard: "M8 4H6a2 2 0 0 0-2 2v14h16V6a2 2 0 0 0-2-2h-2 M9 3h6v4H9z M8 12h8 M8 16h6",
  alert: "M12 3 2.8 20h18.4L12 3z M12 9v5 M12 17h.01",
  shield: "M12 3 20 6v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z M8.5 12l2.2 2.2 4.8-5",
  building: "M4 21V4h11v17 M15 10h5v11 M7 8h2 M11 8h1 M7 12h2 M11 12h1 M7 16h2 M11 16h1 M9 21v-2h2v2",
  checklist: "M9 6h11 M9 12h11 M9 18h11 M3.5 6l1 1 2-2 M3.5 12l1 1 2-2 M3.5 18l1 1 2-2",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M20 8v6 M23 11h-6",
  chart: "M4 20V10 M10 20V4 M16 20v-7 M22 20H2",
  settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.5 2.6-.2-.1a1.7 1.7 0 0 0-1.9.2l-.1.1h-3l-.1-.2a1.7 1.7 0 0 0-1.6-1l-.2.1-2.6-1.5.1-.2a1.7 1.7 0 0 0-.2-1.9l-.1-.1v-3l.2-.1a1.7 1.7 0 0 0 1-1.6l-.1-.2 1.5-2.6.2.1a1.7 1.7 0 0 0 1.9-.2l.1-.1h3l.1.2a1.7 1.7 0 0 0 1.6 1l.2-.1 2.6 1.5-.1.2a1.7 1.7 0 0 0 .2 1.9l.1.1v3z",
  search: "M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z M17 17l4 4",
  plus: "M12 5v14 M5 12h14",
  close: "M6 6l12 12 M18 6 6 18",
  download: "M12 3v12 M7 10l5 5 5-5 M4 18v3h16v-3",
  arrow: "M4 12h15 M13 6l6 6-6 6",
  check: "M5 12l4 4L19 6",
  calendar: "M4 5h16v16H4z M8 3v4 M16 3v4 M4 10h16",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 7v5l4 2",
  file: "M6 2h8l4 4v16H6z M14 2v5h5 M9 12h6 M9 16h6",
  refresh: "M20 7v5h-5 M4 17v-5h5 M5.5 9A7 7 0 0 1 18 6l2 6 M4 12l2 6a7 7 0 0 0 12.5-3",
  info: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 10v5 M12 7h.01"
};

function icon(name, extra = "") {
  const path = iconPaths[name] || iconPaths.info;
  return '<svg class="' + extra + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + path + '"></path></svg>';
}
function esc(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}
function currentData() { return workspace.data; }
function findSite(id) { return currentData().sites.find((site) => site.id === id); }
function siteName(id) { return findSite(id)?.name || "Unassigned site"; }
function formatDate(value, options = {}) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", ...(options.year ? { year: "numeric" } : {}) }).format(date);
}
function formatDateTime(value) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}
function formatPercent(value) { return value == null || !Number.isFinite(value) ? "—" : Math.round(value * 100) + "%"; }
function displayStatus(value) {
  const labels = {
    in_progress: "In progress", action_required: "Action required", review_required: "Review required",
    attention_required: "Attention required", in_review: "In review", in_service: "In service",
    current: "Current", active: "Active", scheduled: "Scheduled", completed: "Completed",
    cancelled: "Cancelled", open: "Open", resolved: "Resolved", verified: "Verified",
    dismissed: "Dismissed", operational: "Operational"
  };
  return labels[value] || String(value || "Unknown").replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function pill(value) {
  const normalized = String(value || "unknown").toLowerCase().replaceAll(" ", "_");
  return '<span class="pill pill--' + esc(normalized) + '">' + esc(displayStatus(value)) + '</span>';
}
function priorityPill(value) { return pill(String(value || "medium").toLowerCase()); }
function inspectionStatus(inspection) { return isInspectionOverdue(inspection) ? "overdue" : inspection.status; }
function actionStatus(action) { return isActionOverdue(action) ? "overdue" : action.status; }
function getKpis() { return calculateKpis(currentData(), { asOf: new Date() }); }
function addActivity(action, entityType, entityId, summary) {
  const entry = {
    id: "EVT-" + String(Date.now()),
    at: new Date().toISOString(),
    actor: "Demo operator",
    action,
    entityType,
    entityId,
    summary
  };
  currentData().activity.unshift(entry);
  currentData().activity = currentData().activity.slice(0, 40);
}
function persistAndRender(message, isError = false) {
  const saved = saveWorkspace(workspace);
  showToast(saved ? message : "The browser could not save this change. Storage may be blocked or full.", !saved || isError);
  render();
}
function showToast(message, isError = false) {
  toastState = { message, isError };
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastState = null; render(); }, 3600);
}
function nextId(prefix, records) {
  const numbers = (records || []).map((item) => Number(String(item.id || "").split("-").pop())).filter(Number.isFinite);
  return prefix + "-" + String(Math.max(0, ...numbers) + 1).padStart(4, "0");
}

function dateAtLocalHour(dateInput, hour, label) {
  if (!isValidDateInput(dateInput)) throw new Error("Choose a real calendar date for " + label + ".");
  const parsed = new Date(dateInput + "T" + String(hour).padStart(2, "0") + ":00:00");
  if (!Number.isFinite(parsed.getTime())) throw new Error("Choose a valid date for " + label + ".");
  return parsed.toISOString();
}

function assertCandidateIntegrity(candidateData, touchedRecords) {
  const touched = new Set(touchedRecords.map((item) => item.collection + ":" + item.id));
  const result = validateWorkspaceData(candidateData);
  const blocking = result.issues.filter((issue) => touched.has(issue.collection + ":" + issue.recordId));
  if (!blocking.length) return;
  const messages = blocking.slice(0, 3).map((issue) => issue.message + " " + issue.recommendation);
  if (blocking.length > 3) messages.push((blocking.length - 3) + " additional record-integrity issue(s).");
  throw new Error("This record cannot be saved yet. " + messages.join(" "));
}
function pageHeading(title, subtitle, eyebrow, actions = "") {
  return '<div class="page-heading"><div><div class="eyebrow">' + esc(eyebrow) + '</div><h1>' + esc(title) + '</h1><p class="page-subtitle">' + esc(subtitle) + '</p></div><div class="heading-actions">' + actions + '</div></div>';
}
function button(label, attrs = "", kind = "") {
  return '<button type="button" class="button ' + kind + '" ' + attrs + '>' + label + '</button>';
}
function panel(title, subtitle, body, action = "") {
  return '<section class="panel"><div class="panel-header"><div><div class="panel-title">' + esc(title) + '</div>' +
    (subtitle ? '<div class="panel-subtitle">' + esc(subtitle) + '</div>' : '') +
    '</div>' + action + '</div>' + body + '</section>';
}
function metricCard(label, value, detail, iconName, tone = "") {
  return '<article class="metric-card ' + tone + '"><div class="metric-top"><div class="metric-label">' + esc(label) +
    '</div><div class="metric-icon">' + icon(iconName) + '</div></div><div class="metric-value">' + esc(value) +
    '</div><div class="metric-detail">' + esc(detail) + '</div></article>';
}
function emptyState(title, description) {
  return '<div class="empty-state"><strong>' + esc(title) + '</strong>' + esc(description) + '</div>';
}
function recentActivity(limit = 5) {
  const rows = currentData().activity.slice().sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, limit);
  if (!rows.length) return emptyState("No activity recorded", "State changes in this demo will appear here.");
  return '<div class="activity-list">' + rows.map((entry) =>
    '<div class="activity-row"><div class="activity-mark">' + esc((entry.entityType || "event").slice(0, 1).toUpperCase()) +
    '</div><div class="activity-copy"><div class="activity-text"><strong>' + esc(entry.entityId) + '</strong> · ' + esc(entry.summary) +
    '</div><div class="activity-time">' + esc(formatDateTime(entry.at)) + ' · Demo-local activity</div></div></div>'
  ).join("") + '</div>';
}
function getSearchText(item) {
  const values = [];
  const collect = (value) => {
    if (typeof value === "string" || typeof value === "number") values.push(String(value));
    else if (Array.isArray(value)) value.forEach(collect);
    else if (value && typeof value === "object") Object.values(value).forEach(collect);
  };
  collect(item);
  return values.join(" ").toLowerCase();
}
function applySearch(items) {
  if (!searchQuery.trim()) return items;
  const needle = searchQuery.trim().toLowerCase();
  return items.filter((item) => getSearchText(item).includes(needle) || siteName(item.siteId).toLowerCase().includes(needle));
}
function tableMessage(items) {
  return items.length ? "" : emptyState(searchQuery ? "No matching records" : "No records to show", searchQuery ? "Try another search term." : "There is nothing in this list yet.");
}
function dateCell(value) {
  return '<span>' + esc(formatDate(value, { year: true })) + '</span>';
}
function inspectionRow(item) {
  const status = inspectionStatus(item);
  const done = (item.checklist || []).filter((c) => c.status === "done" || c.status === "not_applicable").length;
  const total = (item.checklist || []).filter((c) => c.required !== false).length;
  return '<tr><td><div class="primary-cell">' + esc(item.title) + '</div><div class="secondary-cell">' + esc(item.id) + '</div></td>' +
    '<td>' + esc(siteName(item.siteId)) + '</td><td>' + esc(item.owner || "Unassigned") + '</td>' +
    '<td>' + dateCell(item.dueAt) + '</td><td>' + pill(status) + '</td><td>' + done + ' / ' + total + '</td>' +
    '<td><button class="link-button" data-open-inspection="' + esc(item.id) + '">Open record ' + icon("arrow") + '</button></td></tr>';
}
function findingRow(item) {
  return '<tr><td><div class="primary-cell">' + esc(item.title) + '</div><div class="secondary-cell">' + esc(item.id) + '</div></td>' +
    '<td>' + pill(item.severity) + '</td><td>' + esc(siteName(item.siteId)) + '</td><td>' + esc(item.owner || "Unassigned") + '</td>' +
    '<td>' + dateCell(item.dueAt) + '</td><td>' + pill(item.status) + '</td>' +
    '<td><button class="link-button" data-open-finding="' + esc(item.id) + '">Review ' + icon("arrow") + '</button></td></tr>';
}
function actionRow(item, compact = false) {
  return '<tr><td><div class="primary-cell">' + esc(item.title) + '</div><div class="secondary-cell">' + esc(item.id) + '</div></td>' +
    (compact ? '' : '<td>' + esc(item.owner || "Unassigned") + '</td>') +
    '<td>' + dateCell(item.dueAt) + '</td><td>' + priorityPill(item.priority) + '</td><td>' + pill(actionStatus(item)) + '</td>' +
    '<td><button class="link-button" data-open-action="' + esc(item.id) + '">Open ' + icon("arrow") + '</button></td></tr>';
}

function renderOverview() {
  const d = currentData();
  const k = getKpis();
  const totalInspections = d.inspections.filter((i) => i.status !== "cancelled").length || 1;
  const stateDefs = [
    ["Scheduled", d.inspections.filter((i) => i.status === "scheduled").length, ""],
    ["In progress", d.inspections.filter((i) => i.status === "in_progress").length, "progress"],
    ["Completed", d.inspections.filter((i) => i.status === "completed").length, "done"],
    ["Overdue", k.overdueInspections, "late"]
  ];
  const actions = '<button class="button button-primary" data-create-inspection>' + icon("plus") + ' New inspection</button>';
  const attention = [];
  d.findings.filter((f) => f.severity === "critical" && !["verified", "resolved", "dismissed"].includes(f.status)).forEach((f) =>
    attention.push({ priority: 0, id: f.id, title: f.title, meta: siteName(f.siteId) + " · Critical finding", kind: "finding" }));
  d.inspections.filter((i) => isInspectionOverdue(i)).forEach((i) =>
    attention.push({ priority: 1, id: i.id, title: i.title, meta: siteName(i.siteId) + " · Inspection overdue", kind: "inspection" }));
  d.actions.filter((a) => isActionOverdue(a)).forEach((a) =>
    attention.push({ priority: 2, id: a.id, title: a.title, meta: a.owner + " · Corrective action overdue", kind: "action" }));
  attention.sort((a, b) => a.priority - b.priority);
  const attentionHTML = attention.length ? '<div class="exception-list">' + attention.slice(0, 5).map((item) =>
    '<div class="exception-row"><div class="exception-copy"><div class="exception-title"><span class="exception-bullet"></span>' + esc(item.title) +
    '</div><div class="exception-meta">' + esc(item.id + " · " + item.meta) + '</div></div>' +
    pill(item.priority === 0 ? "critical" : "overdue") + '</div>'
  ).join("") + '</div>' : emptyState("No active exceptions in the sample", "This does not establish that a real site is safe.");
  return pageHeading("Overview", "A decision-oriented snapshot of inspections, exposure and follow-up.", "MANAGEMENT SNAPSHOT", actions) +
    '<div class="metric-grid">' +
    metricCard("Inspection completion", formatPercent(k.completionRate), k.completedInspections + " of " + k.dueInspections + " due this month completed", "check", "tone-good") +
    metricCard("On-time completion", formatPercent(k.onTimeRate), k.onTimeCount + " on-time completions in this month-to-date cohort", "clock", "") +
    metricCard("Overdue inspections", String(k.overdueInspections), "Open scheduled work past its due time", "calendar", k.overdueInspections ? "tone-warn" : "") +
    metricCard("Critical open findings", String(k.criticalOpenFindings), "Unresolved critical-severity demo records", "alert", k.criticalOpenFindings ? "tone-alert" : "") +
    metricCard("Overdue actions", String(k.overdueActions), "Open corrective actions past due", "inbox", k.overdueActions ? "tone-warn" : "") +
    metricCard("Checklist completion", formatPercent(k.checklistCompletionRate), k.checklistCompleted + " of " + k.checklistRequired + " required checks marked complete", "clipboard", "") +
    '</div>' +
    panel("Data quality & accountability", "Open records that need basic ownership or scheduling metadata", 
      '<div class="panel-body"><div class="exception-list">' +
      '<div class="exception-row"><div class="exception-copy"><div class="exception-title">Open actions without an owner</div><div class="exception-meta">These actions have no accountable person recorded.</div></div>' + pill(k.openActionsMissingOwner ? "review_required" : "current") + '<strong>' + k.openActionsMissingOwner + '</strong></div>' +
      '<div class="exception-row"><div class="exception-copy"><div class="exception-title">Open actions without a valid due date</div><div class="exception-meta">Missing or invalid dates prevent reliable deadline monitoring.</div></div>' + pill(k.openActionsMissingDueDate ? "review_required" : "current") + '<strong>' + k.openActionsMissingDueDate + '</strong></div>' +
      '<div class="exception-row"><div class="exception-copy"><div class="exception-title">Open findings without an owner</div><div class="exception-meta">An unresolved finding needs an accountable follow-up role.</div></div>' + pill(k.openFindingsMissingOwner ? "review_required" : "current") + '<strong>' + k.openFindingsMissingOwner + '</strong></div>' +
      '<div class="exception-row"><div class="exception-copy"><div class="exception-title">Inspection owner coverage</div><div class="exception-meta">Non-cancelled inspections with an owner recorded; denominator includes all non-cancelled inspections.</div></div><strong>' + esc(formatPercent(k.inspectionOwnerCoverageRate)) + '</strong></div>' +
      '</div></div><div class="panel-footer">Calculated from current browser-local records. These are metadata checks, not evidence that work was performed or controls are effective.</div>') +
    '<div class="content-grid">' +
    panel("Current inspection workload", "Current record count by status · snapshot, not a historical trend",
      '<div class="panel-body"><div class="state-bars">' + stateDefs.map((state) => {
        const width = Math.max(0, Math.min(100, state[1] / totalInspections * 100));
        return '<div class="state-row"><div class="state-name">' + esc(state[0]) + '</div><div class="bar-track"><svg viewBox="0 0 100 8" preserveAspectRatio="none" role="img" aria-label="' + esc(state[1] + ' of ' + totalInspections) + '"><rect class="bar-fill ' + state[2] + '" x="0" y="0" width="' + width + '" height="8" rx="4"></rect></svg></div><div class="bar-value">' + state[1] + '</div></div>';
      }).join("") + '</div></div><div class="panel-footer">Counts are calculated from browser-local sample records. No historical trend store is connected.</div>') +
    panel("Attention required", "Prioritized exceptions from current records", '<div class="panel-body">' + attentionHTML + '</div>',
      '<button class="link-button" data-page="queue">View work queue ' + icon("arrow") + '</button>') +
    '</div><div class="content-grid">' +
    panel("Recent recorded activity", "Demo-local activity only; not an immutable audit log",
      '<div class="panel-body">' + recentActivity(5) + '</div>',
      '<button class="link-button" data-page="system">System status</button>') +
    panel("Management reading guide", "What the numbers can and cannot tell you",
      '<div class="panel-body"><div class="exception-list">' +
      '<div class="exception-row"><div class="exception-copy"><div class="exception-title">Rates need denominators</div><div class="exception-meta">Completion and on-time rates use inspections due in the current month up to the current time.</div></div></div>' +
      '<div class="exception-row"><div class="exception-copy"><div class="exception-title">Closed is not effective</div><div class="exception-meta">An action can be resolved without the linked finding being verified effective.</div></div></div>' +
      '<div class="exception-row"><div class="exception-copy"><div class="exception-title">Local data is not shared</div><div class="exception-meta">Other users and devices do not receive these records.</div></div></div>' +
      '</div></div>') +
    '</div><p class="footer-note">Metric basis: the formula is implemented in the tested domain module. Before operational use, confirm the approved cohort definitions, risk method, data completeness and escalation policy.</p>';
}

function renderQueue() {
  const d = currentData();
  const workItems = [];
  d.inspections.filter((i) => !["completed", "cancelled"].includes(i.status)).forEach((i) => workItems.push({
    id: i.id, title: i.title, owner: i.owner, dueAt: i.dueAt, priority: i.priority, status: inspectionStatus(i), kind: "Inspection", target: "inspection"
  }));
  d.actions.filter((a) => !["resolved", "verified", "cancelled"].includes(a.status)).forEach((a) => workItems.push({
    id: a.id, title: a.title, owner: a.owner, dueAt: a.dueAt, priority: a.priority, status: actionStatus(a), kind: a.reviewId ? "Management follow-up" : "Corrective action", target: "action"
  }));
  const filtered = applySearch(workItems).sort((a, b) => {
    const aLate = a.status === "overdue" || a.priority === "Critical" ? 0 : 1;
    const bLate = b.status === "overdue" || b.priority === "Critical" ? 0 : 1;
    return aLate - bLate || new Date(a.dueAt) - new Date(b.dueAt);
  });
  return pageHeading("Work queue", "One operational queue for work that needs an owner, review or next action.", "EXECUTION CONTROL",
    '<button class="button button-primary" data-create-inspection>' + icon("plus") + ' New inspection</button>') +
    (searchQuery ? '<div class="search-context">Search results for <strong>' + esc(searchQuery) + '</strong> · ' + filtered.length + ' matching records</div>' : '') +
    panel("Outstanding work", "Open inspections and corrective actions sorted by urgency",
      (filtered.length ? '<div class="table-wrap"><table><thead><tr><th>Work item</th><th>Type</th><th>Owner</th><th>Due</th><th>Priority</th><th>State</th><th></th></tr></thead><tbody>' +
      filtered.map((item) => '<tr><td><div class="primary-cell">' + esc(item.title) + '</div><div class="secondary-cell">' + esc(item.id) + '</div></td><td>' + esc(item.kind) + '</td><td>' + esc(item.owner || "Unassigned") + '</td><td>' + dateCell(item.dueAt) + '</td><td>' + priorityPill(item.priority) + '</td><td>' + pill(item.status) + '</td><td><button class="link-button" ' + (item.target === "inspection" ? 'data-open-inspection="' : 'data-open-action="') + esc(item.id) + '">Open ' + icon("arrow") + '</button></td></tr>').join("") +
      '</tbody></table></div>' : tableMessage(filtered)) +
    '<div class="panel-footer">This queue uses only the records in this browser. It does not send notifications or escalate work to another user.</div>');
}

function renderInspections() {
  const inspections = applySearch(currentData().inspections.slice().sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt)));
  return pageHeading("Inspections", "Schedule and execute repeatable checks with required-step guardrails.", "WORK EXECUTION",
    '<button class="button button-primary" data-create-inspection>' + icon("plus") + ' New inspection</button>') +
    (searchQuery ? '<div class="search-context">Search results for <strong>' + esc(searchQuery) + '</strong> · ' + inspections.length + ' records</div>' : '') +
    panel("Inspection register", "Each record shows due date, accountable owner, lifecycle state and checklist progress",
      inspections.length ? '<div class="table-wrap"><table><thead><tr><th>Inspection</th><th>Site</th><th>Owner</th><th>Due date</th><th>Status</th><th>Checklist</th><th></th></tr></thead><tbody>' +
      inspections.map(inspectionRow).join("") + '</tbody></table></div>' : tableMessage(inspections),
      '<span class="pill">' + inspections.length + ' records</span>') +
    '<p class="footer-note">Completion is guarded by required checklist items. This local demo records status and timestamps in the browser only; it is not a validated inspection system.</p>';
}

function renderFindings() {
  const d = currentData();
  const correctiveActions = d.actions.filter((action) => !action.reviewId);
  const findings = applySearch(d.findings.slice().sort((a, b) => {
    const score = { critical: 0, high: 1, medium: 2, low: 3 };
    return (score[a.severity] ?? 5) - (score[b.severity] ?? 5);
  }));
  const openFindings = d.findings.filter((f) => !["verified", "resolved", "dismissed"].includes(f.status)).length;
  return pageHeading("Findings & actions", "Track exceptions through corrective action and effectiveness verification.", "CORRECTIVE CONTROL",
    '<button class="button button-primary" data-create-finding>' + icon("plus") + ' Log finding</button>') +
    '<div class="metric-grid">' +
    metricCard("Open findings", String(openFindings), "Records not yet verified or closed", "alert", openFindings ? "tone-warn" : "") +
    metricCard("Critical findings", String(d.findings.filter((f) => f.severity === "critical" && !["verified", "resolved", "dismissed"].includes(f.status)).length), "Unresolved critical severity", "shield", "tone-alert") +
    metricCard("Open corrective actions", String(correctiveActions.filter((a) => !["resolved", "verified", "cancelled"].includes(a.status)).length), "Finding-linked actions awaiting completion", "inbox", "") +
    metricCard("Overdue corrective actions", String(correctiveActions.filter((a) => isActionOverdue(a)).length), "Finding-linked actions past due", "clock", "tone-warn") +
    '</div>' +
    panel("Finding register", "Closure and effectiveness are distinct states",
      findings.length ? '<div class="table-wrap"><table><thead><tr><th>Finding</th><th>Severity</th><th>Site</th><th>Owner</th><th>Due date</th><th>Status</th><th></th></tr></thead><tbody>' +
      findings.map(findingRow).join("") + '</tbody></table></div>' : tableMessage(findings)) +
    '<div class="content-grid equal">' +
    panel("Corrective actions", "Open work and resolution status",
      '<div class="table-wrap"><table><thead><tr><th>Action</th><th>Owner</th><th>Due</th><th>Priority</th><th>Status</th><th></th></tr></thead><tbody>' +
      applySearch(correctiveActions).map((a) => '<tr><td><div class="primary-cell">' + esc(a.title) + '</div><div class="secondary-cell">' + esc(a.id) + '</div></td><td>' + esc(a.owner) + '</td><td>' + dateCell(a.dueAt) + '</td><td>' + priorityPill(a.priority) + '</td><td>' + pill(actionStatus(a)) + '</td><td><button class="link-button" data-open-action="' + esc(a.id) + '">Open</button></td></tr>').join("") +
      '</tbody></table></div>') +
    panel("Closure rule", "What the demo enforces",
      '<div class="panel-body"><div class="exception-list">' +
      '<div class="exception-row"><div class="exception-copy"><div class="exception-title">Action closure requires a note</div><div class="exception-meta">The note is stored with the demo action record.</div></div></div>' +
      '<div class="exception-row"><div class="exception-copy"><div class="exception-title">Finding verification is separate</div><div class="exception-meta">A finding cannot be verified until linked actions are resolved and a verification note is recorded.</div></div></div>' +
      '<div class="exception-row"><div class="exception-copy"><div class="exception-title">Evidence files are not attached yet</div><div class="exception-meta">Notes are not equivalent to a managed evidence repository.</div></div></div>' +
      '</div></div>') +
    '</div>';
}

function renderRisk() {
  const d = currentData();
  const risks = applySearch(d.risks);
  return pageHeading("Risk & controls", "Review risk records with an explicit and intentionally unapproved demo method.", "RISK MANAGEMENT",
    '<span class="pill pill--review_required">Method not approved</span>') +
    '<div class="demo-banner">' + icon("info") + '<div><strong>Scoring is illustrative only</strong><p>The displayed number is likelihood × consequence on a sample 1–5 scale. No organization risk appetite, calibrated bands or authorization policy is configured.</p></div></div>' +
    '<div class="risk-grid">' + risks.map((risk) => {
      const score = Number(risk.likelihood) * Number(risk.consequence);
      return '<article class="risk-card"><div class="risk-card-head"><div><div class="risk-title">' + esc(risk.title) + '</div><div class="risk-category">' + esc(risk.category) + ' · ' + esc(risk.id) + '</div></div>' + pill(risk.status) + '</div>' +
        '<div class="risk-metrics"><div><div class="risk-number">' + esc(String(risk.likelihood)) + ' / 5</div><div class="risk-number-label">Likelihood (sample)</div></div>' +
        '<div><div class="risk-number">' + esc(String(risk.consequence)) + ' / 5</div><div class="risk-number-label">Consequence (sample)</div></div>' +
        '<div><div class="risk-number">' + esc(String(score)) + ' / 25</div><div class="risk-number-label">Product only</div></div></div>' +
        '<div class="exception-meta top-space">Site: ' + esc(siteName(risk.siteId)) + ' · Owner: ' + esc(risk.owner) + '</div>' +
        '<div class="exception-meta">Control: ' + esc(risk.control) + '</div><div class="exception-meta">Last reviewed: ' + esc(formatDate(risk.lastReviewedAt, { year: true })) + '</div></article>';
    }).join("") + '</div>' +
    '<p class="footer-note">Risk scores are not regulatory thresholds or safety permissions. A competent organization owner must approve the method, scales, thresholds and review cadence before operational decisions rely on them.</p>';
}

function renderSites() {
  const d = currentData();
  const sites = applySearch(d.sites);
  const siteCards = sites.map((site) => {
    const inspections = d.inspections.filter((i) => i.siteId === site.id && i.status !== "cancelled");
    const openFindings = d.findings.filter((f) => f.siteId === site.id && !["resolved", "verified", "dismissed"].includes(f.status));
    const overdue = inspections.filter((i) => isInspectionOverdue(i)).length;
    return '<article class="site-card"><div class="site-card-top"><div><div class="site-name">' + esc(site.name) + '</div><div class="site-location">' + esc(site.location) + ' · ' + esc(site.region) + '</div></div>' + pill(site.status) + '</div>' +
      '<div class="secondary-cell">Site owner: ' + esc(site.manager) + ' · ' + esc(site.id) + '</div>' +
      '<div class="site-stats"><div><div class="site-stat-value">' + inspections.length + '</div><div class="site-stat-label">Inspections</div></div><div><div class="site-stat-value">' + overdue + '</div><div class="site-stat-label">Overdue</div></div><div><div class="site-stat-value">' + openFindings.length + '</div><div class="site-stat-label">Open findings</div></div></div></article>';
  }).join("");
  const assets = applySearch(d.assets);
  return pageHeading("Sites & assets", "Understand which locations and equipment carry current work and exceptions.", "OPERATIONAL STRUCTURE") +
    '<div class="site-grid">' + (siteCards || emptyState("No sites found", "Try another search term.")) + '</div>' +
    panel("Asset register", "Sample asset master records with inspection dates",
      assets.length ? '<div class="table-wrap"><table><thead><tr><th>Asset</th><th>Site</th><th>Type</th><th>Criticality</th><th>Next check</th><th>Status</th></tr></thead><tbody>' +
      assets.map((asset) => '<tr><td><div class="primary-cell">' + esc(asset.name) + '</div><div class="secondary-cell">' + esc(asset.id) + '</div></td><td>' + esc(siteName(asset.siteId)) + '</td><td>' + esc(asset.type) + '</td><td>' + priorityPill(asset.criticality.toLowerCase()) + '</td><td>' + dateCell(asset.nextCheckAt) + '</td><td>' + pill(asset.status) + '</td></tr>').join("") +
      '</tbody></table></div>' : tableMessage(assets)) +
    '<p class="footer-note">Asset status and sample dates do not establish fitness for use. Actual maintenance/work-order systems are not connected.</p>';
}

function renderAudits() {
  const d = currentData();
  const audits = applySearch(d.audits.slice().sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt)));
  const reqs = applySearch(d.requirements);
  const completeCount = d.audits.filter((a) => a.status === "completed").length;
  const activeCount = d.audits.filter((a) => a.status === "in_progress").length;
  const overdueCount = d.audits.filter((a) => isAuditOverdue(a)).length;
  const auditRows = audits.map((audit) => {
    const checks = (audit.checklist || []).filter((item) => item.required !== false);
    const done = checks.filter((item) => ["done", "not_applicable"].includes(item.status)).length;
    return '<tr><td><div class="primary-cell">' + esc(audit.title) + '</div><div class="secondary-cell">' + esc(audit.id) + '</div></td>' +
      '<td>' + esc(audit.scope) + '</td><td>' + esc(audit.owner) + '</td><td>' + dateCell(audit.dueAt) + '</td>' +
      '<td>' + pill(isAuditOverdue(audit) ? "overdue" : audit.status) + '</td><td>' + done + ' / ' + checks.length + '</td>' +
      '<td><button class="link-button" data-open-audit="' + esc(audit.id) + '">Open audit ' + icon("arrow") + '</button></td></tr>';
  }).join("");
  return pageHeading("Audit & compliance", "Coordinate an auditable review workflow and track requirements needing attention.", "ASSURANCE") +
    '<div class="metric-grid">' +
    metricCard("Audit programme", String(d.audits.length), "Sample audit records in this browser", "checklist", "") +
    metricCard("In progress", String(activeCount), "Audit work currently underway", "clipboard", activeCount ? "tone-warn" : "") +
    metricCard("Completed", String(completeCount), "Audits with a recorded conclusion", "check", "") +
    metricCard("Overdue", String(overdueCount), "Open audits past their due timestamp", "clock", overdueCount ? "tone-alert" : "") +
    '</div>' +
    '<div class="content-grid equal">' +
    panel("Audit programme", "Complete all required steps and record a conclusion before closing an audit",
      auditRows ? '<div class="table-wrap"><table><thead><tr><th>Audit</th><th>Scope</th><th>Owner</th><th>Due</th><th>Status</th><th>Steps</th><th></th></tr></thead><tbody>' +
      auditRows + '</tbody></table></div>' : tableMessage(audits), '<span class="pill">' + audits.length + ' records</span>') +
    panel("Requirement follow-up", "Illustrative internal control checks; not a legal register",
      reqs.length ? '<div class="exception-list panel-body">' + reqs.map((req) =>
        '<div class="exception-row"><div class="exception-copy"><div class="exception-title">' + esc(req.title) + '</div><div class="exception-meta">' + esc(req.id + " · Owner: " + req.owner) + '</div><div class="exception-meta">Evidence reference: ' + esc(req.evidence) + '</div></div>' + pill(req.status) + '</div>'
      ).join("") + '</div>' : tableMessage(reqs)) +
    '</div><p class="footer-note">Requirements are illustrative and unvalidated. This audit workflow is a product prototype, not a substitute for a qualified auditor or a jurisdiction-specific compliance assessment.</p>';
}

function renderPeople() {
  const d = currentData();
  const people = applySearch(d.people);
  const contractors = applySearch(d.contractors);
  const expired = d.contractors.filter((c) => new Date(c.credentialDueAt) < new Date()).length;
  return pageHeading("People & suppliers", "View operational ownership and sample contractor credential states.", "READINESS") +
    '<div class="metric-grid">' +
    metricCard("Sample people", String(d.people.length), "Fictional workspace identities; no login accounts", "users", "") +
    metricCard("Sample suppliers", String(d.contractors.length), "Not connected to a procurement system", "building", "") +
    metricCard("Credential reviews due", String(expired), "Supplier records past their sample due timestamp", "clock", expired ? "tone-warn" : "") +
    metricCard("Identity provider", "Not connected", "Roles displayed here are sample labels only", "shield", "tone-alert") +
    '</div><div class="content-grid equal">' +
    panel("People and responsibilities", "Sample accountability mapping",
      people.length ? '<div class="table-wrap"><table><thead><tr><th>Person</th><th>Role</th><th>Site</th><th>Status</th></tr></thead><tbody>' +
      people.map((person) => '<tr><td><div class="primary-cell">' + esc(person.name) + '</div><div class="secondary-cell">' + esc(person.id) + '</div></td><td>' + esc(person.role) + '</td><td>' + esc(siteName(person.siteId)) + '</td><td>' + pill(person.status) + '</td></tr>').join("") +
      '</tbody></table></div>' : tableMessage(people)) +
    panel("Contractor / supplier register", "Credential dates are illustrative and do not verify the underlying document",
      contractors.length ? '<div class="table-wrap"><table><thead><tr><th>Organization</th><th>Service</th><th>Site</th><th>Review date</th><th>Status</th></tr></thead><tbody>' +
      contractors.map((c) => '<tr><td><div class="primary-cell">' + esc(c.name) + '</div><div class="secondary-cell">' + esc(c.id) + '</div></td><td>' + esc(c.service) + '</td><td>' + esc(siteName(c.siteId)) + '</td><td>' + dateCell(c.credentialDueAt) + '</td><td>' + pill(new Date(c.credentialDueAt) < new Date() ? "review_required" : c.status) + '</td></tr>').join("") +
      '</tbody></table></div>' : tableMessage(contractors)) +
    '</div><p class="footer-note">Displayed people are not authenticated identities. The app does not grant/revoke real access, verify qualifications, or decide site access.</p>';
}


function renderReviews() {
  const d = currentData();
  const reviews = applySearch(d.reviews.slice().sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt)));
  const completed = d.reviews.filter((r) => r.status === "completed").length;
  const active = d.reviews.filter((r) => r.status === "in_progress").length;
  const scheduled = d.reviews.filter((r) => r.status === "scheduled").length;
  const openFollowUps = d.actions.filter((a) => a.reviewId && !["resolved", "verified", "cancelled"].includes(a.status)).length;
  const overdueFollowUps = d.actions.filter((a) => a.reviewId && isActionOverdue(a)).length;
  const rows = reviews.map((review) => {
    const tasks = d.actions.filter((action) => (review.decisionActionIds || []).includes(action.id));
    const openTasks = tasks.filter((action) => !["resolved", "verified", "cancelled"].includes(action.status)).length;
    return '<tr><td><div class="primary-cell">' + esc(review.title) + '</div><div class="secondary-cell">' + esc(review.id + " · " + review.period) + '</div></td>' +
      '<td>' + esc(review.chair || "Unassigned") + '</td><td>' + dateCell(review.scheduledAt) + '</td><td>' + pill(review.status) + '</td>' +
      '<td>' + openTasks + ' open / ' + tasks.length + ' linked</td><td><button class="link-button" data-open-review="' + esc(review.id) + '">Open review ' + icon("arrow") + '</button></td></tr>';
  }).join("");
  return pageHeading("Management reviews", "Turn KPI signals and operational exceptions into recorded decisions and accountable follow-up.", "GOVERNANCE & DECISIONS",
    '<button class="button button-primary" data-create-review>' + icon("plus") + ' Schedule review</button>') +
    '<div class="metric-grid">' +
    metricCard("Completed reviews", String(completed), "Records with saved review minutes", "check", "") +
    metricCard("In progress", String(active), "Reviews currently being prepared or held", "clipboard", active ? "tone-warn" : "") +
    metricCard("Scheduled", String(scheduled), "Future review sessions in the register", "calendar", "") +
    metricCard("Overdue follow-ups", String(overdueFollowUps), openFollowUps + " open follow-ups from review decisions", "clock", overdueFollowUps ? "tone-alert" : "") +
    '</div>' +
    panel("Review register", "Each review keeps meeting state separate from the follow-up actions it creates",
      rows ? '<div class="table-wrap"><table><thead><tr><th>Review</th><th>Chair</th><th>Scheduled</th><th>Status</th><th>Follow-ups</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>' :
        tableMessage(reviews), '<span class="pill">' + reviews.length + ' records</span>') +
    '<div class="content-grid equal">' +
    panel("Governance rules", "A review records decisions; follow-up tasks remain separate work items",
      '<div class="panel-body"><div class="exception-list">' +
      '<div class="exception-row"><div class="exception-copy"><div class="exception-title">Minutes before completion</div><div class="exception-meta">A review cannot be marked complete without a substantive summary of at least 20 characters.</div></div></div>' +
      '<div class="exception-row"><div class="exception-copy"><div class="exception-title">Accountable follow-ups</div><div class="exception-meta">Each follow-up must have a title, owner, due date and priority. It also appears in the common work queue.</div></div></div>' +
      '<div class="exception-row"><div class="exception-copy"><div class="exception-title">Decision is not implementation</div><div class="exception-meta">Completing the meeting does not close its follow-up tasks or prove effectiveness.</div></div></div>' +
      '</div></div>') +
    panel("Current system boundary", "What this review register represents",
      '<div class="panel-body"><p class="page-subtitle">These are local sample records. Minutes and decisions are not shared, signed, or stored in an independently protected audit trail. Use the underlying records to test the workflow only.</p></div>') +
    '</div>';
}
function renderReports() {
  const k = getKpis();
  const d = currentData();
  const reportCards = [
    ["Inspection register", "Inspection status, owner, site, due time, checklist progress.", "inspections"],
    ["Findings and actions", "Severity, workflow state, owner, due time and closure notes.", "actions"],
    ["Risk register", "Risk assumptions, owners, review dates and controls.", "risks"],
    ["Audit register", "Audit scope, criteria, status, required steps and conclusion.", "audits"],
    ["Management reviews", "Review status, period, chair, minutes and open follow-ups.", "reviews"],
    ["KPI snapshot", "Formula-based current metrics with definitions and demo-data caveat.", "kpis"]
  ];
  return pageHeading("Reports", "Export current records and inspect the measurement basis.", "EVIDENCE & REPORTING") +
    '<div class="demo-banner">' + icon("info") + '<div><strong>Report provenance</strong><p>Exports are generated from this browser’s current local records. Include a data limitation in any downstream analysis; these files are not signed reports or a compliance attestation.</p></div></div>' +
    '<div class="report-grid">' + reportCards.map((card) => '<article class="report-card"><h3>' + esc(card[0]) + '</h3><p>' + esc(card[1]) + '</p><button class="button button-block" data-export="' + esc(card[2]) + '">' + icon("download") + ' Export CSV</button></article>').join("") + '</div>' +
    panel("KPI definitions — this month to date", "Cohort: scheduled inspections due in the current calendar month and before the current time",
      '<div class="table-wrap"><table><thead><tr><th>Metric</th><th>Value</th><th>Numerator / denominator</th><th>Definition</th></tr></thead><tbody>' +
      '<tr><td class="primary-cell">Inspection completion</td><td>' + esc(formatPercent(k.completionRate)) + '</td><td>' + k.completedInspections + ' / ' + k.dueInspections + '</td><td>Completed due inspections divided by all non-cancelled inspections due in the period to date.</td></tr>' +
      '<tr><td class="primary-cell">On-time completion</td><td>' + esc(formatPercent(k.onTimeRate)) + '</td><td>' + k.onTimeCount + ' / ' + k.dueInspections + '</td><td>Completed inspections whose recorded completion time is not later than the due time, divided by due inspections.</td></tr>' +
      '<tr><td class="primary-cell">Checklist completion</td><td>' + esc(formatPercent(k.checklistCompletionRate)) + '</td><td>' + k.checklistCompleted + ' / ' + k.checklistRequired + '</td><td>Required checklist items marked complete across non-cancelled inspection records.</td></tr>' +
      '<tr><td class="primary-cell">Overdue actions</td><td>' + k.overdueActions + '</td><td>Count</td><td>Open corrective actions with due timestamps earlier than current time.</td></tr>' +
      '<tr><td class="primary-cell">Critical open findings</td><td>' + k.criticalOpenFindings + '</td><td>Count</td><td>Critical findings not resolved, verified, or dismissed.</td></tr>' +
      '</tbody></table></div>') +
    '<p class="footer-note">Generated ' + esc(formatDateTime(new Date().toISOString())) + '. Formula logic is unit-tested; the sample dataset and local browser state are not verified operational facts.</p>';
}

function renderSystem() {
  const d = currentData();
  const integrity = validateWorkspaceData(d);
  const issueRows = integrity.issues.map((issue) => '<tr><td>' + esc(issue.recordType) + '</td>' +
    '<td><div class="primary-cell">' + esc(issue.recordId) + '</div><div class="secondary-cell">' + esc(issue.field || issue.collection) + '</div></td>' +
    '<td><div class="integrity-message">' + esc(issue.message) + '</div><div class="secondary-cell">' + esc(issue.recommendation) + '</div></td>' +
    '<td><button class="link-button" type="button" data-page="' + esc(issue.page) + '">Open register ' + icon("arrow") + '</button></td></tr>').join("");
  const integrityPanel = panel("Record integrity", "Required fields, date formats, unique IDs and cross-record links",
    '<div class="panel-body"><div class="integrity-summary">' +
    '<div><div class="integrity-number">' + integrity.recordCount + '</div><div class="integrity-label">Records checked</div></div>' +
    '<div><div class="integrity-number">' + integrity.issueCount + '</div><div class="integrity-label">Issues found</div></div>' +
    '<div><div class="integrity-number">' + Object.keys(integrity.byCode).length + '</div><div class="integrity-label">Issue categories</div></div>' +
    '</div>' + (integrity.valid
      ? '<div class="integrity-ok"><strong>All current integrity checks passed.</strong><div>This checks record structure and links only. It does not prove that sample data is true, complete for operations, or approved.</div></div>'
      : '<div class="integrity-warning"><strong>Some records need attention.</strong><div>Each row explains the problem and the next corrective step. Review these before relying on affected records.</div></div>') +
    '</div>' +
    (integrity.issues.length ? '<div class="table-wrap"><table><thead><tr><th>Record type</th><th>Record / field</th><th>Issue and recommended fix</th><th></th></tr></thead><tbody>' +
      issueRows + '</tbody></table></div>' : '') +
    '<div class="panel-footer">Checks are re-run from the records currently loaded in this browser when the page is rendered. There is no server-side validation or shared database in this demo.</div>');
  const healthItems = [
    ["Data source", "Illustrative sample records", "Current records are seeded for product testing, not connected to a live source.", "review_required"],
    ["Persistence", "Current browser only", "Changes are saved to browser local storage when available. No cross-device or multi-user sync.", "review_required"],
    ["Authentication", "Not configured", "The displayed demo operator is not an authenticated identity. No user access controls exist.", "attention_required"],
    ["Evidence storage", "Not configured", "The demo captures notes only. It does not upload or securely store evidence files.", "attention_required"],
    ["Audit history", "Demo activity list", "Local activity entries can be edited or cleared with browser data; they are not an immutable audit trail.", "attention_required"],
    ["Cloud integrations", "Disconnected", "No credentials, external providers, webhooks or synchronization jobs are configured.", "attention_required"],
    ["Notifications", "Not configured", "No email, push, SMS or manager escalation messages are sent.", "review_required"],
    ["Reporting", "Browser-local CSV", "CSV exports reflect the current local snapshot and are not signed or independently verified.", "current"]
  ];
  return pageHeading("System health", "An explicit view of current data and capability boundaries.", "PLATFORM STATUS",
    '<button class="button" data-reset-demo>' + icon("refresh") + ' Reset demo data</button>') +
    '<div class="health-grid">' + healthItems.map((item) => '<article class="health-item"><div class="health-item-top"><div class="health-title">' + esc(item[0]) + '</div>' + pill(item[3]) + '</div><div class="primary-cell health-value">' + esc(item[1]) + '</div><div class="health-desc">' + esc(item[2]) + '</div></article>').join("") + '</div>' +
    '<div class="section-spacer" aria-hidden="true"></div>' +
    integrityPanel +
    '<div class="section-spacer" aria-hidden="true"></div>' +
    panel("Local workspace diagnostics", "Current browser-local counts; a successful render is not a production-readiness check",
      '<div class="table-wrap"><table><thead><tr><th>Record family</th><th>Count</th><th>Storage / truth boundary</th></tr></thead><tbody>' +
      [["Sites", d.sites.length], ["Assets", d.assets.length], ["Inspections", d.inspections.length], ["Findings", d.findings.length], ["Actions", d.actions.length], ["Risks", d.risks.length], ["Audit activities", d.audits.length], ["Activity items", d.activity.length]].map((r) => '<tr><td class="primary-cell">' + esc(r[0]) + '</td><td>' + r[1] + '</td><td>Current browser demo data</td></tr>').join("") +
      '</tbody></table></div>') +
    '<p class="footer-note">Production readiness is NOT ESTABLISHED. No security assessment, tenant-isolation test, backup/restore exercise, live integration or evidence-storage verification has been performed by this demo interface.</p>';
}


const evidenceEntityConfig = {
  inspection: { collection: "inspections", label: "Inspection", page: "inspections", openType: "inspection" },
  finding: { collection: "findings", label: "Finding", page: "findings", openType: "finding" },
  action: { collection: "actions", label: "Corrective action", page: "findings", openType: "action" },
  audit: { collection: "audits", label: "Audit", page: "audits", openType: "audit" },
  management_review: { collection: "reviews", label: "Management review", page: "reviews", openType: "review" },
  site: { collection: "sites", label: "Site", page: "sites", openType: null },
  asset: { collection: "assets", label: "Asset", page: "sites", openType: null },
  risk: { collection: "risks", label: "Risk", page: "risk", openType: null },
  contractor: { collection: "contractors", label: "Supplier / contractor", page: "people", openType: null }
};

function evidenceTarget(evidence) {
  const config = evidenceEntityConfig[evidence?.linkedEntityType];
  if (!config) return { config: null, record: null, title: "Unsupported record type" };
  const record = (currentData()[config.collection] || []).find((item) => item.id === evidence.linkedEntityId);
  return { config, record, title: record ? (record.title || record.name || record.id) : "Linked record missing" };
}

function evidenceTargetButton(evidence, label = "Open linked record") {
  const target = evidenceTarget(evidence);
  if (!target.config || !target.record) return '<span class="secondary-cell">Linked record unavailable</span>';
  if (target.config.openType) {
    return '<button class="link-button" type="button" data-open-' + esc(target.config.openType) + '="' + esc(target.record.id) + '">' + esc(label) + ' ' + icon("arrow") + '</button>';
  }
  return '<button class="link-button" type="button" data-page="' + esc(target.config.page) + '">' + esc(label) + ' ' + icon("arrow") + '</button>';
}

function evidenceTypeLabel(value) {
  const labels = {
    document_reference: "Document reference",
    photo_note: "Photo reference / note",
    inspection_note: "Inspection note",
    measurement_note: "Measurement note",
    external_reference: "External reference"
  };
  return labels[value] || displayStatus(value);
}

function renderEvidence() {
  const d = currentData();
  const records = applySearch((d.evidence || []).slice().sort((a, b) => new Date(b.capturedAt) - new Date(a.capturedAt)));
  const pending = (d.evidence || []).filter((item) => item.reviewStatus === "pending_review").length;
  const accepted = (d.evidence || []).filter((item) => item.reviewStatus === "accepted").length;
  const rejected = (d.evidence || []).filter((item) => item.reviewStatus === "rejected").length;
  const rows = records.map((item) => {
    const target = evidenceTarget(item);
    return '<tr><td><div class="primary-cell">' + esc(item.title) + '</div><div class="secondary-cell">' + esc(item.id + " · " + evidenceTypeLabel(item.evidenceType)) + '</div></td>' +
      '<td><div class="primary-cell">' + esc(target.title) + '</div><div class="secondary-cell">' + esc(target.config?.label || item.linkedEntityType) + ' · ' + esc(item.linkedEntityId) + '</div></td>' +
      '<td>' + esc(formatDate(item.capturedAt, { year: true })) + '</td><td>' + esc(item.capturedBy || "Not recorded") + '</td>' +
      '<td>' + pill(item.reviewStatus) + '</td><td>' + esc(item.sourceReference || "No reference ID") + '</td>' +
      '<td><button class="link-button" type="button" data-open-evidence="' + esc(item.id) + '">Review metadata ' + icon("arrow") + '</button></td></tr>';
  }).join("");
  return pageHeading("Evidence", "Record what a reference is, where it came from, what it relates to, and whether it has been reviewed.", "EVIDENCE TRACEABILITY",
    '<button class="button" type="button" data-export="evidence">' + icon("download") + ' Export register</button>' +
    '<button class="button button-primary" type="button" data-create-evidence>' + icon("plus") + ' Record evidence</button>') +
    '<div class="metric-grid">' +
    metricCard("Metadata records", String((d.evidence || []).length), "Evidence descriptions and references only", "file", "") +
    metricCard("Pending review", String(pending), "Not yet accepted or rejected", "clock", pending ? "tone-warn" : "") +
    metricCard("Accepted references", String(accepted), "Review decision recorded with rationale", "check", "") +
    metricCard("Rejected references", String(rejected), "Review decision requires follow-up", "alert", rejected ? "tone-alert" : "") +
    '</div>' +
    panel("Evidence register", "Every entry links to one operational record and keeps provenance separate from review status",
      records.length ? '<div class="table-wrap"><table><thead><tr><th>Evidence reference</th><th>Linked record</th><th>Captured</th><th>Recorded by</th><th>Review state</th><th>Source reference</th><th></th></tr></thead><tbody>' +
      rows + '</tbody></table></div>' : emptyState("No evidence references found", searchQuery ? "Try another search term." : "Record an evidence reference to describe a note, document reference, photo reference or measurement. This demo does not upload files.")) +
    '<p class="footer-note">Evidence status is not proof of authenticity. Accepted means a demo reviewer recorded a decision about the reference metadata; it does not mean Inspectra stored or independently verified the underlying file.</p>';
}

function renderSearchResults() {
  const results = searchWorkspaceRecords(currentData(), searchQuery);
  const actionFor = (item) => {
    if (item.openType) return '<button class="link-button" data-open-' + esc(item.openType) + '="' + esc(item.id) + '">Open record ' + icon("arrow") + '</button>';
    return '<button class="link-button" data-page="' + esc(item.page) + '">Open register ' + icon("arrow") + '</button>';
  };
  const body = results.length
    ? '<div class="table-wrap"><table><thead><tr><th>Record</th><th>Type</th><th>Site / location</th><th>Owner</th><th>Status</th><th></th></tr></thead><tbody>' +
      results.map((item) => '<tr><td><div class="primary-cell">' + esc(item.title) + '</div><div class="secondary-cell">' + esc(item.id) + (item.dueAt ? ' · Due ' + esc(formatDate(item.dueAt, { year: true })) : '') + '</div></td>' +
        '<td>' + esc(item.type) + '</td><td>' + esc(item.siteName || "—") + '</td><td>' + esc(item.owner || "Unassigned") + '</td><td>' + (item.status ? pill(item.status) : '—') + '</td><td>' + actionFor(item) + '</td></tr>').join("") +
      '</tbody></table></div>'
    : emptyState(searchQuery ? "No matching records" : "Search the workspace", searchQuery ? "Try a shorter term, an ID, a site, an owner or a status." : "Use the search box above to find inspections, findings, actions, audits, reviews, sites, assets, risks, people and suppliers.");
  return pageHeading("Search results", searchQuery ? 'Results for "' + esc(searchQuery) + '" · ' + results.length + ' matching records' : "Find a record across all registers.", "QUICK FIND",
    '<button class="button" type="button" data-clear-search>Clear search</button>') +
    panel("Workspace search", "Matches come from current browser-local records; this does not search external systems.", body);
}

function renderPage() {
  switch (activePage) {
    case "search": return renderSearchResults();
    case "overview": return renderOverview();
    case "queue": return renderQueue();
    case "inspections": return renderInspections();
    case "findings": return renderFindings();
    case "evidence": return renderEvidence();
    case "risk": return renderRisk();
    case "sites": return renderSites();
    case "audits": return renderAudits();
    case "people": return renderPeople();
    case "reviews": return renderReviews();
    case "reports": return renderReports();
    case "system": return renderSystem();
    default: return renderOverview();
  }
}

function renderSidebar() {
  const d = currentData();
  const queueCount = d.inspections.filter((i) => !["completed", "cancelled"].includes(i.status)).length +
    d.actions.filter((a) => !["resolved", "verified", "cancelled"].includes(a.status)).length;
  const findingCount = d.findings.filter((f) => !["verified", "resolved", "dismissed"].includes(f.status)).length;
  return '<aside class="sidebar"><div class="brand"><div class="brand-mark">I.</div><div><div class="brand-name">Inspectra</div><div class="brand-sub">Operational assurance</div></div></div>' +
    '<div class="demo-tag"><span class="demo-dot"></span> Demo workspace</div>' +
    navGroups.map((group) => '<div class="nav-group"><div class="nav-label">' + esc(group.label) + '</div><div class="nav-list">' +
      group.items.map((item) => '<button type="button" class="nav-item" data-page="' + esc(item.id) + '" aria-current="' + (activePage === item.id ? "page" : "false") + '">' +
        icon(item.icon) + '<span>' + esc(item.label) + '</span>' +
        (item.count ? '<span class="nav-count">' + (item.count === "queue" ? queueCount : findingCount) + '</span>' : '') +
      '</button>').join("") + '</div></div>').join("") +
    '<div class="sidebar-bottom"><strong>Inspectra Core</strong>Sector-neutral foundation<br>Local demo · No live integrations</div></aside>';
}

function renderModal() {
  if (!modalState) return "";
  const d = currentData();
  const type = modalState.type;
  const modalHeader = (title, subtitle) => '<div class="modal-header"><div><div class="modal-title">' + esc(title) + '</div><div class="modal-subtitle">' + esc(subtitle || "") + '</div></div><button class="icon-button" type="button" data-close-dialog aria-label="Close dialog">' + icon("close") + '</button></div>';
  const modalWrap = (title, subtitle, body, footer = "", wide = false) =>
    '<div class="modal-backdrop" data-close-modal><section class="modal ' + (wide ? "modal-wide" : "") + '" role="dialog" aria-modal="true" aria-label="' + esc(title) + '">' +
    modalHeader(title, subtitle) + '<div class="modal-content">' + body + '</div>' + (footer ? '<div class="modal-footer">' + footer + '</div>' : '') + '</section></div>';

  if (type === "create-evidence") {
    const groups = [
      ["inspections", "Inspection", "title"],
      ["findings", "Finding", "title"],
      ["actions", "Corrective action", "title"],
      ["audits", "Audit", "title"],
      ["reviews", "Management review", "title"],
      ["sites", "Site", "name"],
      ["assets", "Asset", "name"],
      ["risks", "Risk", "title"],
      ["contractors", "Supplier / contractor", "name"]
    ];
    const linkOptions = groups.flatMap(([collection, label, titleField]) =>
      (d[collection] || []).map((record) => ({
        value: label === "Management review" ? "management_review:" + record.id :
          label === "Corrective action" ? "action:" + record.id :
          label === "Supplier / contractor" ? "contractor:" + record.id :
          label.toLowerCase() + ":" + record.id,
        label: label + " — " + (record[titleField] || record.id) + " (" + record.id + ")"
      }))
    ).map((option) => '<option value="' + esc(option.value) + '">' + esc(option.label) + '</option>').join("");
    const evidenceTypeOptions = [
      ["inspection_note", "Inspection note"], ["document_reference", "Document reference"],
      ["photo_note", "Photo reference / note"], ["measurement_note", "Measurement note"],
      ["external_reference", "External reference"]
    ].map(([value, label]) => '<option value="' + value + '">' + label + '</option>').join("");
    return modalWrap("Record evidence reference", "Describe the reference and link it to the record it supports. No file is uploaded.",
      '<form id="createEvidenceForm" data-form="create-evidence"><div class="form-grid">' +
      '<div class="field full"><label for="evidenceTitle">Evidence title *</label><input id="evidenceTitle" name="title" required maxlength="160" placeholder="e.g. Inspection photograph reference"></div>' +
      '<div class="field"><label for="evidenceType">Reference type *</label><select id="evidenceType" name="evidenceType" required>' + evidenceTypeOptions + '</select></div>' +
      '<div class="field"><label for="evidenceLinkedRecord">Linked record *</label><select id="evidenceLinkedRecord" name="linkedRecord" required>' + linkOptions + '</select></div>' +
      '<div class="field"><label for="evidenceCapturedAt">Capture / record date *</label><input type="date" id="evidenceCapturedAt" name="capturedDate" value="' + esc(dateInputAt(0)) + '" required></div>' +
      '<div class="field"><label for="evidenceCapturedBy">Recorded by *</label><select id="evidenceCapturedBy" name="capturedBy" required>' + d.people.map((person) => '<option>' + esc(person.name) + '</option>').join("") + '</select></div>' +
      '<div class="field full"><label for="evidenceSourceDescription">Origin and context *</label><textarea id="evidenceSourceDescription" name="sourceDescription" required minlength="8" maxlength="1200" placeholder="Describe who supplied it, how it was captured, and relevant context."></textarea></div>' +
      '<div class="field full"><label for="evidenceSourceReference">Source reference / identifier</label><input id="evidenceSourceReference" name="sourceReference" maxlength="240" placeholder="Document number, internal reference, or external locator (not a file upload)"></div>' +
      '</div><div class="demo-banner top-space">' + icon("info") + '<div><strong>Metadata only</strong><p>Do not paste credentials or sensitive personal details. Attachments, access permissions, checksums, and managed retention are not implemented.</p></div></div>' +
      '<div class="modal-footer modal-inline-footer"><button class="button" type="button" data-close-dialog>Cancel</button><button class="button button-primary" type="submit">' + icon("plus") + ' Save reference</button></div></form>', "", true);
  }

  if (type === "create-inspection") {
    const options = d.sites.map((s) => '<option value="' + esc(s.id) + '">' + esc(s.name) + '</option>').join("");
    return modalWrap("Schedule an inspection", "Creates a local demo record with five required checklist items.",
      '<form id="createInspectionForm" data-form="create-inspection"><div class="form-grid">' +
      '<div class="field full"><label for="inspectionTitle">Inspection title *</label><input id="inspectionTitle" name="title" required maxlength="140" placeholder="e.g. Weekly work-area check"></div>' +
      '<div class="field"><label for="inspectionSite">Site *</label><select id="inspectionSite" name="siteId" required>' + options + '</select></div>' +
      '<div class="field"><label for="inspectionOwner">Owner *</label><select id="inspectionOwner" name="owner" required>' + d.people.map((p) => '<option>' + esc(p.name) + '</option>').join("") + '</select></div>' +
      '<div class="field"><label for="inspectionDue">Due date *</label><input type="date" id="inspectionDue" name="dueDate" value="' + esc(dateInputAt(1)) + '" required></div>' +
      '<div class="field"><label for="inspectionPriority">Priority</label><select id="inspectionPriority" name="priority"><option>High</option><option selected>Medium</option><option>Low</option></select></div>' +
      '</div><p class="field-note">This creates a browser-local record only. No one else will receive or see it.</p>' +
      '<div class="modal-footer modal-inline-footer"><button class="button" type="button" data-close-dialog>Cancel</button><button class="button button-primary" type="submit">' + icon("plus") + ' Create inspection</button></div></form>', "", true);
  }

  if (type === "evidence-detail" || type === "review-evidence") {
    const evidence = (d.evidence || []).find((item) => item.id === modalState.id);
    if (!evidence) return modalWrap("Evidence record unavailable", "", emptyState("Record not found", "Close this dialog and refresh the workspace."));
    const target = evidenceTarget(evidence);
    const currentReviewState = evidence.reviewStatus;
    if (type === "review-evidence") {
      const targetState = modalState.target;
      const actionLabel = targetState === "accepted" ? "Accept reference" :
        targetState === "rejected" ? "Reject reference" : "Mark superseded";
      if (!["accepted", "rejected", "superseded"].includes(targetState)) {
        return modalWrap("Review unavailable", evidence.id, emptyState("Unsupported review state", "Close this dialog and choose a supported review action."));
      }
      return modalWrap(actionLabel, evidence.id + " · " + evidence.title,
        '<div class="demo-banner">' + icon("info") + '<div><strong>Review the reference, not a missing file</strong><p>This action records a reviewer, timestamp and rationale for the metadata reference. It does not verify file authenticity or physical conditions.</p></div></div>' +
        '<form id="reviewEvidenceForm" data-form="review-evidence"><div class="form-grid">' +
        '<div class="field full"><label for="evidenceReviewer">Reviewer *</label><select id="evidenceReviewer" name="reviewer" required>' + d.people.map((person) => '<option>' + esc(person.name) + '</option>').join("") + '</select></div>' +
        '<div class="field full"><label for="evidenceReviewNote">Review rationale *</label><textarea id="evidenceReviewNote" name="reviewNote" required minlength="8" maxlength="1200" placeholder="Explain what was checked, why this state is appropriate, and any limitation."></textarea><div class="field-note">At least 8 characters. This rationale is stored with the reference.</div></div>' +
        '</div><div class="modal-footer modal-inline-footer"><button class="button" type="button" data-close-dialog>Cancel</button><button class="button button-primary" type="submit">' + icon("check") + ' ' + actionLabel + '</button></div></form>', "", true);
    }
    const targetLink = target.record
      ? '<div class="exception-row"><div class="exception-copy"><div class="exception-title">' + esc(target.title) + '</div><div class="exception-meta">' + esc(target.config.label + " · " + evidence.linkedEntityId) + '</div></div>' + evidenceTargetButton(evidence) + '</div>'
      : '<div class="integrity-warning"><strong>Linked record unavailable</strong><div>Repair the linked record before relying on this reference.</div></div>';
    const reviewTrail = currentReviewState === "pending_review"
      ? '<div class="integrity-warning"><strong>Review pending</strong><div>The origin is recorded, but no review decision has been made.</div></div>'
      : '<div class="integrity-ok"><strong>Review state: ' + esc(displayStatus(currentReviewState)) + '</strong><div>' + esc((evidence.reviewedBy || "Reviewer not recorded") + " · " + (evidence.reviewedAt ? formatDateTime(evidence.reviewedAt) : "Time not recorded")) + '</div><p class="page-subtitle">' + esc(evidence.reviewNote || "No rationale recorded.") + '</p></div>';
    let reviewActions = "";
    if (currentReviewState === "pending_review") {
      reviewActions = '<button class="button" type="button" data-review-evidence="' + esc(evidence.id) + '" data-evidence-target="rejected">Reject reference</button>' +
        '<button class="button button-primary" type="button" data-review-evidence="' + esc(evidence.id) + '" data-evidence-target="accepted">' + icon("check") + ' Accept reference</button>';
    } else if (["accepted", "rejected"].includes(currentReviewState)) {
      reviewActions = '<button class="button" type="button" data-review-evidence="' + esc(evidence.id) + '" data-evidence-target="superseded">Mark superseded</button>';
    }
    return modalWrap(evidence.title, evidence.id + " · Evidence metadata",
      '<div class="modal-record-grid"><div><div class="modal-record-label">Reference type</div><div class="modal-record-value">' + esc(evidenceTypeLabel(evidence.evidenceType)) + '</div></div>' +
      '<div><div class="modal-record-label">Review state</div>' + pill(currentReviewState) + '</div>' +
      '<div><div class="modal-record-label">Captured / recorded</div><div class="modal-record-value">' + esc(formatDateTime(evidence.capturedAt)) + '</div></div>' +
      '<div><div class="modal-record-label">Recorded by</div><div class="modal-record-value">' + esc(evidence.capturedBy) + '</div></div>' +
      '<div><div class="modal-record-label">Storage mode</div><div class="modal-record-value">Metadata only · No file stored</div></div>' +
      '<div><div class="modal-record-label">Version</div><div class="modal-record-value">' + esc(evidence.version || 1) + '</div></div></div>' +
      '<div class="modal-section-title">Linked operational record</div>' + targetLink +
      '<div class="modal-section-title">Origin and context</div><p class="page-subtitle">' + esc(evidence.sourceDescription) + '</p>' +
      '<div class="modal-section-title">Source reference</div><p class="page-subtitle">' + esc(evidence.sourceReference || "No external source identifier recorded.") + '</p>' +
      '<div class="modal-section-title">Review decision</div>' + reviewTrail +
      '<p class="field-note top-space">An accepted reference is not independent proof that underlying evidence is genuine, accessible, current, or sufficient.</p>',
      '<button class="button" type="button" data-close-dialog>Close</button>' + reviewActions, true);
  }

  if (type === "inspection-detail") {
    const inspection = d.inspections.find((i) => i.id === modalState.id);
    if (!inspection) return modalWrap("Record unavailable", "The inspection could not be found in this browser.", emptyState("Record not found", "Close this dialog and refresh the workspace."));
    const items = (inspection.checklist || []).filter((c) => c.required !== false);
    const done = items.filter((c) => ["done", "not_applicable"].includes(c.status)).length;
    const canComplete = items.length > 0 && done === items.length && inspection.status === "in_progress";
    const checklist = '<div class="checklist">' + items.map((item) => '<button type="button" class="check-row ' + (["done", "not_applicable"].includes(item.status) ? "is-done" : "") +
      '" data-check-item="' + esc(item.id) + '" data-inspection-id="' + esc(inspection.id) + '"' + (["completed", "cancelled"].includes(inspection.status) ? " disabled" : "") + '><span class="check-box"></span><span><span class="check-label">' + esc(item.label) + '</span><span class="check-meta">' +
      (["done", "not_applicable"].includes(item.status) ? "Marked complete in demo" : "Required check · not complete") + '</span></span></button>').join("") + '</div>';
    let footer = '<button class="button" type="button" data-close-dialog>Close</button>';
    if (inspection.status === "scheduled") footer = '<button class="button" type="button" data-close-dialog>Close</button><button class="button button-primary" data-start-inspection="' + esc(inspection.id) + '">' + icon("arrow") + ' Start inspection</button>';
    if (inspection.status === "in_progress") footer = '<button class="button" type="button" data-close-dialog>Close</button><button class="button button-primary" type="button" data-complete-inspection="' + esc(inspection.id) + '"' + (canComplete ? "" : " disabled") + '>' + icon("check") + ' Complete inspection</button>';
    return modalWrap(inspection.title, inspection.id + " · " + siteName(inspection.siteId), 
      '<div class="modal-record-grid"><div><div class="modal-record-label">Status</div>' + pill(inspectionStatus(inspection)) + '</div><div><div class="modal-record-label">Owner</div><div class="modal-record-value">' + esc(inspection.owner) + '</div></div>' +
      '<div><div class="modal-record-label">Due date</div><div class="modal-record-value">' + esc(formatDateTime(inspection.dueAt)) + '</div></div><div><div class="modal-record-label">Priority</div>' + priorityPill(inspection.priority) + '</div></div>' +
      '<div class="modal-section-title">Required checklist · ' + done + ' of ' + items.length + ' complete</div>' + checklist +
      (inspection.status === "in_progress" && !canComplete ? '<p class="field-note">Complete every required check before the completion transition is enabled.</p>' : '') +
      (inspection.completedAt ? '<div class="field-note top-space">Completed at ' + esc(formatDateTime(inspection.completedAt)) + '</div>' : ''),
      footer, true);
  }

  if (type === "create-finding") {
    const options = d.sites.map((s) => '<option value="' + esc(s.id) + '">' + esc(s.name) + '</option>').join("");
    return modalWrap("Log a finding", "A finding records an exception. Closing its action and verifying effectiveness are separate steps.",
      '<form id="createFindingForm" data-form="create-finding"><div class="form-grid">' +
      '<div class="field full"><label for="findingTitle">Finding summary *</label><input id="findingTitle" name="title" required maxlength="160" placeholder="Describe the observed condition"></div>' +
      '<div class="field"><label for="findingSite">Site *</label><select id="findingSite" name="siteId" required>' + options + '</select></div>' +
      '<div class="field"><label for="findingSeverity">Severity classification *</label><select id="findingSeverity" name="severity"><option value="critical">Critical</option><option value="high" selected>High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>' +
      '<div class="field"><label for="findingOwner">Accountable owner *</label><select id="findingOwner" name="owner" required>' + d.people.map((p) => '<option>' + esc(p.name) + '</option>').join("") + '</select></div>' +
      '<div class="field"><label for="findingDue">Follow-up due date *</label><input type="date" id="findingDue" name="dueDate" value="' + esc(dateInputAt(3)) + '" required></div>' +
      '<div class="field full"><label for="findingDescription">Observation / context</label><textarea id="findingDescription" name="description" maxlength="1200" placeholder="Record context, not assumptions. Avoid sensitive details in this demo."></textarea></div>' +
      '<div class="field full"><label class="check-option"><input type="checkbox" name="createAction" checked> Create a linked corrective action</label></div>' +
      '</div><p class="field-note">This does not upload evidence or trigger an incident-response process.</p>' +
      '<div class="modal-footer modal-inline-footer"><button class="button" type="button" data-close-dialog>Cancel</button><button class="button button-primary" type="submit">' + icon("plus") + ' Save finding</button></div></form>', "", true);
  }

  if (type === "finding-detail" || type === "verify-finding") {
    const finding = d.findings.find((f) => f.id === modalState.id);
    if (!finding) return modalWrap("Finding unavailable", "", emptyState("Record not found", "Close this dialog and refresh the workspace."));
    const linkedActions = d.actions.filter((a) => (finding.actionIds || []).includes(a.id));
    const allResolved = linkedActions.every((a) => ["resolved", "verified"].includes(a.status));
    if (type === "verify-finding") {
      return modalWrap("Verify finding effectiveness", finding.id + " · " + finding.title,
        '<div class="demo-banner">' + icon("info") + '<div><strong>Verification is a separate decision</strong><p>Only record verification when the organization’s defined checks support it. This demo does not validate physical conditions or evidence files.</p></div></div>' +
        '<form id="verifyFindingForm" data-form="verify-finding"><div class="field"><label for="verifyNote">Verification note *</label><textarea id="verifyNote" name="note" required minlength="8" placeholder="Describe how effectiveness was checked and what was observed."></textarea><div class="field-note">At least 8 characters. Record the rationale, not just “done”.</div></div>' +
        '<div class="modal-footer modal-inline-footer"><button class="button" type="button" data-close-dialog>Cancel</button><button class="button button-primary" type="submit">' + icon("check") + ' Verify finding</button></div></form>', "", true);
    }
    return modalWrap(finding.title, finding.id + " · " + siteName(finding.siteId),
      '<div class="modal-record-grid"><div><div class="modal-record-label">Severity</div>' + priorityPill(finding.severity) + '</div><div><div class="modal-record-label">Status</div>' + pill(finding.status) + '</div>' +
      '<div><div class="modal-record-label">Owner</div><div class="modal-record-value">' + esc(finding.owner) + '</div></div><div><div class="modal-record-label">Due date</div><div class="modal-record-value">' + esc(formatDateTime(finding.dueAt)) + '</div></div></div>' +
      '<div class="modal-section-title">Observation</div><p class="page-subtitle">' + esc(finding.description || "No additional context recorded.") + '</p>' +
      '<div class="modal-section-title">Linked corrective actions</div>' +
      (linkedActions.length ? '<div class="exception-list">' + linkedActions.map((action) => '<div class="exception-row"><div class="exception-copy"><div class="exception-title">' + esc(action.title) + '</div><div class="exception-meta">' + esc(action.id + " · " + action.owner + " · Due " + formatDate(action.dueAt)) + '</div></div>' + pill(actionStatus(action)) + '<button class="link-button" data-open-action="' + esc(action.id) + '">Open</button></div>').join("") + '</div>' : emptyState("No linked actions", "No corrective action has been linked." )) +
      (finding.verificationNote ? '<div class="modal-section-title">Verification note</div><p class="page-subtitle">' + esc(finding.verificationNote) + '</p>' : '') +
      '<div class="modal-section-title">Lifecycle guard</div><p class="page-subtitle">' + (allResolved ? "All linked actions are resolved; the finding may be submitted for verification." : "Resolve all linked actions before verifying effectiveness.") + '</p>',
      '<button class="button" type="button" data-close-dialog>Close</button>' +
      (!["verified", "resolved", "dismissed"].includes(finding.status) ? '<button class="button button-primary" type="button" data-verify-finding="' + esc(finding.id) + '"' + (allResolved ? "" : " disabled") + '>' + icon("check") + ' Verify effectiveness</button>' : ''), true);
  }



  if (type === "create-audit") {
    return modalWrap("Schedule an audit", "Creates an illustrative audit with four required completion steps.",
      '<form id="createAuditForm" data-form="create-audit"><div class="form-grid">' +
      '<div class="field full"><label for="auditTitle">Audit title *</label><input id="auditTitle" name="title" required maxlength="140" placeholder="e.g. Monthly control assurance review"></div>' +
      '<div class="field"><label for="auditScope">Scope *</label><input id="auditScope" name="scope" required maxlength="160" placeholder="Sites, processes, controls…"></div>' +
      '<div class="field"><label for="auditOwner">Owner *</label><select id="auditOwner" name="owner" required>' + d.people.map((p) => '<option>' + esc(p.name) + '</option>').join("") + '</select></div>' +
      '<div class="field full"><label for="auditCriteria">Criteria / reference *</label><input id="auditCriteria" name="criteria" required maxlength="240" placeholder="Approved procedure or defined criteria reference"></div>' +
      '<div class="field"><label for="auditDueDate">Due date *</label><input type="date" id="auditDueDate" name="dueDate" value="' + esc(dateInputAt(7)) + '" required></div>' +
      '</div><p class="field-note">Use approved criteria from the organization controlled documents. No legal text or standards have been validated in this demo.</p>' +
      '<div class="modal-footer modal-inline-footer"><button class="button" type="button" data-close-dialog>Cancel</button><button class="button button-primary" type="submit">' + icon("plus") + ' Schedule audit</button></div></form>', "", true);
  }

  if (type === "audit-detail" || type === "complete-audit") {
    const audit = d.audits.find((a) => a.id === modalState.id);
    if (!audit) return modalWrap("Audit unavailable", "The audit was not found in the current browser workspace.", emptyState("Record not found", "Close this dialog and refresh the workspace."));
    const checks = (audit.checklist || []).filter((item) => item.required !== false);
    const done = checks.filter((item) => ["done", "not_applicable"].includes(item.status)).length;
    const allDone = checks.length > 0 && done === checks.length;
    if (type === "complete-audit") {
      return modalWrap("Record audit conclusion", audit.id + " · " + audit.title,
        '<div class="demo-banner">' + icon("info") + '<div><strong>Conclusion is required for completion</strong><p>Complete every required audit step, then record a substantive conclusion. Evidence files are not managed by this demo.</p></div></div>' +
        '<form id="completeAuditForm" data-form="complete-audit"><div class="field"><label for="auditConclusion">Audit conclusion *</label><textarea id="auditConclusion" name="note" required minlength="12" placeholder="Summarize scope, reviewed evidence, findings and next actions.">' + esc(audit.completionNote || "") + '</textarea><div class="field-note">At least 12 characters.</div></div>' +
        '<div class="modal-footer modal-inline-footer"><button class="button" type="button" data-close-dialog>Cancel</button><button class="button button-primary" type="submit">' + icon("check") + ' Complete audit</button></div></form>', "", true);
    }
    let footer = '<button class="button" type="button" data-close-dialog>Close</button>';
    if (audit.status === "scheduled") footer += '<button class="button button-primary" type="button" data-start-audit="' + esc(audit.id) + '">' + icon("arrow") + ' Start audit</button>';
    if (audit.status === "in_progress") footer += '<button class="button button-primary" type="button" data-finish-audit="' + esc(audit.id) + '"' + (allDone ? "" : " disabled") + '>' + icon("check") + ' Record conclusion</button>';
    return modalWrap(audit.title, audit.id + " · " + audit.scope,
      '<div class="modal-record-grid"><div><div class="modal-record-label">Status</div>' + pill(isAuditOverdue(audit) ? "overdue" : audit.status) + '</div>' +
      '<div><div class="modal-record-label">Owner</div><div class="modal-record-value">' + esc(audit.owner) + '</div></div>' +
      '<div><div class="modal-record-label">Due date</div><div class="modal-record-value">' + esc(formatDateTime(audit.dueAt)) + '</div></div>' +
      '<div><div class="modal-record-label">Criteria</div><div class="modal-record-value">' + esc(audit.criteria || "Not recorded") + '</div></div></div>' +
      '<div class="modal-section-title">Required audit steps · ' + done + ' of ' + checks.length + ' complete</div>' +
      '<div class="checklist">' + checks.map((item) => '<button type="button" class="check-row ' + (["done", "not_applicable"].includes(item.status) ? "is-done" : "") +
        '" data-audit-check="' + esc(item.id) + '" data-audit-id="' + esc(audit.id) + '"' + (audit.status !== "in_progress" ? " disabled" : "") + '><span class="check-box"></span><span><span class="check-label">' + esc(item.label) + '</span><span class="check-meta">' +
        (["done", "not_applicable"].includes(item.status) ? "Marked complete in demo" : "Required step · not complete") + '</span></span></button>').join("") + '</div>' +
      (!allDone && audit.status === "in_progress" ? '<p class="field-note top-space">The conclusion action remains disabled until every required step is marked complete.</p>' : '') +
      (audit.completionNote ? '<div class="modal-section-title">Recorded conclusion</div><p class="page-subtitle">' + esc(audit.completionNote) + '</p>' : ''),
      footer, true);
  }
  if (type === "create-review") {
    const peopleOptions = d.people.map((p) => '<option>' + esc(p.name) + '</option>').join("");
    return modalWrap("Schedule a management review", "Creates a local review record; no calendar invitation or notification is sent.",
      '<form id="createReviewForm" data-form="create-review"><div class="form-grid">' +
      '<div class="field full"><label for="reviewTitle">Review title *</label><input id="reviewTitle" name="title" maxlength="140" required placeholder="e.g. Monthly operational assurance review"></div>' +
      '<div class="field"><label for="reviewPeriod">Reporting period *</label><input id="reviewPeriod" name="period" type="month" required></div>' +
      '<div class="field"><label for="reviewDate">Scheduled date *</label><input id="reviewDate" name="scheduledDate" type="date" value="' + esc(dateInputAt(7)) + '" required></div>' +
      '<div class="field full"><label for="reviewChair">Chair / accountable lead *</label><select id="reviewChair" name="chair" required>' + peopleOptions + '</select></div>' +
      '</div><p class="field-note">The reporting period and meeting date are distinct. This record has no external calendar integration.</p>' +
      '<div class="modal-footer modal-inline-footer"><button class="button" type="button" data-close-dialog>Cancel</button><button class="button button-primary" type="submit">' + icon("calendar") + ' Create review</button></div></form>', "", true);
  }

  if (type === "review-detail" || type === "add-review-follow-up" || type === "complete-review") {
    const review = d.reviews.find((r) => r.id === modalState.id);
    if (!review) return modalWrap("Review unavailable", "The review is not in the current browser workspace.", emptyState("Record not found", "Close this dialog and refresh the workspace."));
    const tasks = d.actions.filter((a) => (review.decisionActionIds || []).includes(a.id));
    if (type === "add-review-follow-up") {
      if (review.status !== "in_progress") return modalWrap("Follow-up unavailable", "Only an in-progress review accepts follow-ups.", emptyState("Review is not in progress", "Start the review before recording decisions."));
      return modalWrap("Record a management decision", review.id + " · " + review.title,
        '<form id="reviewFollowUpForm" data-form="add-review-follow-up"><div class="form-grid">' +
        '<div class="field full"><label for="reviewDecisionTitle">Decision / follow-up *</label><input id="reviewDecisionTitle" name="title" maxlength="160" minlength="4" required placeholder="State the outcome that must be delivered"></div>' +
        '<div class="field"><label for="reviewDecisionOwner">Accountable owner *</label><select id="reviewDecisionOwner" name="owner" required>' + d.people.map((p) => '<option>' + esc(p.name) + '</option>').join("") + '</select></div>' +
        '<div class="field"><label for="reviewDecisionDue">Due date *</label><input id="reviewDecisionDue" type="date" name="dueDate" value="' + esc(dateInputAt(5)) + '" required></div>' +
        '<div class="field"><label for="reviewDecisionPriority">Priority</label><select id="reviewDecisionPriority" name="priority"><option>Critical</option><option>High</option><option selected>Medium</option><option>Low</option></select></div>' +
        '</div><p class="field-note">The resulting task is added to the shared demo work queue. It is not sent to the named owner.</p>' +
        '<div class="modal-footer modal-inline-footer"><button class="button" type="button" data-close-dialog>Cancel</button><button class="button button-primary" type="submit">' + icon("plus") + ' Record follow-up</button></div></form>', "", true);
    }
    if (type === "complete-review") {
      return modalWrap("Complete management review", review.id + " · " + review.title,
        '<div class="demo-banner">' + icon("info") + '<div><strong>Meeting completion does not close decisions</strong><p>Follow-up tasks remain open until each is separately resolved.</p></div></div>' +
        '<form id="completeReviewForm" data-form="complete-review"><div class="field"><label for="reviewMinutes">Minutes and decisions *</label><textarea id="reviewMinutes" name="minutes" required minlength="20" placeholder="Summarize reviewed inputs, material decisions, owners, disagreements and next review needs.">' + esc(review.minutes || "") + '</textarea><div class="field-note">At least 20 characters. Avoid recording sensitive personal details in sample data.</div></div>' +
        '<div class="modal-footer modal-inline-footer"><button class="button" type="button" data-close-dialog>Cancel</button><button class="button button-primary" type="submit">' + icon("check") + ' Complete review</button></div></form>', "", true);
    }
    const openTasks = tasks.filter((a) => !["resolved", "verified", "cancelled"].includes(a.status)).length;
    let footer = '<button class="button" type="button" data-close-dialog>Close</button>';
    if (review.status === "scheduled") footer += '<button class="button button-primary" type="button" data-start-review="' + esc(review.id) + '">' + icon("arrow") + ' Start review</button>';
    if (review.status === "in_progress") footer += '<button class="button" type="button" data-add-review-follow-up="' + esc(review.id) + '">' + icon("plus") + ' Add follow-up</button><button class="button button-primary" type="button" data-complete-review="' + esc(review.id) + '">' + icon("check") + ' Complete review</button>';
    return modalWrap(review.title, review.id + " · " + review.period + " · " + review.chair,
      '<div class="modal-record-grid"><div><div class="modal-record-label">Meeting state</div>' + pill(review.status) + '</div>' +
      '<div><div class="modal-record-label">Scheduled</div><div class="modal-record-value">' + esc(formatDateTime(review.scheduledAt)) + '</div></div>' +
      '<div><div class="modal-record-label">Chair</div><div class="modal-record-value">' + esc(review.chair) + '</div></div>' +
      '<div><div class="modal-record-label">Follow-ups open</div><div class="modal-record-value">' + openTasks + ' / ' + tasks.length + '</div></div></div>' +
      '<div class="modal-section-title">Follow-up decisions</div>' +
      (tasks.length ? '<div class="exception-list">' + tasks.map((task) => '<div class="exception-row"><div class="exception-copy"><div class="exception-title">' + esc(task.title) + '</div><div class="exception-meta">' + esc(task.id + " · " + task.owner + " · Due " + formatDate(task.dueAt, { year: true })) + '</div></div>' + pill(actionStatus(task)) + '<button class="link-button" data-open-action="' + esc(task.id) + '">Open</button></div>').join("") + '</div>' : emptyState("No follow-ups recorded", "Record a decision with an owner and due date while the review is in progress.")) +
      (review.minutes ? '<div class="modal-section-title">Recorded minutes</div><p class="page-subtitle">' + esc(review.minutes) + '</p>' : '<p class="field-note top-space">Minutes have not yet been recorded.</p>') +
      (review.completedAt ? '<p class="field-note top-space">Completed at ' + esc(formatDateTime(review.completedAt)) + '. Follow-up tasks remain separately tracked.</p>' : ''),
      footer, true);
  }
  if (type === "action-detail" || type === "close-action") {
    const action = d.actions.find((a) => a.id === modalState.id);
    if (!action) return modalWrap("Action unavailable", "", emptyState("Record not found", "Close this dialog and refresh the workspace."));
    const isReviewFollowUp = Boolean(action.reviewId);
    if (type === "close-action") {
      return modalWrap(isReviewFollowUp ? "Resolve management follow-up" : "Resolve corrective action", action.id + " · " + action.title,
        '<div class="demo-banner">' + icon("info") + '<div><strong>' + (isReviewFollowUp ? "Resolution is separate from review completion" : "Resolution is not effectiveness verification") + '</strong><p>' + (isReviewFollowUp ? "Record what was delivered. Completing the meeting does not close the follow-up." : "Explain what was done. A linked finding remains open until separately verified.") + '</p></div></div>' +
        '<form id="closeActionForm" data-form="close-action"><div class="field"><label for="resolutionNote">Resolution note *</label><textarea id="resolutionNote" name="note" required minlength="8" placeholder="Record the action taken and resulting state."></textarea><div class="field-note">At least 8 characters. Evidence uploads are not enabled.</div></div>' +
        '<div class="modal-footer modal-inline-footer"><button class="button" type="button" data-close-dialog>Cancel</button><button class="button button-primary" type="submit">' + icon("check") + ' Resolve action</button></div></form>', "", true);
    }
    const finding = d.findings.find((f) => f.id === action.findingId);
    return modalWrap(action.title, action.id + " · Corrective action",
      '<div class="modal-record-grid"><div><div class="modal-record-label">Status</div>' + pill(actionStatus(action)) + '</div><div><div class="modal-record-label">Priority</div>' + priorityPill(action.priority) + '</div>' +
      '<div><div class="modal-record-label">Owner</div><div class="modal-record-value">' + esc(action.owner) + '</div></div><div><div class="modal-record-label">Due date</div><div class="modal-record-value">' + esc(formatDateTime(action.dueAt)) + '</div></div></div>' +
      (finding ? '<div class="modal-section-title">Linked finding</div><div class="exception-row"><div class="exception-copy"><div class="exception-title">' + esc(finding.title) + '</div><div class="exception-meta">' + esc(finding.id + " · " + displayStatus(finding.status)) + '</div></div><button class="link-button" data-open-finding="' + esc(finding.id) + '">Open finding</button></div>' : '') +
      (action.reviewId ? '<div class="modal-section-title">Source management review</div><div class="exception-row"><div class="exception-copy"><div class="exception-title">' + esc(currentData().reviews.find((r) => r.id === action.reviewId)?.title || "Review unavailable") + '</div><div class="exception-meta">' + esc(action.reviewId) + '</div></div><button class="link-button" data-open-review="' + esc(action.reviewId) + '">Open review</button></div>' : (!finding ? '<p class="page-subtitle">No linked finding.</p>' : '')) +
      (action.resolutionNote ? '<div class="modal-section-title">Resolution note</div><p class="page-subtitle">' + esc(action.resolutionNote) + '</p>' : '') +
      (action.resolvedAt ? '<p class="field-note">Resolved at ' + esc(formatDateTime(action.resolvedAt)) + '</p>' : ''),
      '<button class="button" type="button" data-close-dialog>Close</button>' +
      (!["resolved", "verified", "cancelled"].includes(action.status) ? '<button class="button button-primary" type="button" data-close-action="' + esc(action.id) + '">' + icon("check") + (isReviewFollowUp ? ' Resolve follow-up' : ' Resolve action') + '</button>' : ''), true);
  }
  return "";
}

function render() {
  const meta = pageMeta[activePage] || pageMeta.overview;
  const queueCount = currentData().inspections.filter((i) => !["completed", "cancelled"].includes(i.status)).length +
    currentData().actions.filter((a) => !["resolved", "verified", "cancelled"].includes(a.status)).length;
  app.innerHTML = '<div class="app-shell">' + renderSidebar() + '<div class="main-shell">' +
    '<header class="topbar"><div class="breadcrumb">Inspectra Core <span class="breadcrumb-separator">/</span> <strong>' + esc(meta[0]) + '</strong></div>' +
    '<div class="topbar-actions"><form class="search-box" id="searchForm" role="search">' + icon("search") +
    '<input id="globalSearch" name="q" type="search" value="' + esc(searchQuery) + '" placeholder="Search all records (Ctrl/⌘K)…" aria-label="Search all records"><button class="link-button" type="submit" aria-label="Search all registers">Search</button></form>' +
    '<div class="user-chip"><div class="avatar">DO</div><div class="user-details"><div class="user-name">Demo operator</div><div class="user-role">Local demo identity</div></div></div></div></header>' +
    '<main class="page-container"><div class="demo-banner">' + icon("info") + '<div><strong>Sample workspace · Browser-local data</strong><p>For product exploration and domain-rule testing only. No live sites, shared users, evidence storage or external systems are connected.</p></div></div>' +
    '<section id="page-content">' + renderPage() + '</section></main></div>' + renderModal() +
    (toastState ? '<div class="toast ' + (toastState.isError ? "error" : "") + '" role="status" aria-live="polite">' + esc(toastState.message) + '</div>' : '') +
    '</div>';
  const search = document.querySelector("#globalSearch");
  if (search) search.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && search.value) {
      search.value = "";
      searchQuery = "";
      if (activePage === "search") activePage = "overview";
      render();
    }
  });
}

function openModal(type, id = null) {
  modalState = { type, id };
  render();
}
function closeModal() {
  modalState = null;
  render();
}
function recordChange(action, entityType, entityId, summary) {
  addActivity(action, entityType, entityId, summary);
  persistAndRender(summary);
}
function onClick(event) {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const pageButton = target.closest("[data-page]");
  if (pageButton) {
    if (pageButton.classList.contains("nav-item")) searchQuery = "";
    activePage = pageButton.dataset.page;
    modalState = null;
    render();
    return;
  }
  if (target.closest("[data-clear-search]")) { searchQuery = ""; activePage = "overview"; render(); return; }
  if (target.matches("[data-close-modal]")) { closeModal(); return; }
  if (target.closest("[data-close-dialog]")) { closeModal(); return; }
  if (target.closest("[data-create-inspection]")) { openModal("create-inspection"); return; }
  if (target.closest("[data-create-finding]")) { openModal("create-finding"); return; }
  if (target.closest("[data-create-audit]")) { openModal("create-audit"); return; }
  const openAuditButton = target.closest("[data-open-audit]");
  if (openAuditButton) { openModal("audit-detail", openAuditButton.dataset.openAudit); return; }
  const startAuditButton = target.closest("[data-start-audit]");
  if (startAuditButton) {
    const audit = currentData().audits.find((a) => a.id === startAuditButton.dataset.startAudit);
    try {
      Object.assign(audit, transitionAudit(audit, "in_progress"));
      addActivity("started", "audit", audit.id, "Audit started: " + audit.title);
      modalState = { type: "audit-detail", id: audit.id };
      persistAndRender("Audit started in the local demo.");
    } catch (error) { showToast(error.message, true); render(); }
    return;
  }
  const auditCheckButton = target.closest("[data-audit-check]");
  if (auditCheckButton) {
    const audit = currentData().audits.find((a) => a.id === auditCheckButton.dataset.auditId);
    const step = audit?.checklist?.find((item) => item.id === auditCheckButton.dataset.auditCheck);
    if (!audit || audit.status !== "in_progress" || !step) return;
    step.status = step.status === "done" ? "open" : "done";
    audit.version = (audit.version || 1) + 1;
    addActivity("updated", "audit", audit.id, "Audit step updated: " + step.label);
    modalState = { type: "audit-detail", id: audit.id };
    persistAndRender("Audit checklist updated in the local demo.");
    return;
  }
  const finishAuditButton = target.closest("[data-finish-audit]");
  if (finishAuditButton) { openModal("complete-audit", finishAuditButton.dataset.finishAudit); return; }
  if (target.closest("[data-create-review]")) { openModal("create-review"); return; }
  const openReviewButton = target.closest("[data-open-review]");
  if (openReviewButton) { openModal("review-detail", openReviewButton.dataset.openReview); return; }
  const openInspectionButton = target.closest("[data-open-inspection]");
  if (openInspectionButton) { openModal("inspection-detail", openInspectionButton.dataset.openInspection); return; }
  const openFindingButton = target.closest("[data-open-finding]");
  if (openFindingButton) { openModal("finding-detail", openFindingButton.dataset.openFinding); return; }
  const openActionButton = target.closest("[data-open-action]");
  if (openActionButton) { openModal("action-detail", openActionButton.dataset.openAction); return; }
  const startReviewButton = target.closest("[data-start-review]");
  if (startReviewButton) {
    const review = currentData().reviews.find((r) => r.id === startReviewButton.dataset.startReview);
    try {
      Object.assign(review, startManagementReview(review));
      addActivity("started", "management_review", review.id, "Management review started: " + review.title);
      modalState = { type: "review-detail", id: review.id };
      persistAndRender("Management review started in the local demo.");
    } catch (error) { showToast(error.message, true); render(); }
    return;
  }
  const addReviewFollowUpButton = target.closest("[data-add-review-follow-up]");
  if (addReviewFollowUpButton) { openModal("add-review-follow-up", addReviewFollowUpButton.dataset.addReviewFollowUp); return; }
  const completeReviewButton = target.closest("[data-complete-review]");
  if (completeReviewButton) { openModal("complete-review", completeReviewButton.dataset.completeReview); return; }
  const checkButton = target.closest("[data-check-item]");
  if (checkButton) {
    const inspection = currentData().inspections.find((i) => i.id === checkButton.dataset.inspectionId);
    if (!inspection || ["completed", "cancelled"].includes(inspection.status)) return;
    const item = inspection.checklist.find((c) => c.id === checkButton.dataset.checkItem);
    if (!item) return;
    item.status = item.status === "done" ? "open" : "done";
    if (inspection.status === "scheduled") {
      try {
        Object.assign(inspection, transitionInspection(inspection, "in_progress"));
      } catch (error) { showToast(error.message, true); }
    } else {
      inspection.version = (inspection.version || 1) + 1;
    }
    addActivity("updated", "inspection", inspection.id, "Checklist item updated: " + item.label);
    persistAndRender("Checklist updated. Changes remain in this browser only.");
    return;
  }
  const startButton = target.closest("[data-start-inspection]");
  if (startButton) {
    const inspection = currentData().inspections.find((i) => i.id === startButton.dataset.startInspection);
    try {
      Object.assign(inspection, transitionInspection(inspection, "in_progress"));
      recordChange("started", "inspection", inspection.id, "Inspection started: " + inspection.title);
      modalState = { type: "inspection-detail", id: inspection.id };
      render();
    } catch (error) { showToast(error.message, true); render(); }
    return;
  }
  const completeButton = target.closest("[data-complete-inspection]");
  if (completeButton) {
    const inspection = currentData().inspections.find((i) => i.id === completeButton.dataset.completeInspection);
    try {
      Object.assign(inspection, transitionInspection(inspection, "completed"));
      addActivity("completed", "inspection", inspection.id, "Inspection completed after required checklist checks");
      modalState = { type: "inspection-detail", id: inspection.id };
      persistAndRender("Inspection completed in the local demo.");
    } catch (error) { showToast(error.message, true); render(); }
    return;
  }
  const closeActionButton = target.closest("[data-close-action]");
  if (closeActionButton) { openModal("close-action", closeActionButton.dataset.closeAction); return; }
  const verifyButton = target.closest("[data-verify-finding]");
  if (verifyButton) { openModal("verify-finding", verifyButton.dataset.verifyFinding); return; }
  const exportButton = target.closest("[data-export]");
  if (exportButton) { exportData(exportButton.dataset.export); return; }
  const resetButton = target.closest("[data-reset-demo]");
  if (resetButton) {
    if (!window.confirm("Reset this browser-local demo to the original sample records? Current local changes will be lost.")) return;
    workspace = resetWorkspace();
    modalState = null;
    searchQuery = "";
    activePage = "overview";
    persistAndRender("Demo workspace reset to the original sample records.");
    return;
  }
}


function createAudit(form) {
  const data = new FormData(form);
  const title = String(data.get("title") || "").trim();
  const scope = String(data.get("scope") || "").trim();
  const criteria = String(data.get("criteria") || "").trim();
  const owner = String(data.get("owner") || "").trim();
  const dueDate = String(data.get("dueDate") || "");
  if (title.length < 5 || !scope || !criteria || !owner || !dueDate) {
    throw new Error("Complete the title, scope, criteria, owner and due date.");
  }
  const audit = {
    id: nextId("AUD", currentData().audits),
    title, scope, criteria, owner,
    dueAt: dateAtLocalHour(dueDate, 15, "audit due date"),
    status: "scheduled", checklist: makeAuditChecklist(0),
    version: 1, createdAt: new Date().toISOString()
  };
  assertCandidateIntegrity({ ...currentData(), audits: [audit, ...currentData().audits] }, [
    { collection: "audits", id: audit.id }
  ]);
  currentData().audits.unshift(audit);
  addActivity("created", "audit", audit.id, "Audit scheduled: " + audit.title);
  activePage = "audits";
  modalState = null;
  persistAndRender("Audit scheduled in the local demo.");
}

function finishAudit(form) {
  const data = new FormData(form);
  const audit = currentData().audits.find((a) => a.id === modalState?.id);
  Object.assign(audit, transitionAudit(audit, "completed", data.get("note")));
  addActivity("completed", "audit", audit.id, "Audit conclusion recorded");
  modalState = { type: "audit-detail", id: audit.id };
  persistAndRender("Audit completed in the local demo with a recorded conclusion.");
}
function createInspection(form) {
  const data = new FormData(form);
  const title = String(data.get("title") || "").trim();
  const siteId = String(data.get("siteId") || "");
  const owner = String(data.get("owner") || "").trim();
  const dueDate = String(data.get("dueDate") || "");
  if (!title || !siteId || !owner || !dueDate) throw new Error("Complete the required fields.");
  const dueAt = dateAtLocalHour(dueDate, 15, "inspection due date");
  const inspection = {
    id: nextId("INS", currentData().inspections),
    title, siteId, owner, priority: String(data.get("priority") || "Medium"),
    dueAt, createdAt: new Date().toISOString(), status: "scheduled",
    checklist: makeChecklist(0), version: 1
  };
  assertCandidateIntegrity({ ...currentData(), inspections: [inspection, ...currentData().inspections] }, [
    { collection: "inspections", id: inspection.id }
  ]);
  currentData().inspections.unshift(inspection);
  addActivity("created", "inspection", inspection.id, "Inspection scheduled: " + inspection.title);
  activePage = "inspections";
  modalState = null;
  persistAndRender("Inspection scheduled in the local demo.");
}
function createFinding(form) {
  const data = new FormData(form);
  const title = String(data.get("title") || "").trim();
  const siteId = String(data.get("siteId") || "");
  const owner = String(data.get("owner") || "").trim();
  const dueDate = String(data.get("dueDate") || "");
  if (!title || !siteId || !owner || !dueDate) throw new Error("Complete the required fields.");
  const findingId = nextId("FND", currentData().findings);
  const actionIds = [];
  const finding = {
    id: findingId, title, siteId, assetId: null,
    severity: String(data.get("severity") || "high"),
    status: "open", owner, openedAt: new Date().toISOString(),
    dueAt: dateAtLocalHour(dueDate, 17, "finding due date"),
    actionIds, description: String(data.get("description") || "").trim(), version: 1
  };
  let linkedAction = null;
  if (data.get("createAction") === "on") {
    const actionId = nextId("ACT", currentData().actions);
    linkedAction = {
      id: actionId, title: "Investigate and address: " + title, findingId, owner,
      priority: finding.severity === "critical" ? "Critical" : finding.severity.charAt(0).toUpperCase() + finding.severity.slice(1),
      openedAt: new Date().toISOString(), dueAt: finding.dueAt, status: "open", version: 1
    };
    actionIds.push(actionId);
  }
  const candidate = {
    ...currentData(),
    findings: [finding, ...currentData().findings],
    actions: linkedAction ? [linkedAction, ...currentData().actions] : currentData().actions
  };
  assertCandidateIntegrity(candidate, [
    { collection: "findings", id: finding.id },
    ...(linkedAction ? [{ collection: "actions", id: linkedAction.id }] : [])
  ]);
  currentData().findings.unshift(finding);
  if (linkedAction) currentData().actions.unshift(linkedAction);
  addActivity("created", "finding", finding.id, "Finding logged: " + finding.title);
  activePage = "findings";
  modalState = null;
  persistAndRender("Finding saved" + (actionIds.length ? " with a linked corrective action." : "."));
}


function createManagementReview(form) {
  const data = new FormData(form);
  const title = String(data.get("title") || "").trim();
  const period = String(data.get("period") || "");
  const scheduledDate = String(data.get("scheduledDate") || "");
  const chair = String(data.get("chair") || "").trim();
  if (title.length < 5 || !period || !scheduledDate || !chair) {
    throw new Error("Complete the title, reporting period, scheduled date and chair.");
  }
  if (!isValidReportingMonth(period)) throw new Error("Choose a valid reporting month in YYYY-MM format.");
  const scheduledAt = dateAtLocalHour(scheduledDate, 10, "management review date");
  const review = {
    id: nextId("MR", currentData().reviews),
    title, period, scheduledAt, chair, status: "scheduled",
    decisionActionIds: [], minutes: "", version: 1, createdAt: new Date().toISOString()
  };
  assertCandidateIntegrity({ ...currentData(), reviews: [review, ...currentData().reviews] }, [
    { collection: "reviews", id: review.id }
  ]);
  currentData().reviews.unshift(review);
  addActivity("created", "management_review", review.id, "Management review scheduled: " + review.title);
  activePage = "reviews";
  modalState = null;
  persistAndRender("Management review scheduled in the local demo.");
}

function addManagementFollowUp(form) {
  const data = new FormData(form);
  const review = currentData().reviews.find((r) => r.id === modalState?.id);
  const dueDate = String(data.get("dueDate") || "");
  if (!dueDate) throw new Error("A follow-up due date is required.");
  const followUp = createManagementFollowUp(review, {
    title: data.get("title"),
    owner: data.get("owner"),
    priority: data.get("priority"),
    dueAt: dateAtLocalHour(dueDate, 17, "follow-up due date")
  }, nextId("ACT", currentData().actions));
  const updatedReview = { ...review, decisionActionIds: [...(review.decisionActionIds || []), followUp.id] };
  assertCandidateIntegrity({
    ...currentData(),
    actions: [followUp, ...currentData().actions],
    reviews: currentData().reviews.map((item) => item.id === updatedReview.id ? updatedReview : item)
  }, [
    { collection: "actions", id: followUp.id },
    { collection: "reviews", id: updatedReview.id }
  ]);
  currentData().actions.unshift(followUp);
  review.decisionActionIds = updatedReview.decisionActionIds;
  review.version = (review.version || 1) + 1;
  addActivity("created", "action", followUp.id, "Management follow-up recorded: " + followUp.title);
  modalState = { type: "review-detail", id: review.id };
  persistAndRender("Follow-up assigned in the local demo and added to the work queue.");
}

function finishManagementReview(form) {
  const data = new FormData(form);
  const review = currentData().reviews.find((r) => r.id === modalState?.id);
  Object.assign(review, completeManagementReview(review, data.get("minutes")));
  addActivity("completed", "management_review", review.id, "Management review completed with recorded minutes");
  modalState = { type: "review-detail", id: review.id };
  persistAndRender("Review minutes saved; follow-up tasks remain separately tracked.");
}
function finishAction(form) {
  const data = new FormData(form);
  const action = currentData().actions.find((a) => a.id === modalState?.id);
  const finding = action ? currentData().findings.find((f) => f.id === action.findingId) : null;
  const updated = closeAction(action, data.get("note"), new Date());
  Object.assign(action, updated);
  if (finding) {
    finding.version = (finding.version || 1) + 1;
    if (finding.status === "open") finding.status = "action_required";
  }
  addActivity("resolved", "action", action.id, "Corrective action resolved with a recorded note");
  modalState = { type: "action-detail", id: action.id };
  persistAndRender("Action resolved. The linked finding remains a separate verification decision.");
}
function finishFindingVerification(form) {
  const data = new FormData(form);
  const finding = currentData().findings.find((f) => f.id === modalState?.id);
  const actions = currentData().actions.filter((a) => (finding?.actionIds || []).includes(a.id));
  const updated = verifyFinding(finding, actions, data.get("note"), new Date());
  Object.assign(finding, updated);
  addActivity("verified", "finding", finding.id, "Finding effectiveness verification recorded");
  modalState = { type: "finding-detail", id: finding.id };
  persistAndRender("Finding marked verified in the local demo.");
}
function onSubmit(event) {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || !form.dataset.form) return;
  event.preventDefault();
  try {
    if (form.dataset.form === "create-inspection") createInspection(form);
    if (form.dataset.form === "create-audit") createAudit(form);
    if (form.dataset.form === "complete-audit") finishAudit(form);
    if (form.dataset.form === "create-finding") createFinding(form);
    if (form.dataset.form === "create-review") createManagementReview(form);
    if (form.dataset.form === "add-review-follow-up") addManagementFollowUp(form);
    if (form.dataset.form === "complete-review") finishManagementReview(form);
    if (form.dataset.form === "close-action") finishAction(form);
    if (form.dataset.form === "verify-finding") finishFindingVerification(form);
  } catch (error) {
    const prior = form.querySelector(".form-error");
    if (prior) prior.remove();
    const msg = document.createElement("div");
    msg.className = "form-error";
    msg.setAttribute("role", "alert");
    msg.textContent = error instanceof Error ? error.message : "The requested change could not be saved.";
    form.prepend(msg);
  }
}

function csvDownload(fileName, columns, rows) {
  const csv = toCsv(columns, rows);
  const blob = new Blob(["\\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
function exportData(kind) {
  const d = currentData();
  if (kind === "inspections") {
    csvDownload("inspectra-demo-inspections.csv", [
      { label: "ID", key: "id" }, { label: "Title", key: "title" }, { label: "Site", key: "site" },
      { label: "Owner", key: "owner" }, { label: "Due at", key: "dueAt" }, { label: "Status", key: "status" },
      { label: "Checklist complete", key: "checklistDone" }, { label: "Checklist required", key: "checklistRequired" }
    ], d.inspections.map((i) => ({
      ...i, site: siteName(i.siteId), status: inspectionStatus(i),
      checklistDone: (i.checklist || []).filter((c) => ["done", "not_applicable"].includes(c.status)).length,
      checklistRequired: (i.checklist || []).filter((c) => c.required !== false).length
    })));
  } else if (kind === "actions") {
    csvDownload("inspectra-demo-findings-and-actions.csv", [
      { label: "ID", key: "id" }, { label: "Title", key: "title" }, { label: "Site", key: "site" },
      { label: "Owner", key: "owner" }, { label: "Severity / priority", key: "priority" },
      { label: "Due at", key: "dueAt" }, { label: "Status", key: "status" }, { label: "Finding ID", key: "findingId" },
      { label: "Resolution note", key: "resolutionNote" }
    ], [...d.findings.map((f) => ({ ...f, site: siteName(f.siteId), priority: f.severity })),
      ...d.actions.map((a) => ({ ...a, site: siteName(d.findings.find((f) => f.id === a.findingId)?.siteId), priority: a.priority }))]);
  } else if (kind === "risks") {
    csvDownload("inspectra-demo-risks.csv", [
      { label: "ID", key: "id" }, { label: "Title", key: "title" }, { label: "Site", key: "site" },
      { label: "Category", key: "category" }, { label: "Likelihood (sample)", key: "likelihood" },
      { label: "Consequence (sample)", key: "consequence" }, { label: "Owner", key: "owner" },
      { label: "Status", key: "status" }, { label: "Control", key: "control" }
    ], d.risks.map((r) => ({ ...r, site: siteName(r.siteId) })));
  } else if (kind === "audits") {
    csvDownload("inspectra-demo-audits.csv", [
      { label: "ID", key: "id" }, { label: "Title", key: "title" }, { label: "Scope", key: "scope" },
      { label: "Criteria", key: "criteria" }, { label: "Owner", key: "owner" }, { label: "Due at", key: "dueAt" },
      { label: "Status", key: "status" }, { label: "Steps complete", key: "stepsComplete" },
      { label: "Steps required", key: "stepsRequired" }, { label: "Conclusion", key: "completionNote" }
    ], d.audits.map((audit) => {
      const checklist = (audit.checklist || []).filter((item) => item.required !== false);
      return { ...audit, status: isAuditOverdue(audit) ? "overdue" : audit.status,
        stepsComplete: checklist.filter((item) => ["done", "not_applicable"].includes(item.status)).length,
        stepsRequired: checklist.length };
    }));
  } else if (kind === "reviews") {
    csvDownload("inspectra-demo-management-reviews.csv", [
      { label: "Review ID", key: "id" }, { label: "Title", key: "title" }, { label: "Period", key: "period" },
      { label: "Scheduled at", key: "scheduledAt" }, { label: "Chair", key: "chair" }, { label: "Status", key: "status" },
      { label: "Minutes", key: "minutes" }, { label: "Linked follow-ups", key: "followUps" }, { label: "Open follow-ups", key: "openFollowUps" }
    ], d.reviews.map((review) => {
      const linked = d.actions.filter((action) => (review.decisionActionIds || []).includes(action.id));
      return { ...review, followUps: linked.length, openFollowUps: linked.filter((action) => !["resolved", "verified", "cancelled"].includes(action.status)).length };
    }));
  } else {
    const k = getKpis();
    csvDownload("inspectra-demo-kpi-snapshot.csv", [
      { label: "Metric", key: "metric" }, { label: "Value", key: "value" }, { label: "Numerator", key: "numerator" },
      { label: "Denominator", key: "denominator" }, { label: "Definition", key: "definition" },
      { label: "Data mode", key: "mode" }, { label: "Generated at", key: "generatedAt" }
    ], [
      { metric: "Inspection completion", value: formatPercent(k.completionRate), numerator: k.completedInspections, denominator: k.dueInspections, definition: "Completed due inspections / non-cancelled inspections due in current month to date", mode: "Browser-local sample", generatedAt: new Date().toISOString() },
      { metric: "On-time completion", value: formatPercent(k.onTimeRate), numerator: k.onTimeCount, denominator: k.dueInspections, definition: "On-time completed inspections / inspections due in current month to date", mode: "Browser-local sample", generatedAt: new Date().toISOString() },
      { metric: "Checklist completion", value: formatPercent(k.checklistCompletionRate), numerator: k.checklistCompleted, denominator: k.checklistRequired, definition: "Required checks complete / required checks on non-cancelled inspections", mode: "Browser-local sample", generatedAt: new Date().toISOString() },
      { metric: "Overdue inspections", value: k.overdueInspections, numerator: k.overdueInspections, denominator: "", definition: "Open inspections past due timestamp", mode: "Browser-local sample", generatedAt: new Date().toISOString() },
      { metric: "Critical open findings", value: k.criticalOpenFindings, numerator: k.criticalOpenFindings, denominator: "", definition: "Critical findings not resolved, verified, or dismissed", mode: "Browser-local sample", generatedAt: new Date().toISOString() },
      { metric: "Overdue actions", value: k.overdueActions, numerator: k.overdueActions, denominator: "", definition: "Open corrective actions past due timestamp", mode: "Browser-local sample", generatedAt: new Date().toISOString() }
    ]);
  }
  showToast("CSV generated from current browser-local sample records.");
}

app.addEventListener("click", onClick);
app.addEventListener("submit", (event) => {
  if (event.target?.id === "searchForm") {
    event.preventDefault();
    searchQuery = String(new FormData(event.target).get("q") || "").trim();
    activePage = searchQuery ? "search" : "overview";
    render();
    return;
  }
  onSubmit(event);
});
document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    document.querySelector("#globalSearch")?.focus();
    return;
  }
  if (event.key === "Escape" && modalState) { closeModal(); return; }
  if (event.key === "Escape" && activePage === "search") {
    searchQuery = "";
    activePage = "overview";
    render();
  }
});
window.addEventListener("storage", (event) => {
  if (event.key === "inspectra.operational-assurance.demo.v1") {
    showToast("The local demo changed in another tab. Refresh this tab to load the other snapshot.", true);
  }
});

render();
