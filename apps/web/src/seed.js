export const CHECKLIST_LABELS = [
  "Site access and work area checked",
  "Equipment and protective controls verified",
  "Emergency arrangements reviewed",
  "Required records and training checked",
  "Findings and observations recorded"
];

export function dateAt(dayOffset = 0, hour = 12) {
  const value = new Date();
  value.setDate(value.getDate() + dayOffset);
  value.setHours(hour, 0, 0, 0);
  return value.toISOString();
}

export function dateInputAt(dayOffset = 1) {
  const value = new Date();
  value.setDate(value.getDate() + dayOffset);
  return [value.getFullYear(), String(value.getMonth() + 1).padStart(2, "0"), String(value.getDate()).padStart(2, "0")].join("-");
}

export function makeChecklist(doneCount = 0) {
  return CHECKLIST_LABELS.map((label, index) => ({
    id: "check-" + (index + 1),
    label,
    required: true,
    status: index < doneCount ? "done" : "open",
    note: ""
  }));
}

export function createDemoState() {
  const sites = [
    { id: "SITE-001", name: "North Distribution Centre", location: "North district", manager: "Maya Chen", status: "operational", region: "Region A" },
    { id: "SITE-002", name: "Riverside Workshop", location: "Industrial zone", manager: "Amir Haddad", status: "operational", region: "Region A" },
    { id: "SITE-003", name: "West Campus", location: "West district", manager: "Lina Moreau", status: "operational", region: "Region B" },
    { id: "SITE-004", name: "Central Office", location: "City centre", manager: "Samir Ali", status: "operational", region: "Region B" }
  ];
  const assets = [
    { id: "AST-001", name: "Forklift FL-04", siteId: "SITE-001", type: "Material handling", criticality: "High", nextCheckAt: dateAt(2, 15), status: "in_service" },
    { id: "AST-002", name: "Emergency lighting block B", siteId: "SITE-003", type: "Emergency system", criticality: "High", nextCheckAt: dateAt(1, 15), status: "in_service" },
    { id: "AST-003", name: "Workshop press P-02", siteId: "SITE-002", type: "Production equipment", criticality: "High", nextCheckAt: dateAt(-1, 15), status: "review_required" },
    { id: "AST-004", name: "Racking aisle C", siteId: "SITE-001", type: "Storage infrastructure", criticality: "Medium", nextCheckAt: dateAt(5, 15), status: "in_service" },
    { id: "AST-005", name: "PPE station west", siteId: "SITE-003", type: "Safety equipment", criticality: "Medium", nextCheckAt: dateAt(8, 15), status: "in_service" },
    { id: "AST-006", name: "Electrical distribution panel 2", siteId: "SITE-004", type: "Electrical", criticality: "High", nextCheckAt: dateAt(3, 15), status: "in_service" }
  ];
  const inspections = [
    { id: "INS-0104", title: "Fire exit routes and door checks", siteId: "SITE-003", assetId: null, owner: "Lina Moreau", priority: "High", dueAt: dateAt(-2, 15), createdAt: dateAt(-12, 9), status: "scheduled", checklist: makeChecklist(0), version: 1 },
    { id: "INS-0103", title: "Monthly equipment safety review", siteId: "SITE-002", assetId: "AST-003", owner: "Amir Haddad", priority: "High", dueAt: dateAt(-1, 15), createdAt: dateAt(-10, 9), status: "in_progress", startedAt: dateAt(-1, 10), checklist: makeChecklist(3), version: 2 },
    { id: "INS-0102", title: "Emergency lighting inspection", siteId: "SITE-003", assetId: "AST-002", owner: "Lina Moreau", priority: "Medium", dueAt: dateAt(1, 15), createdAt: dateAt(-7, 9), status: "scheduled", checklist: makeChecklist(0), version: 1 },
    { id: "INS-0101", title: "Forklift pre-operation audit", siteId: "SITE-001", assetId: "AST-001", owner: "Maya Chen", priority: "High", dueAt: dateAt(-3, 15), completedAt: dateAt(-3, 13), createdAt: dateAt(-8, 9), status: "completed", checklist: makeChecklist(5), version: 2 },
    { id: "INS-0100", title: "Storage racking condition check", siteId: "SITE-001", assetId: "AST-004", owner: "Maya Chen", priority: "Medium", dueAt: dateAt(3, 15), createdAt: dateAt(-5, 9), status: "scheduled", checklist: makeChecklist(0), version: 1 },
    { id: "INS-0099", title: "Workshop guarding inspection", siteId: "SITE-002", assetId: "AST-003", owner: "Amir Haddad", priority: "High", dueAt: dateAt(-8, 11), completedAt: dateAt(-6, 13), createdAt: dateAt(-15, 9), status: "completed", checklist: makeChecklist(5), version: 2 },
    { id: "INS-0098", title: "PPE station and signage review", siteId: "SITE-003", assetId: "AST-005", owner: "Lina Moreau", priority: "Low", dueAt: dateAt(5, 15), createdAt: dateAt(-2, 9), status: "scheduled", checklist: makeChecklist(0), version: 1 },
    { id: "INS-0097", title: "General site assurance walk", siteId: "SITE-004", assetId: null, owner: "Samir Ali", priority: "Medium", dueAt: dateAt(-1, 17), createdAt: dateAt(-6, 9), status: "in_progress", startedAt: dateAt(-1, 11), checklist: makeChecklist(1), version: 2 }
  ];
  const findings = [
    { id: "FND-0201", title: "Emergency exit route partially obstructed", siteId: "SITE-003", assetId: null, severity: "critical", status: "open", owner: "Lina Moreau", openedAt: dateAt(-5, 10), dueAt: dateAt(-1, 17), actionIds: ["ACT-0301"], description: "Illustrative finding. Confirm condition and applicable response through the organization's approved process.", version: 1 },
    { id: "FND-0202", title: "Machine-guard verification evidence missing", siteId: "SITE-002", assetId: "AST-003", severity: "high", status: "action_required", owner: "Amir Haddad", openedAt: dateAt(-4, 10), dueAt: dateAt(2, 17), actionIds: ["ACT-0302"], description: "Illustrative finding. Missing evidence is not proof that a control is absent, but it needs follow-up.", version: 1 },
    { id: "FND-0203", title: "PPE station signage damaged", siteId: "SITE-003", assetId: "AST-005", severity: "medium", status: "verified", owner: "Lina Moreau", openedAt: dateAt(-12, 10), dueAt: dateAt(-7, 17), verifiedAt: dateAt(-4, 14), verificationNote: "Illustrative verification: replacement signage checked at the location.", actionIds: ["ACT-0303"], description: "Illustrative finding with a recorded demo verification.", version: 3 },
    { id: "FND-0204", title: "Racking beam deformation reported", siteId: "SITE-001", assetId: "AST-004", severity: "high", status: "open", owner: "Maya Chen", openedAt: dateAt(-2, 10), dueAt: dateAt(1, 17), actionIds: ["ACT-0304"], description: "Illustrative finding. A competent site process must determine operational restrictions and response.", version: 1 }
  ];
  const actions = [
    { id: "ACT-0301", title: "Secure and inspect the exit route", findingId: "FND-0201", owner: "Lina Moreau", priority: "Critical", openedAt: dateAt(-5, 10), dueAt: dateAt(-1, 17), status: "open", version: 1 },
    { id: "ACT-0302", title: "Verify guarding control and attach evidence", findingId: "FND-0202", owner: "Amir Haddad", priority: "High", openedAt: dateAt(-4, 10), dueAt: dateAt(2, 17), status: "in_progress", version: 2 },
    { id: "ACT-0303", title: "Replace and verify PPE signage", findingId: "FND-0203", owner: "Lina Moreau", priority: "Medium", openedAt: dateAt(-12, 10), dueAt: dateAt(-7, 17), resolvedAt: dateAt(-5, 12), resolutionNote: "Illustrative demo note: replacement installed and checked.", status: "resolved", version: 3 },
    { id: "ACT-0304", title: "Inspect racking beam and record disposition", findingId: "FND-0204", owner: "Maya Chen", priority: "High", openedAt: dateAt(-2, 10), dueAt: dateAt(1, 17), status: "open", version: 1 },
    { id: "ACT-0305", title: "Carry forward the open risk-review decision", findingId: null, reviewId: "MR-001", sourceType: "management_review", owner: "Maya Chen", priority: "Medium", openedAt: dateAt(-12, 12), dueAt: dateAt(-2, 17), resolvedAt: dateAt(-3, 14), resolutionNote: "Illustrative demo note: decision follow-up was recorded as complete.", status: "resolved", version: 2 },
    { id: "ACT-0306", title: "Confirm site owners for overdue inspection recovery", findingId: null, reviewId: "MR-002", sourceType: "management_review", owner: "Lina Moreau", priority: "High", openedAt: dateAt(-1, 12), dueAt: dateAt(2, 17), status: "open", version: 1 }
  ];
  const risks = [
    { id: "RSK-001", title: "Emergency-route obstruction", siteId: "SITE-003", category: "Emergency readiness", likelihood: 3, consequence: 5, owner: "Lina Moreau", status: "review_required", lastReviewedAt: dateAt(-45, 10), control: "Route inspection and obstruction-clearance procedure" },
    { id: "RSK-002", title: "Machinery guarding assurance", siteId: "SITE-002", category: "Equipment", likelihood: 3, consequence: 4, owner: "Amir Haddad", status: "open", lastReviewedAt: dateAt(-20, 10), control: "Pre-use checks and documented guard verification" },
    { id: "RSK-003", title: "Manual handling strain", siteId: "SITE-001", category: "Ergonomics", likelihood: 2, consequence: 3, owner: "Maya Chen", status: "open", lastReviewedAt: dateAt(-12, 10), control: "Handling assessment and team briefing" },
    { id: "RSK-004", title: "Battery charging control", siteId: "SITE-004", category: "Electrical / energy", likelihood: 3, consequence: 4, owner: "Samir Ali", status: "review_required", lastReviewedAt: dateAt(-60, 10), control: "Controlled charging area and maintenance checks" }
  ];
  const audits = [
    { id: "AUD-001", title: "Quarterly site assurance review", scope: "Sites and work areas", owner: "Maya Chen", dueAt: dateAt(4, 15), status: "scheduled", progress: "Not started" },
    { id: "AUD-002", title: "Controlled-document review", scope: "Procedures and templates", owner: "Samir Ali", dueAt: dateAt(-2, 15), status: "in_progress", progress: "Evidence review" },
    { id: "AUD-003", title: "Contractor onboarding sample", scope: "People and suppliers", owner: "Amir Haddad", dueAt: dateAt(9, 15), status: "scheduled", progress: "Not started" }
  ];
  const reviews = [
    {
      id: "MR-001", title: "Monthly operational assurance review", period: "2026-10",
      scheduledAt: dateAt(-12, 10), startedAt: dateAt(-12, 10), completedAt: dateAt(-11, 11),
      chair: "Maya Chen", status: "completed", decisionActionIds: ["ACT-0305"],
      minutes: "Illustrative demo minutes: reviewed overdue work, assigned a recovery owner, and scheduled a follow-up check. This record is sample content.",
      version: 2
    },
    {
      id: "MR-002", title: "Current site assurance exception review", period: "2026-10",
      scheduledAt: dateAt(-1, 10), startedAt: dateAt(-1, 10),
      chair: "Lina Moreau", status: "in_progress", decisionActionIds: ["ACT-0306"],
      minutes: "", version: 2
    },
    {
      id: "MR-003", title: "Monthly control effectiveness review", period: "2026-11",
      scheduledAt: dateAt(6, 10), chair: "Samir Ali", status: "scheduled",
      decisionActionIds: [], minutes: "", version: 1
    }
  ];
  const requirements = [
    { id: "REQ-001", title: "Inspection templates have an owner and revision", owner: "Samir Ali", status: "in_review", evidence: "Template register demo record" },
    { id: "REQ-002", title: "Corrective actions have an accountable owner", owner: "Maya Chen", status: "attention_required", evidence: "Action register demo records" },
    { id: "REQ-003", title: "Risk assessments have a review date", owner: "Amir Haddad", status: "in_review", evidence: "Risk register demo records" }
  ];
  const people = [
    { id: "USR-001", name: "Maya Chen", role: "Site manager", siteId: "SITE-001", status: "active" },
    { id: "USR-002", name: "Amir Haddad", role: "Inspection lead", siteId: "SITE-002", status: "active" },
    { id: "USR-003", name: "Lina Moreau", role: "Operations supervisor", siteId: "SITE-003", status: "active" },
    { id: "USR-004", name: "Samir Ali", role: "Compliance coordinator", siteId: "SITE-004", status: "active" }
  ];
  const contractors = [
    { id: "CON-001", name: "Northside Maintenance (sample)", service: "Facilities maintenance", siteId: "SITE-001", credentialDueAt: dateAt(18, 17), status: "current" },
    { id: "CON-002", name: "Riverside Technical Services (sample)", service: "Equipment service", siteId: "SITE-002", credentialDueAt: dateAt(-4, 17), status: "review_required" },
    { id: "CON-003", name: "Westline Electrical (sample)", service: "Electrical service", siteId: "SITE-003", credentialDueAt: dateAt(7, 17), status: "current" }
  ];
  const activity = [
    { id: "EVT-001", at: dateAt(0, 9), actor: "Demo operator", action: "recorded", entityType: "inspection", entityId: "INS-0103", summary: "Checklist progress saved for Monthly equipment safety review" },
    { id: "EVT-002", at: dateAt(-1, 14), actor: "Demo operator", action: "created", entityType: "finding", entityId: "FND-0204", summary: "Racking beam deformation reported" },
    { id: "EVT-003", at: dateAt(-2, 11), actor: "Demo operator", action: "resolved", entityType: "action", entityId: "ACT-0303", summary: "PPE signage action resolved (sample event)" },
    { id: "EVT-004", at: dateAt(-3, 10), actor: "Demo operator", action: "completed", entityType: "inspection", entityId: "INS-0101", summary: "Forklift pre-operation audit completed" }
  ];
  return { sites, assets, inspections, findings, actions, risks, audits, requirements, people, contractors, reviews, activity };
}
