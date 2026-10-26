# Inspectra Implementation Roadmap

**Status:** Active build sequence for the professional sector-neutral core  
**Prepared:** 2026-10-26

The core must be built to a professional standard before market/sector selection becomes a development gate. Sector discovery can inform usability and configuration, but the shared platform foundation must not depend on one sector being chosen first.

A checklist item is complete only when a linked artifact or test exists and has been verified.

## Stage 0 — Baseline and explicit boundaries

- [x] Establish repository purpose, initial KPI catalogue, and management expansion plan.
- [x] Establish sector-neutral product and assurance principles.
- [x] Establish a roadmap and a testable domain-rule foundation.
- [ ] Record final architecture and deployment decisions after the first end-to-end implementation.
- [ ] Inventory actual CI, hosting, identity, persistence, storage, and integration status from system evidence.

**Acceptance gate:** repository state and unsupported capabilities are documented; the demo/live boundary is explicit.

## Stage 1 — Shared operational model and working interface

- [ ] Stable IDs and explicit relations for organizations, sites, areas, assets, inspections, versioned checklists, findings, actions, risks, controls, evidence metadata, and events.
- [ ] Explicit status, outcome, severity, risk, evidence, data-quality, and authorization concepts.
- [ ] Validated lifecycle transitions and guardrails.
- [ ] One complete trace: plan → inspection → finding → action → evidence → effectiveness verification.
- [ ] Responsive, keyboard-usable work queue and record-detail flows.
- [ ] Clear demo, local-only, empty, stale, incomplete, and error states.

**Acceptance gate:** the core flow works against a defined data contract and domain tests. No live-data claim is allowed.

## Stage 2 — Persistence, identity and access controls

- [ ] Select and document the production persistence/authentication architecture.
- [ ] Organization/tenant isolation and server-enforced authorization model.
- [ ] Database constraints and validation for required fields and relations.
- [ ] Versioned templates and record-level state history.
- [ ] Evidence storage policy, permissions, metadata, integrity, and retention.
- [ ] Explicit data ownership, deletion, export, backup, restore, and privacy policy.
- [ ] Integration contract including retries, idempotency, and source freshness.

**Acceptance gate:** persistence survives sessions and devices; access isolation and role boundaries pass automated tests. Until then, demo storage remains local.

## Stage 3 — Professional measurement engine

- [ ] Versioned metric definitions with purpose, formula, cohort, numerator, denominator, filters, period, source, freshness, owner, and caveats.
- [ ] Inspection completion, on-time rate, overdue backlog, checklist completion, and coverage.
- [ ] Critical open findings, action aging, overdue actions, closure time, and effectiveness/recurrence where the required history exists.
- [ ] Source-data quality, evidence completeness, freshness, and audit-event coverage.
- [ ] Record-level drill-down, reproducible exports, and known-answer tests.
- [ ] Distinct visual states for zero, unknown, unavailable, stale, incomplete, and not configured.

**Acceptance gate:** each KPI has a formula, seeded boundary tests, independently reproducible expected values, and source/period metadata.

## Stage 4 — Management operating system

- [ ] Risk and controls register with an approved, versioned method.
- [ ] Audit planning, scope/criteria, evidence requests, findings, and response workflow.
- [ ] CAPA with root cause, owner, due date, interim controls, closure evidence, and independent effectiveness review where required.
- [ ] Management review records with decisions, owners, dates, and follow-up actions.
- [ ] Controlled documents and template versions.
- [ ] Work queue with escalation policy and a clear distinction between recommendation and authorization.
- [ ] Sites/assets, people/contractors, and operational-readiness primitives.
- [ ] Reporting and exports that reconcile to underlying records.

**Acceptance gate:** managers can inspect exceptions, assign accountable work, review evidence, record decisions, and verify their effects against traceable records.

## Stage 5 — Production assurance and operational resilience

- [ ] Server-enforced permissions, organization-boundary tests, and secure session handling.
- [ ] Security review mapped to OWASP ASVS; dependency and configuration checks.
- [ ] Auditable state changes with actor, time, reason, entity version, and retention controls.
- [ ] Tested backup and restore, migration rollback, and recovery procedures.
- [ ] Failure states for upload, integration, timeout, duplicate/replayed events, and partial availability.
- [ ] Accessibility, mobile use, performance, observability, and incident procedures.
- [ ] CI checks and release gates with retained results.
- [ ] Residual risks and operational owners recorded.

**Acceptance gate:** release readiness is supported by reproducible security, reliability, access-control, recovery, and usability evidence.

## Stage 6 — Sector packs, standards and localization

This stage follows the reusable core; sector validation is not the prerequisite for building the core.

- [ ] Use stakeholder research to prioritize sector-specific templates and integration needs.
- [ ] Add approved domain packs without duplicating core entities or workflows.
- [ ] Document jurisdiction, applicability, source edition, effective date, and approval for each rule set.
- [ ] Keep thresholds, legal obligations, risk scales, and forms versioned and configurable.
- [ ] Validate domain packs with competent practitioners and real workflow evidence.
- [ ] Never claim legal conformity or management-system certification merely because a template exists.

Candidate packs: facilities/property, construction/contractors, manufacturing/warehousing, food operations, retail/hospitality, fleet/logistics, and specialist environments.

## Cross-cutting definition of done

- [ ] The user problem and accountable role are named.
- [ ] Workflow, state transitions, and invalid transitions are specified.
- [ ] Required fields, constraints, relations, and evidence requirements are defined.
- [ ] Authorization and tenant boundaries are enforced by trusted backend controls.
- [ ] Sensitive state changes are traceable.
- [ ] KPI formulas and denominator behavior are explicit.
- [ ] Empty, stale, invalid, partial, and error states are accurate.
- [ ] Automated tests cover normal, boundary, permission, and failure cases.
- [ ] Reports reconcile to source records.
- [ ] Accessibility and mobile paths are reviewed.
- [ ] Documentation matches actual behavior.
- [ ] Verification status is recorded as pass, fail, blocked, or not run.

## Open decisions

| Decision | Status | Evidence required |
|---|---|---|
| Production database and identity provider | OPEN | Architecture decision plus authorization and isolation test plan |
| Evidence repository and retention | OPEN | Data classification, access model, retention and restore test |
| Risk scoring method | OPEN | Approved model owner, versioning, validation examples |
| Audit immutability level | OPEN | Threat model and tamper-detection/retention requirements |
| First sector pack | DEFERRED | Core workflow evidence plus user discovery |
| Production readiness | NOT ESTABLISHED | Stage 5 acceptance evidence |
