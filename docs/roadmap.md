# Inspectra Implementation Roadmap

**Status:** Proposed and not yet evidence of implementation  
**Prepared:** 2026-10-25

Use this checklist as a working delivery register. A checked item means the linked artifact or test exists and has been verified, not that it has merely been discussed.

## Stage 0 — Repository and system discovery

- [ ] Record app framework, package manager, runtime entry points, and supported environments.
- [ ] Identify deployment target, environments, configuration, and existing secrets handling without exposing secret values.
- [ ] Identify current persistence model, authentication, tenancy, roles, and authorization boundaries.
- [ ] Inventory current pages, routes, core records, sample/demo data, exports, and external integrations.
- [ ] Record existing tests, commands, CI jobs, and latest pass/fail evidence.
- [ ] Create a baseline architecture diagram and known-limitations list.
- [ ] Keep demo/placeholder capabilities clearly labeled until independently verified.

**Acceptance gate:** a reproducible local setup and source-of-truth system inventory exist. No feature is reported as implemented without code and verification evidence.

## Stage 1 — Domain-neutral operational assurance core

- [ ] Define stable entity IDs and relations for organizations, sites, areas, assets, users, inspection plans, checklist templates, inspection instances, findings, actions, evidence metadata, and events.
- [ ] Define inspection lifecycle and transition guards.
- [ ] Version templates and preserve the template version used by each inspection.
- [ ] Define statuses separately from checklist outcomes, severity, risk, evidence status, and authorization state.
- [ ] Add assignable owners, due timestamps, escalation rules, and reopen handling.
- [ ] Add controlled evidence requirements and review/accept/reject states.
- [ ] Add event records for high-value state changes with actor, time, reason, and entity version.
- [ ] Define permissions and organization isolation on the server side.
- [ ] Add migrations, validation, and referential-integrity tests.
- [ ] Add mobile-friendly capture and explicit offline/sync behavior if discovery confirms it is required.

**Acceptance gate:** one inspection can be scheduled, completed, linked to a finding, assigned as an action, evidenced, verified, and traced end-to-end from source record to final state.

## Stage 2 — Trustworthy KPI engine

- [ ] Create a versioned metric registry: formula, scope/cohort, numerator, denominator, exclusions, period, source, freshness, owner, and limitations.
- [ ] Implement inspection plan completion, on-time rate, overdue backlog, checklist completion, and inspection coverage.
- [ ] Implement critical open findings, corrective-action overdue rate, action aging, closure lead time, and recurrence only when required fields exist.
- [ ] Implement required-field completeness, evidence completeness, source freshness, and data-quality warnings.
- [ ] Show numerator/denominator and drill-through records for rates.
- [ ] Distinguish zero, unknown, unavailable, stale, incomplete, and not configured.
- [ ] Preserve metric definition version and query parameters with exports.
- [ ] Test cancelled/rescheduled records, missing dates, boundary timestamps, time zones, reopened records, duplicate events, and changing templates.
- [ ] Independently calculate expected KPI results from seeded test fixtures.
- [ ] Display explicit sample-data labels until real source records are connected.

**Acceptance gate:** every KPI has a written definition, known-answer automated tests, record-level drill-down, and a source/freshness state.

## Stage 3 — Management control loop

- [ ] Add risk and controls register with approved/versioned assessment method.
- [ ] Add audit plans, scope/criteria, evidence requests, findings, and auditor/reviewer roles.
- [ ] Add corrective/preventive action with root-cause field, interim control, due date, closure evidence, and effectiveness review.
- [ ] Add management-review records: date, participants/roles, inputs, decisions, owners, target dates, and follow-up status.
- [ ] Add configurable thresholds and escalation paths with version/approval history.
- [ ] Prevent self-verification where organizational policy requires independent review.
- [ ] Add site assurance profiles with transparent contributing measures rather than an opaque composite score.

**Acceptance gate:** a manager can trace a critical exception to source records, assign a response, review evidence, verify effectiveness, and see the change reflected in tested metrics.

## Stage 4 — Select one vertical pack through discovery

Run interviews and workflow walkthroughs before committing to a segment. Investigate these hypotheses in priority order:

