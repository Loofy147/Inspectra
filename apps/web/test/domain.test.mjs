import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateKpis, closeAction, isActionOverdue, isInspectionOverdue,
  toCsv, transitionInspection, verifyFinding
} from "../src/domain.js";

import {
  createManagementFollowUp, startManagementReview, completeManagementReview,
  isAuditOverdue, transitionAudit
} from "../src/domain.js";

const at = (iso) => new Date(iso);
const fixedNow = at("2026-10-26T12:00:00.000Z");

test("an inspection is overdue only after its due timestamp and while non-terminal", () => {
  const base = { id: "INS-1", dueAt: "2026-10-26T12:00:00.000Z", status: "scheduled" };
  assert.equal(isInspectionOverdue(base, fixedNow), false);
  assert.equal(isInspectionOverdue(base, at("2026-10-26T12:00:01.000Z")), true);
  assert.equal(isInspectionOverdue({ ...base, status: "completed" }, at("2026-10-27T00:00:00.000Z")), false);
  assert.equal(isInspectionOverdue({ ...base, dueAt: "invalid" }, fixedNow), false);
});

test("an action is not overdue after resolution", () => {
  const base = { id: "ACT-1", dueAt: "2026-10-25T12:00:00.000Z", status: "open" };
  assert.equal(isActionOverdue(base, fixedNow), true);
  assert.equal(isActionOverdue({ ...base, status: "resolved" }, fixedNow), false);
});

test("completion transition is blocked until every required checklist item is complete", () => {
  const inspection = { status: "in_progress", version: 2, checklist: [
    { id: "a", required: true, status: "done" },
    { id: "b", required: true, status: "open" }
  ] };
  assert.throws(() => transitionInspection(inspection, "completed", fixedNow), /every required checklist item/i);
  const result = transitionInspection({ ...inspection, checklist: inspection.checklist.map((item) => ({ ...item, status: "done" })) }, "completed", fixedNow);
  assert.equal(result.status, "completed");
  assert.equal(result.completedAt, fixedNow.toISOString());
  assert.equal(result.version, 3);
});

test("invalid inspection transitions are rejected", () => {
  assert.throws(() => transitionInspection({ status: "completed", checklist: [] }, "in_progress", fixedNow), /transition is not allowed/i);
});

test("action closure needs a note and does not claim effectiveness", () => {
  const action = { id: "ACT-2", status: "in_progress", version: 1 };
  assert.throws(() => closeAction(action, "done", fixedNow), /resolution note/i);
  const result = closeAction(action, "Guard installed and checked", fixedNow);
  assert.equal(result.status, "resolved");
  assert.equal(result.resolutionNote, "Guard installed and checked");
  assert.equal(result.version, 2);
  assert.equal(action.status, "in_progress", "domain functions must not mutate the input");
});

test("finding verification requires linked actions resolved and an explanatory note", () => {
  const finding = { id: "FND-1", status: "action_required", version: 2 };
  assert.throws(() => verifyFinding(finding, [{ status: "open" }], "Checked now", fixedNow), /Resolve all linked/i);
  assert.throws(() => verifyFinding(finding, [{ status: "resolved" }], "ok", fixedNow), /verification note/i);
  const result = verifyFinding(finding, [{ status: "resolved" }], "Observed control restored and rechecked", fixedNow);
  assert.equal(result.status, "verified");
  assert.equal(result.verifiedAt, fixedNow.toISOString());
  assert.equal(finding.status, "action_required");
});

test("KPI rates disclose an empty denominator rather than returning zero", () => {
  const kpis = calculateKpis({ inspections: [], findings: [], actions: [] }, {
    asOf: fixedNow,
    periodStart: "2026-10-01T00:00:00.000Z",
    periodEnd: "2026-11-01T00:00:00.000Z"
  });
  assert.equal(kpis.completionRate, null);
  assert.equal(kpis.onTimeRate, null);
  assert.equal(kpis.checklistCompletionRate, null);
});

test("KPI completion and on-time rates use the due cohort denominator", () => {
  const data = {
    inspections: [
      { status: "completed", dueAt: "2026-10-24T10:00:00.000Z", completedAt: "2026-10-24T09:00:00.000Z", checklist: [] },
      { status: "completed", dueAt: "2026-10-23T10:00:00.000Z", completedAt: "2026-10-24T11:00:00.000Z", checklist: [] },
      { status: "scheduled", dueAt: "2026-10-25T10:00:00.000Z", checklist: [] },
      { status: "cancelled", dueAt: "2026-10-22T10:00:00.000Z", checklist: [] },
      { status: "scheduled", dueAt: "2026-11-04T10:00:00.000Z", checklist: [] }
    ],
    findings: [], actions: []
  };
  const kpis = calculateKpis(data, {
    asOf: fixedNow,
    periodStart: "2026-10-01T00:00:00.000Z",
    periodEnd: "2026-11-01T00:00:00.000Z"
  });
  assert.equal(kpis.dueInspections, 3);
  assert.equal(kpis.completedInspections, 2);
  assert.equal(kpis.completionRate, 2 / 3);
  assert.equal(kpis.onTimeCount, 1);
  assert.equal(kpis.onTimeRate, 1 / 3);
});

