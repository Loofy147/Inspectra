# Management Measurement and Product Expansion Plan

**Status:** Proposed product specification  
**Prepared:** 2026-10-25  
**Repository:** [Loofy147/Inspectra](https://github.com/Loofy147/Inspectra)  
**Evidence status:** Research-informed design proposal. This document does not assert that an application, backend, integrations, tests, or production controls already exist.

## 1. Executive recommendation

Do not grow Inspectra into a collection of unrelated dashboards. Build a reusable **Operational Assurance** core: planned checks and audits create findings; findings create risk-linked corrective actions; owners attach evidence; managers verify effectiveness; the platform records state changes and exposes decision-ready measures.

The same core can support:

- Occupational health and safety (OH&S)
- Quality assurance and process control
- Compliance obligations and internal audit
- Facility and property operations
- Asset and equipment inspection / maintenance assurance
- Contractor and supplier assurance
- Environmental operational controls
- Training, competence, and authorization
- Permit-to-work and change control
- Incident, near-miss, and learning workflows

The recommended commercial path is to begin with organizations managing multiple sites, recurring inspections, equipment, and corrective actions, then add domain-specific template packs. Facilities/property operations, construction and contractor-heavy sites, and manufacturing/warehousing are strong early candidates because they reuse the same core entities. Validate these segments with user interviews and workflow trials before committing to vertical-specific development.

## 2. Research findings and design implications

The review of official guidance supports five product decisions:

1. **Use a balanced indicator set.** ISO 45004:2024 describes performance evaluation as monitoring, measuring, analysing, and evaluating indicators and other information. It recommends a balanced approach with emphasis on proactive indicators; over-reliance on past incident rates can undermine improvement. OSHA likewise distinguishes leading indicators of prevention activity from lagging indicators of past outcomes. Inspectra should display both.
2. **Connect inspection findings to follow-through.** OSHA's hazard-identification guidance calls for recurring inspections, incident and near-miss investigation, grouping similar events to identify trends, and prioritizing action using severity and likelihood. Findings should link to location, asset, hazard category, risk assessment, corrective action, and verification evidence.
3. **Make participation and contractor interfaces first-class.** OSHA guidance calls for worker participation and coordination with contractors, subcontractors, and temporary workers. Provide easy reporting and action feedback without incentives that suppress hazard or near-miss reporting.
4. **Model management systems, not just checklists.** ISO 19011:2026 provides guidance for management-system auditing; ISO 37301 addresses compliance management; ISO 31000 provides a risk-management framework; ISO 55001:2024 addresses asset-management systems. The product should support objectives, requirements, owners, evidence, reviews, risk treatment, and improvement loops.
5. **Treat domains as configurable packs.** Management-system frameworks address different subject areas but share common management patterns. Reuse workflows and permissions; keep legal requirements, thresholds, scoring scales, and templates configurable by jurisdiction and organization.

References are listed in Section 11. This is product research, not a certification or legal-compliance assessment.

## 3. Measurement contract: every metric must be explainable

Before showing a KPI, store or expose:

- **Name and purpose:** what decision the metric supports.
- **Formula:** numerator, denominator, filters, exclusions, and aggregation.
- **Population / cohort:** which records qualify and what date determines inclusion.
- **Period and as-of time:** reporting window and when the snapshot was computed.
- **Source and freshness:** source system, last successful synchronization where applicable, and whether records are sample, local, or live.
- **Required fields:** data dependencies and the count of records excluded for missing fields.
- **Owner and response:** who is responsible when the metric breaches its threshold and what action follows.
- **Version and provenance:** formula version, template or risk-scale version, and any manual adjustment.
- **Limitations:** coverage gaps, small sample size, unverified evidence, or inconsistent source definitions.

Never show a missing value as zero. Display separate states such as **0**, **unknown**, **not configured**, **stale**, **incomplete**, and **unavailable**. Display numerator and denominator alongside rates where possible. Mark a KPI provisional when required fields or event history are missing.

## 4. KPI catalogue

### 4.1 Core inspection delivery

| KPI | Definition | Minimum required data | Caveat / implementation rule |
|---|---|---|---|
| Inspection plan completion | Inspections due in the selected period that were completed by period end / inspections scheduled to be due in the period | Scheduled/due date, status, completed timestamp, cancellation status | Define cancelled and rescheduled treatment. Separate ad-hoc inspections from the denominator. |
| On-time inspection rate | Inspections completed at or before the due timestamp / all inspections due in the period | Due timestamp and completed timestamp | Uncompleted inspections stay in the denominator. A completed-late inspection is not on time. |
| Overdue inspection backlog | Inspections due before the as-of time that are not completed or validly cancelled | Due timestamp, status, as-of timestamp | Show aging and priority; a due-today item is not overdue until its deadline has passed. |
| Checklist completion | Required checklist items checked / required checklist items for the selected population | Versioned checklist items and responses | Report in-progress and submitted records separately. A checked item is not automatically proof that the condition passed. |
| Inspection coverage | Eligible sites/assets/processes inspected during the period / eligible items planned for inspection | Scope register, eligibility, planned cadence, completed inspection links | Meaningful only if the eligible population and cadence are maintained. |

### 4.2 Findings and corrective actions

| KPI | Definition | Minimum required data | Caveat / implementation rule |
|---|---|---|---|
| Critical open findings | Count of unresolved findings classified as critical under the organization's configured scheme | Finding status, severity, classification version | Link to the records and owners. Severity definitions need an authorized owner. |
| Corrective-action overdue rate | Open actions past due / open actions with valid due timestamps | Action status, due timestamp | Display actions missing due dates separately; do not silently hide them. |
| Action closure lead time | Median elapsed time from action opened to resolution for the selected cohort | Opened and resolved timestamps, stable IDs | Show median and distribution; separate calendar time from business hours and define cohort by open or resolution date. |
| First-pass effectiveness | Actions verified effective at first verification / actions receiving first verification | Verification result and timestamps | Define effective; keep “closed” distinct from “verified effective.” |
| Recurrence rate | Findings matching a defined recurrence key after prior closure / findings eligible for recurrence analysis | Canonical hazard/category, site or asset, dates, prior finding/action links | Publish the matching window and criteria. Expose records missing category/site/asset information. |
| Action aging | Open actions grouped by configurable age bands from opened date | Opened timestamp and status | Age bands are reporting conventions, not universal safety thresholds. |
| Finding-to-action coverage | Findings requiring corrective action with a linked action / all findings requiring action | Finding disposition and action links | Some findings may need other dispositions; define the rule in the template. |

### 4.3 Risk and site assurance

| KPI | Definition | Minimum required data | Caveat / implementation rule |
|---|---|---|---|
| High-risk unresolved exposure | Count of unresolved risks above the organization's approved threshold | Risk assessment, status, threshold version, review date | Do not invent weights in code. Configure and approve a risk method first. |
| Risk-treatment progress | Risk treatments completed by target date / treatments due in the period | Risk register, treatment tasks, target and completion timestamps | A completed task does not prove that residual risk is acceptable. |
| Site assurance profile | Site-level view of overdue inspections, critical findings, overdue actions, repeat findings, and data completeness | Site IDs and related datasets | Prefer a transparent multi-measure profile over one opaque site score. |
| Risk review freshness | Open risks reviewed within the required interval / open risks requiring review | Last-reviewed timestamp and configured review cadence | A stale review does not prove that risk increased by a specific amount. |

### 4.4 Data reliability and auditability

| KPI / state | Definition | Minimum required data | Caveat / implementation rule |
|---|---|---|---|
| Required-field completeness | Records with all required fields valid / records in the applicable population | Versioned schemas and validation results | Report by entity type; missing fields are not zero-valued data. |
| Evidence completeness | Records with all required evidence present and passing configured validation / records requiring evidence | Evidence requirements, file metadata, links, validation/approval state | File presence differs from evidence authenticity or technical correctness. |
| Data freshness | Current time minus last successful update from a named source | Source ID, update success/failure time and status | If no source is connected, show “not connected,” not a freshness duration. |
| Sync failure rate | Failed synchronization attempts / all attempted synchronizations in the period | Integration attempts and outcomes | Only relevant after integrations exist; distinguish transient from unresolved failures. |
| Audit-event coverage | State-changing operations with required audit events / observed state-changing operations | Business events and audit-event records | Ordinary application logs are not automatically an immutable audit trail. Test for missing, duplicate, and out-of-order events. |
| Formula reproducibility | Sampled KPI values independently recomputable from retained source records / KPI values sampled | Source snapshots/events and formula versions | A KPI screenshot or cached total is not proof of reproducibility. |

### 4.5 Additional domain indicators (only when the domain is implemented)

- **Asset maintenance assurance:** preventive-maintenance jobs completed on time; assets past inspection/calibration due date; repeat failures; downtime. Requires an asset register, schedules, work orders, timestamps, and optionally operating hours.
- **Contractor assurance:** contractor credentials/inductions current; required pre-start documents complete; contractor actions overdue; contractor inspection coverage.
- **Competence:** required competencies current for assigned roles; training/authorization expiries; roles with no qualified backup. Attendance alone is not proof of competence.
- **Permit-to-work:** permits with required approvals before work start; permits closed after work; isolation/handback checks complete. Must respect approved authorization rules; the product must not auto-authorize hazardous work.
- **Environmental controls:** monitoring readings captured on time; threshold excursions; overdue corrective actions; waste/spill events. Units, sampling frequency, limits, and legal obligations must be explicit.
- **Quality assurance:** first-pass yield, nonconformity rate, rework, complaint closure time, supplier nonconformities. Valid production/service-volume denominators are needed.
- **Incident learning:** incident/near-miss investigation timeliness, action effectiveness, recurring causal factors. Reporting volume is not a stand-alone performance penalty; more reporting may mean better detection and trust.

### 4.6 Threshold and trend safeguards

- Thresholds must be configurable, versioned, and approved by a designated organization owner.
- High-severity hazards and immediate-danger conditions follow the organization's emergency/escalation process; dashboard indicators are not a substitute for immediate action.
- Compare periods only when population, formula version, and source coverage are sufficiently comparable.
- Show small sample sizes and data gaps; avoid implying statistical certainty from a handful of observations.
- Do not create employee leaderboards or rewards that discourage reporting, transfer blame for system failures, or reward closing findings without verifying effectiveness.
- Separate **state** (what is recorded now), **trend** (how a comparable population changes), and **outcome** (whether control performance actually changed).

## 5. Recommended management workspaces inside Inspectra

These are proposed modules, not assumed existing screens.

### Priority A — Cross-domain management foundation

1. **Management Overview & Reviews**
   - Objectives, targets, owners, period trends, exceptions, review minutes, decisions, assigned follow-up actions.
   - Trace every headline number to source records and formula.
   - KPIs: objective status, review actions overdue, target attainment with coverage notes.

2. **Risk & Controls Register**
   - Risks linked to sites, assets, processes, requirements, controls, owners, assessments, treatment plans, review dates.
   - Separate inherent risk, control status, and residual risk only when a documented method supports them.
   - KPIs: high-risk open items, review freshness, treatment actions overdue.

3. **Audit & Compliance**
   - Audit universe and calendar, audit plans, scope/criteria, auditor assignment, evidence requests, nonconformities, responses, actions, closure review.
   - Map obligations to applicable sites/processes and retain applicability decisions.
   - KPIs: audit completion/on-time rate, nonconformity aging, repeat findings, overdue requirement verification.

4. **Corrective & Preventive Action (CAPA)**
   - Root-cause method, owner, target date, interim control, implementation proof, effectiveness reviewer, verification date, recurrence linkage.
   - Where policy requires independence, do not allow an action owner to self-certify effectiveness.
   - KPIs: overdue actions, median close time, first-time effectiveness, recurrence.

5. **Incidents, Near Misses & Worker Observations**
   - Simple mobile reporting, severity triage, investigation timeline, causal factors, lessons learned, actions, confidentiality and anti-retaliation-sensitive handling.
   - Support workers and contractors with feedback loops.
   - KPIs: investigation timeliness, action effectiveness, recurring categories, feedback closure. Interpret reporting volume carefully.

### Priority B — High-reuse operational modules

6. **Sites, Facilities & Work Areas**
   - Site/area hierarchy, operating status, responsible manager, inspection plan, linked assets, open exceptions.
   - KPIs: inspection coverage, unresolved risks by site, overdue maintenance/inspection, site data completeness.

7. **Assets, Equipment & Calibration**
   - Asset register, criticality, owner, location, maintenance/inspection intervals, certificates, calibration evidence, failures, out-of-service state, work orders.
   - KPIs: overdue critical assets, preventive maintenance on time, repeat failures, downtime if available.
   - Complete records alone must not imply that an asset is safe to operate.

8. **Contractors & Suppliers**
   - Organization/contact, contract/work package, induction, training, insurance/certificate expiry, site requirements, access status, performance issues, corrective actions.
   - KPIs: qualification freshness, pre-start completeness, overdue actions, audit coverage.
   - Access decisions remain governed by authorized organizational rules.

9. **Competence, Training & Authorizations**
   - Role-based competence matrix, required training, verification method, expiry date, evidence, assessor, restrictions.
   - KPIs: roles with current qualifications, expiring credentials, overdue required training.
   - Model course attendance and demonstrated competence separately.

10. **Permits to Work & Operational Readiness**
    - Permit type, job/site/asset, hazard controls, isolation checks, approvals, validity window, suspend/revalidate, handback/closeout.
    - KPIs: required approvals before start, outstanding handback, expired permits still open.
    - A completed checklist is not permission to start hazardous work.

11. **Document & Standard Control**
    - Controlled procedures, checklists, template versions, approvers, effective dates, acknowledgement requirements, superseded status.
    - KPIs: active work using current templates, required acknowledgements complete, overdue reviews.
    - Respect standards licensing; link to licensed content rather than copying copyrighted standards.

### Priority C — Domain packs and strategic extensions

12. **Environmental & Sustainability Controls**
    - Environmental aspects, monitoring schedules, spills/incidents, waste evidence, energy/water readings, corrective actions.
    - KPIs: monitoring coverage, excursions, overdue actions, consumption intensity only with reliable activity denominators.

13. **Quality & Process Assurance**
    - Incoming goods, in-process and final checks, nonconformities, rework, supplier issues, complaints, approved dispositions.
    - KPIs: first-pass yield, defect/rework rates only where production or service volume is measured.

14. **Change Management (MOC)**
    - Proposed change, affected sites/assets/processes, risk assessment, consultation, approvals, training/document updates, post-change validation.
    - KPIs: changes reviewed before implementation, overdue actions, post-change checks complete.
    - Workflow and approval rules must be defined per organization.

15. **Emergency Preparedness**
    - Emergency plans, equipment inspections, drill schedules/results, roles, lessons learned, corrective actions.
    - KPIs: drills on time, overdue drill actions, equipment past due.

16. **Supplier/Customer Service Quality**
    - Complaint intake, acknowledgement, investigation, corrective response, recurring themes, customer feedback.
    - KPIs: response/closure time and recurrence with a clear cohort and denominator.

## 6. Which markets should Inspectra investigate first?

These are hypotheses to validate, not established demand or revenue claims.

| Rank | Segment hypothesis | Why the shared core fits | Discovery questions |
|---|---|---|---|
| 1 | Multi-site facilities and property operations | Recurring location checks, assets, maintenance follow-up, document control, vendor oversight | Who owns inspections today? Where do deadlines and repairs get lost? Which monthly reports do managers need? |
| 2 | Construction and contractor-heavy projects | Site inspections, contractor onboarding, permits, daily checks, hazards and actions | How are subcontractors approved? How are permits and pre-start checks verified? What workflow must work on phones? |
| 3 | Manufacturing and warehousing | Equipment/area checks, quality deviations, maintenance, safety, supplier issues | Which assets and checks are critical? Where are maintenance, production, and quality records stored? |
| 4 | Food service, catering, and food processing | Hygiene rounds, cleaning schedules, monitoring records, corrective action, supplier checks | Which local controls are required? Which readings need timestamps? What offline/mobile evidence is needed? |
| 5 | Retail and hospitality chains | Repeatable branch checklists, facility/equipment checks, vendor follow-up, multi-site comparison | Which checks recur daily/weekly? Who verifies closure? |
| 6 | Fleet, transport, and logistics | Vehicle checks, defects, maintenance, driver credentials, incidents | What system owns vehicle/driver data? What happens after a critical defect report? |
| 7 | Healthcare, laboratories, and education campuses | Equipment/facility checks, procedures, training, environmental and safety checks | Which specialist rules, privacy requirements, equipment records, and integrations raise the validation bar? |

**Recommendation:** investigate the first three segments in customer discovery while keeping the core domain-neutral. Interview 3–5 practitioners/managers per candidate segment, map the workflow and current failure points, request anonymized sample checklists/reports, and test one end-to-end workflow. This is a discovery target, not statistically representative market validation.

## 7. Shared domain model and event history

Build a common model with stable IDs and explicit relations. Candidate entities:

- Organization/tenant; user/role/permission; site/area/asset/process.
- Inspection or audit plan; scheduled task; checklist template and version; inspection instance; answer/result; submission/review.
- Finding/nonconformity/observation; hazard category; risk assessment; control; corrective action; root cause; effectiveness verification.
- Evidence attachment and metadata; controlled document; requirement/obligation and applicability.
- Contractor/supplier; worker role; competency; credential; training record.
- Permit/authorization/approval; incident/near miss; change request; emergency drill.
- Integration source/sync run/validation result; audit event; KPI definition/version/result; management review/decision/follow-up action.

Relations should be explicit, e.g. finding → inspection → site/asset → risk/control → action → evidence → effectiveness review. Keep domain-specific fields in bounded modules or typed extensions rather than one unvalidated catch-all object.

Use timestamped state transitions such as created, assigned, started, submitted, reviewed, returned, resolved, verified, reopened, and cancelled, with actor, reason, and entity version. Store current state and transition history. A mutable last-updated timestamp alone cannot reconstruct historical performance.

Keep these concepts distinct:

- **Status:** current workflow state.
- **Outcome:** passed, failed, not applicable, or domain-specific result.
- **Severity:** consequence class under an approved taxonomy.
- **Risk:** assessment using a versioned, approved method.
- **Evidence status:** missing, attached, in review, accepted, rejected, expired.
- **Data status:** sample, local, live, stale, incomplete, unverified.
- **Authorization state:** denied, approval required, allowed; separate from whether work was completed.

## 8. Dashboard information architecture

Recommended navigation, enabled per organization:

1. **Overview** — executive KPIs, period comparison, exceptions, data-health warnings.
2. **Work Queue** — due inspections, actions, reviews, approvals, escalations assigned to the user/team.
3. **Inspections & Audits** — plans, schedules, templates, audit programs, executions.
4. **Findings & CAPA** — findings, root causes, actions, verification, recurrence.
5. **Risk & Controls** — risk register and treatment plan.
6. **Sites & Assets** — locations, areas, equipment, due dates, out-of-service items.
7. **People & Contractors** — competence, training, credentials, contractor/supplier assurance.
8. **Permits & Changes** — operational authorization and change control.
9. **Compliance & Documents** — obligations, applicability, controlled templates, evidence, review dates.
10. **Reports & Management Review** — reproducible exports, trend analysis, decisions, follow-up.
11. **System Health** — connectivity, synchronization, evidence storage, failed jobs, data quality, audit-event coverage, permissions/configuration.
12. **Administration** — organization boundaries, roles, permissions, template/risk/KPI versions, retention, integration configuration.

The global work queue and site/asset links should work across modules. Avoid duplicating the same corrective action into several inconsistent backlogs.

## 9. Data and implementation dependencies

Do not implement every KPI as a calculation over whatever fields happen to exist. Establish data contracts first.

### Required foundations

- Persistent, authenticated, organization-scoped storage before multi-user or cross-customer use.
- Stable IDs, required-field validation, referential integrity, time-zone policy, deletion/retention rules.
- Timestamped workflow events and tamper-evident audit records for sensitive actions requiring them.
- Evidence storage with access control, metadata, retention, upload limits, file validation, integrity checks, and appropriate access logs.
- Authorization enforced server-side on sensitive operations. Hiding a client button is not security.
- Versioned checklist templates, risk scales, metric definitions, and domain configuration.
- Integration adapters with source identity, sync attempts, idempotency, failure handling, retries, and stale-data states.
- Export permissions and privacy controls. CSV should carry reporting window, generation time, filters, metric/formula version, and source-status note where feasible.
- Backups and tested restore, operational monitoring, incident handling, and recovery procedures before any production-readiness claim.

### Verification expectations

For every metric, test numerator/denominator boundaries, time-zone transitions, cancelled/rescheduled records, missing values, duplicates, reopening, historical changes, access isolation, and reproducibility. Use seeded fixtures with known expected outputs and compare dashboard values to independently calculated results. Test keyboard and mobile workflows.

## 10. Implementation order and acceptance gates

See [roadmap.md](roadmap.md). Use these gates:

- **Gate 0 — Evidence baseline:** establish repository structure, runtime, supported users/workflows, deployment path, and known limitations. Nothing is “implemented” based on this document alone.
- **Gate 1 — Domain-neutral core:** authenticated organizations/users/roles, sites/assets, inspection plans and instances, versioned checklists, findings, actions, evidence metadata, state events. Demonstrate end-to-end traces.
- **Gate 2 — Trustworthy metrics:** implement a small agreed KPI set, metric catalog, filters, source/freshness states, and deterministic tests.
- **Gate 3 — Management loop:** risk/control register, audit/CAPA workflow, management review, action follow-up.
- **Gate 4 — One vertical pack:** validate one target segment with real users and anonymized workflows before building multiple packs.
- **Gate 5 — Production hardening:** access-control tests, data isolation, security review, backup/restore evidence, accessibility, load/error handling, monitoring, operational documentation.
- **Gate 6 — Expansion:** add a second pack after reuse of core entities and workflows is demonstrated and measured.

### Definition of done for a module

- [ ] User problem and accountable role documented.
- [ ] Workflow and state transitions defined.
- [ ] Required data, validation rules, and evidence expectations explicit.
- [ ] Authorization and organization isolation tested.
- [ ] State changes and sensitive actions traceable.
- [ ] KPI formulas and exclusions documented.
- [ ] Empty, stale, invalid, partial, and error states accurate.
- [ ] Automated tests cover normal, boundary, permission, and failure cases.
- [ ] Exports reconcile to source records.
- [ ] User acceptance recorded for the target workflow.
- [ ] Known limitations and residual risks recorded.
- [ ] Documentation matches the current implementation.

## 11. Source register

Reviewed 2026-10-25. Prefer official primary sources for ongoing maintenance; re-check the current edition/status before making implementation or compliance claims.

1. **ISO 45004:2024 — Occupational health and safety management, performance evaluation guidance.** Monitoring, measurement, analysis, evaluation, and relevant indicators; balanced use of proactive indicators. [ISO standard page](https://www.iso.org/standard/64285.html) · [Public preview/table of contents](https://www.iso.org/obp/ui?_escaped_fragment_=iso%3Astd%3Aiso%3A45004%3Aed-1%3Av1%3Aen)
2. **OSHA — Leading Indicators.** Proactive prevention measures and their relationship with lagging indicators. [Official guidance](https://www.osha.gov/leading-indicators)
3. **OSHA — Hazard Identification and Assessment.** Inspections, incident/near-miss investigation, recurring hazards, worker involvement, and risk prioritization. [Official guidance](https://www.osha.gov/safety-management/hazard-Identification/)
4. **OSHA — Worker Participation.** Participation, concern reporting, investigation involvement, and barriers that can suppress reporting. [Official guidance](https://www.osha.gov/safety-management/worker-participation)
5. **OSHA — Contractor and staffing coordination.** Prequalification, coordinated planning, training, and consistent site expectations. [Official guidance](https://www.osha.gov/safety-management/communication)
6. **ISO 19011:2026 — Guidelines for auditing management systems.** Current published edition as of this review date. [ISO standard page](https://www.iso.org/standard/19011)
7. **ISO 31000:2018 — Risk management guidelines.** ISO states this edition was reviewed and confirmed in 2023. [ISO committee page](https://committee.iso.org/standard/31000)
8. **ISO 37301:2021 — Compliance management systems.** ISO reports it was reviewed and confirmed in 2026. [ISO standard page](https://www.iso.org/standard/75080.html)
9. **ISO 55001:2024 — Asset management system requirements.** [ISO standard page](https://www.iso.org/cms/live/live/en/sites/isoorg/contents/data/standard/08/30/83054.html)
10. **ISO 14001:2026 — Environmental management systems.** Published April 2026. [ISO standard page](https://www.iso.org/standard/14001)
11. **ISO 9001:2026 — Quality management systems.** Published September 2026, replacing ISO 9001:2015. [ISO standard page](https://www.iso.org/standard/9001)
12. **ISO 41001:2018 — Facility management systems.** ISO lists a revised ISO/DIS 41001 as under development as of this review date. [ISO management-system standards list](https://www.iso.org/management-system-standards-list.html)
13. **ISO 22000:2018 — Food safety management systems.** A replacement draft, ISO/DIS 22000, is under development; do not treat a draft as the current published standard. [ISO/DIS 22000 status](https://www.iso.org/standard/88794.html) · [ISO 22000:2018 page](https://www.iso.org/standard/65464.html)
14. **International Labour Organization — Occupational safety and health management systems.** Systems approach spanning policy/objectives, planning/implementation, evaluation, and improvement. [ILO overview](https://www.ilo.org/topics-and-sectors/safety-and-health-work/occupational-safety-and-health-management-systems)

## 12. Explicit non-goals and unresolved questions

- This document does not claim legal compliance, ISO conformity, or certification.
- It does not prescribe one risk-scoring formula for every organization.
- It does not define a universal regulatory checklist; requirements and applicability must be locally validated.
- It does not establish market size or willingness to pay; segment choices are hypotheses.
- It does not claim the repository contains a working app, backend, tests, integrations, or deployed production system.
- The next technical step after repository inspection is to record the stack and deployment path, then implement an end-to-end slice with traceable data and testable metrics.

### Open discovery decisions

1. Initial segment and buyer: EHS/quality manager, facility operations, compliance lead, or project/site manager.
2. First operating environment and jurisdiction, including applicable legal requirements.
3. Data residency, retention, evidence ownership, signatures/approvals, and auditability needs.
4. First integration candidates and sources of truth for sites, assets, users, and work orders.
5. First release KPI set and who approves metric definitions, risk scales, and escalation thresholds.
6. Whether offline mobile capture is mandatory for the first segment.