- [ ] Multi-site facilities and property operations.
- [ ] Construction and contractor-heavy projects.
- [ ] Manufacturing and warehousing.

For the selected segment:

- [ ] Name the buyer, daily user, affected workers, and approval roles.
- [ ] Document the real current workflow and failure points.
- [ ] Obtain permission to use anonymized sample forms/reports.
- [ ] Identify jurisdiction-specific obligations and have a qualified practitioner validate applicability.
- [ ] Select one high-frequency workflow and build it end-to-end.
- [ ] Test with target users in a realistic environment.
- [ ] Record task completion, time-to-complete, error rate, missed required fields, and user feedback.
- [ ] Reject or revise the segment hypothesis when evidence contradicts it.

**Acceptance gate:** documented user validation plus measurable evidence of task usefulness; a market hypothesis alone does not pass.

## Stage 5 — Reusable domain packs

Proceed only after the core pattern has proven reusable.

- [ ] Asset maintenance and calibration.
- [ ] Contractor, supplier, credential, and induction assurance.
- [ ] Competence, training, and role-based authorization.
- [ ] Permit-to-work and operational readiness.
- [ ] Document and standard control.
- [ ] Incident, near-miss, and learning workflows.
- [ ] Environmental controls.
- [ ] Quality/process assurance and nonconformity workflows.
- [ ] Change management and emergency preparedness.

For every pack, define the domain-specific fields, controls, validations, permissions, reports, KPI denominators, required evidence, localization needs, and applicable references. Do not assume a template alone makes the product compliant with a standard or law.

## Stage 6 — Production readiness

- [ ] Authentication, recovery, session security, role/permission checks, and organization isolation are tested.
- [ ] Sensitive operations are authorized by the server; client-only checks are not relied on.
- [ ] Evidence storage includes access controls, validation, retention, and auditable access where needed.
- [ ] Audit events resist silent alteration and have tested retention, access, and export controls.
- [ ] Backups and restore are successfully tested.
- [ ] Integration retries are idempotent and failed/stale sources are visible.
- [ ] Errors, timeouts, rate limits, and partial failures have safe user-visible states.
- [ ] Accessibility and mobile use are checked on real target devices.
- [ ] Performance and capacity targets are stated and measured.
- [ ] Security review and dependency checks are recorded.
- [ ] Privacy, retention, data export, deletion, and incident procedures are documented.
- [ ] Monitoring and operational ownership are assigned.
- [ ] Recovery and rollback procedures are tested.
- [ ] Automated test and CI evidence is linked to the release candidate.
- [ ] Known limitations and residual risks are approved before release.

**Acceptance gate:** release readiness is supported by reproducible test and operational evidence; documentation or a dashboard status label by itself is insufficient.

## Cross-cutting definition of done

- [ ] The user problem and accountable role are documented.
- [ ] The full state model and invalid transitions are tested.
- [ ] Data model, validation, permissions, and audit events are reviewed.
- [ ] KPI formulas and denominator behavior are documented.
- [ ] Empty, stale, invalid, partial, and error states are handled.
- [ ] Evidence and exported reports trace back to source records.
- [ ] Automated tests cover happy path, boundaries, permissions, and failure handling.
- [ ] Mobile and keyboard flows are usable.
- [ ] Documentation matches actual behavior.
- [ ] Verification result is recorded as pass, fail, blocked, or not run.

## Lightweight decision register

Use this table to retain the reasoning behind material choices:

| Decision | Current status | Evidence required to close |
|---|---|---|
| First target customer segment | OPEN | Practitioner interviews, workflow sample, buyer/user distinction, end-to-end trial |
| First KPI release set | PROPOSED | Metric contracts plus independently reproducible test results |
| Risk scoring methodology | OPEN | Organization-approved method and versioning plan |
| Backend/database/authentication | UNKNOWN | Repository/runtime inspection and architecture decision |
| Evidence storage and audit guarantees | UNKNOWN | Storage/access design plus tamper/retention tests |
| Offline capture | OPEN | Target-user research and connectivity assumptions |
| Legal/regulatory applicability | OPEN | Jurisdiction and competent local review |
| Production readiness | NOT ESTABLISHED | Completion of Stage 6 with reproducible release evidence |
