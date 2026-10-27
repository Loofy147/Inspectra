# Inspectra Core Architecture

**Status:** Target architecture and current-shell boundary, 2026-10-26

## Architectural goal

Build one reusable Operational Assurance core and configure domain packs on top of it. Product modules are different views and workflows over shared, traceable entities—not separate stores with inconsistent status and reporting logic.

## Current implementation boundary

The current web shell is a dependency-free browser application. Domain rules live in ES modules and are testable with Node's built-in test runner. The current store uses browser local storage and seeded illustrative records. There is no production API, database connection, authentication, cross-user synchronization, document repository, or external system integration in this shell.

The shell includes a metadata-only evidence register with provenance fields, links to current operational records, review-state validation, CSV export, and browser-local evidence-review transition events. The history improves traceability within the current workspace snapshot but is editable/deletable, uses user-entered reviewer labels, and is not a durable or tamper-proof audit log. It does not upload/store evidence files or independently authenticate references. See [Evidence Traceability Model](evidence-traceability.md) for production acceptance gates.

Do not infer production readiness from the UI working.

## Logical layers

1. **Experience layer** — executive dashboard, work queue, record lists/detail views, forms, reporting, accessibility, mobile capture.
2. **Application workflows** — inspection lifecycle, finding triage, action closure, verification, risk review, audit work, management-review decisions.
3. **Domain rules** — status transition validation, overdue semantics, required-check completion, metric formulas, record-integrity diagnostics (required fields, date formats, unique IDs, cross-record links), and evidence-state rules. Browser-side checks are defense-in-depth only; they do not replace server-side constraints.
4. **Application services (target)** — authenticated commands and queries that validate authorization, enforce transaction boundaries, record events, and return source/freshness metadata.
5. **Persistence and evidence (target)** — relational records, versioned templates, evidence metadata/content storage, event history, controlled retention and backup.
6. **Integration adapters (target)** — import/export, source-of-truth mapping, idempotent sync, retry/dead-letter handling, and freshness/health reporting.
7. **Assurance plane** — access policy, audit trail, metric registry, data-quality rules, monitoring, tests, release gates, and documented limitations.

## Core entity groups

- Organization and access: organization, membership, user identity, role, permission, invitation/session lifecycle.
- Operational structure: site, area, asset, process, external system reference.
- Work definition: plan, schedule, checklist template, template version, requirement, control.
- Work execution: inspection/audit instance, checklist response, submission/review, finding/nonconformity/observation.
- Risk treatment: risk assessment, risk-control link, action/CAPA, root cause, verification review.
- Trust and evidence: attachment metadata, evidence review, state-transition event, audit event, retention record.
- Measurement and governance: metric definition/version, metric result/snapshot, report export, management review, decision and follow-up task.
- Configurable packs: domain template, applicability mapping, jurisdiction/source reference, effective dates, approval/version status.

Stable IDs and explicit foreign-key relationships are required in the target database. Avoid a generic catch-all JSON object as the sole source of truth for operational status.

## Event and state model

Keep current state for efficient views and append a transition record for each meaningful state change. A transition should record the entity ID/type, prior and new state, actor, event time, reason where appropriate, entity version, correlation/request ID, and source (user, integration, or system rule).

The event history must support reconstruction of what was known at a chosen time. A mutable updated_at value is not enough for historical KPIs. Define correction, deletion, retention, and redaction policies explicitly; “append-only in application code” alone is not an independently tamper-proof audit guarantee.

## Boundaries and invariants

- Every tenant-owned record belongs to exactly one organization.
- Every cross-entity relation must stay within authorized tenant boundaries.
- Status, outcome, severity, risk score, evidence state, data quality, and authorization state must not be conflated.
- A checklist completion cannot automatically certify that a hazard is absent or that work is authorized.
- Completion, resolution, and effectiveness verification are separate events.
- Reopening a record must preserve earlier closure and verification events.
- Risk scoring and threshold rules are versioned organizational configuration, not hard-coded universal truth.
- A KPI is not authoritative when its required data is missing or stale; its UI must disclose that state.

## Command and query shape (target)

Commands mutate state through validated application services. Examples: startInspection, submitInspection, createFinding, assignAction, resolveAction, verifyEffectiveness, recordRiskReview, approvePermit, and recordManagementDecision.

Queries return typed records together with source, reporting period, freshness, and data-quality metadata as appropriate. Query projections must be independently reconciled to underlying records in tests.

These names describe intended service boundaries; they are not claims that API endpoints already exist.

## Multi-tenant authorization

Authenticate the user, resolve organization membership from a trusted source, and authorize each command/query using the membership and resource relationship. Do not trust client-provided organization IDs, editable profile metadata, hidden controls, or unverified role claims. Apply authorization at the trusted service/database boundary and test both allowed and denied paths for every resource family.

## Integration contracts

Each connector must have a defined external source, credential scope, field mapping, sync cursor/watermark, idempotency strategy, retry/backoff policy, error classification, source timestamp, last-success time, and ownership. Integration failures must never silently turn stale data into a healthy status.

## Suggested deployment topology

- Static or server-rendered web experience.
- Trusted API/application layer.
- Relational database with tenant isolation and integrity constraints.
- Object storage for evidence with restricted access and retention.
- Background jobs for scheduled work, sync and notifications.
- Central logs/metrics/traces with secret redaction and operational alerts.
- CI with unit, integration, authorization, accessibility and security checks.

The final technology choices remain open until repository/runtime constraints and hosting requirements have been recorded. Do not provision new paid services or apply a production migration as part of this architecture document.

## Architecture decision record (initial)

| Decision | Status | Reason / next proof |
|---|---|---|
| Sector-neutral common core | ACCEPTED | Avoid data/workflow duplication; domain packs are later configuration layers |
| Separate status and outcome | ACCEPTED | Prevent UI states from implying operational success |
| Versioned KPI definitions | ACCEPTED | Preserve reproducibility as formulas and templates evolve |
| Browser local storage for current demo | IMPLEMENTED FOR DEMO ONLY | Enables interaction without a backend; not suitable for shared or regulated records |
| Production persistence/auth | OPEN | Choose after access, tenancy, evidence, retention and hosting needs are specified |
| Immutable/tamper-evident audit guarantee | OPEN | Define threat model, controls and tests before making a guarantee |