test("CSV output quotes values and neutralizes spreadsheet formula text", () => {
  const csv = toCsv([{ label: "Title", key: "title" }, { label: "Value", key: "value" }], [
    { title: 'A "quoted", title', value: "=HYPERLINK('x')" }
  ]);
  assert.match(csv, /""quoted""/);
  assert.match(csv, /"'=HYPERLINK/);
  const dangerous = toCsv([{ label: "value", key: "value" }], [
    { value: "-CMD('x')" },
    { value: "@SUM(1,2)" }
  ]);
  assert.match(dangerous, /"'-CMD/);
  assert.match(dangerous, /"'@SUM/);
});

test("a management review must be scheduled before it can start", () => {
  const review = { id: "MR-1", status: "completed", version: 2 };
  assert.throws(() => startManagementReview(review, fixedNow), /scheduled review/i);
  assert.equal(review.status, "completed");
});

test("a management review records its start, requires substantive minutes, then completes", () => {
  const scheduled = { id: "MR-2", status: "scheduled", version: 1 };
  const active = startManagementReview(scheduled, fixedNow);
  assert.equal(active.status, "in_progress");
  assert.equal(active.startedAt, fixedNow.toISOString());
  assert.throws(() => completeManagementReview(active, "No issues", fixedNow), /20 characters/i);
  const completed = completeManagementReview(active, "Reviewed risk movement, actions, owners and due dates for the current period.", fixedNow);
  assert.equal(completed.status, "completed");
  assert.equal(completed.completedAt, fixedNow.toISOString());
  assert.equal(scheduled.status, "scheduled", "domain functions must not mutate input records");
});

test("management follow-ups require an active review, owner, title, due date and stable ID", () => {
  const review = { id: "MR-3", status: "scheduled" };
  assert.throws(() => createManagementFollowUp(review, { title: "Track issue", owner: "Maya", dueAt: fixedNow.toISOString() }, "ACT-1", fixedNow), /in-progress review/i);
  const activeReview = { id: "MR-3", status: "in_progress" };
  assert.throws(() => createManagementFollowUp(activeReview, { title: "Fix", owner: "Maya", dueAt: fixedNow.toISOString() }, "ACT-1", fixedNow), /at least 4 characters/i);
  assert.throws(() => createManagementFollowUp(activeReview, { title: "Review decision", owner: "", dueAt: fixedNow.toISOString() }, "ACT-1", fixedNow), /owner is required/i);
  const action = createManagementFollowUp(activeReview, { title: "Verify corrective progress", owner: "Maya Chen", priority: "High", dueAt: fixedNow.toISOString() }, "ACT-9", fixedNow);
  assert.equal(action.sourceType, "management_review");
  assert.equal(action.reviewId, "MR-3");
  assert.equal(action.status, "open");
  assert.equal(action.priority, "High");
});


test("audit overdue state ends only on completion or cancellation", () => {
  const audit = { dueAt: "2026-10-25T12:00:00.000Z", status: "in_progress" };
  assert.equal(isAuditOverdue(audit, fixedNow), true);
  assert.equal(isAuditOverdue({ ...audit, status: "completed" }, fixedNow), false);
  assert.equal(isAuditOverdue({ ...audit, dueAt: "bad-date" }, fixedNow), false);
});

test("audit completion requires every required step and a conclusion", () => {
  const audit = { id: "AUD-1", status: "in_progress", version: 2, checklist: [
    { required: true, status: "done" }, { required: true, status: "open" }
  ] };
  assert.throws(() => transitionAudit(audit, "completed", "The review is done.", fixedNow), /every required audit step/i);
  const active = { ...audit, checklist: audit.checklist.map((step) => ({ ...step, status: "done" })) };
  assert.throws(() => transitionAudit(active, "completed", "ok", fixedNow), /audit conclusion/i);
  const completed = transitionAudit(active, "completed", "Evidence reviewed and conclusion recorded for the defined audit scope.", fixedNow);
  assert.equal(completed.status, "completed");
  assert.equal(completed.completedAt, fixedNow.toISOString());
  assert.equal(audit.status, "in_progress");
});

test("audit lifecycle only permits scheduled to in-progress and in-progress to completed", () => {
  assert.throws(() => transitionAudit({ status: "scheduled", checklist: [] }, "completed", "This is a conclusion.", fixedNow), /transition is not allowed/i);
  const scheduled = { status: "scheduled", version: 1 };
  const started = transitionAudit(scheduled, "in_progress", "", fixedNow);
  assert.equal(started.status, "in_progress");
  assert.equal(started.version, 2);
});


test("data quality KPIs expose missing owners and invalid due dates instead of hiding them", () => {
  const kpis = calculateKpis({
    inspections: [
      { status: "scheduled", owner: "A", dueAt: "2026-10-28T10:00:00.000Z" },
      { status: "cancelled", owner: "", dueAt: null },
      { status: "completed", owner: "", dueAt: "2026-10-20T10:00:00.000Z" }
    ],
    findings: [
      { status: "open", owner: "" },
      { status: "verified", owner: "" }
    ],
    actions: [
      { status: "open", owner: "", dueAt: null },
      { status: "in_progress", owner: "Maya", dueAt: "invalid" },
      { status: "resolved", owner: "", dueAt: null }
    ]
  }, { asOf: fixedNow });
  assert.equal(kpis.openActionsMissingOwner, 1);
  assert.equal(kpis.openActionsMissingDueDate, 2);
  assert.equal(kpis.openFindingsMissingOwner, 1);
  assert.equal(kpis.inspectionOwnerCoverageRate, 0.5);
});
