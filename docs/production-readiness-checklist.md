# Production Readiness Checklist

**Document type:** Release gate and verification register  
**Prepared:** 2026-10-27  
**Current decision:** **NOT PRODUCTION-READY — NOT ESTABLISHED**  
**Scope:** The reusable, sector-neutral Inspectra core and the production controls required before it may be used as a system of record.

This checklist is the cross-cutting release gate. It complements, and does not replace, the staged implementation plan in [the roadmap](roadmap.md), the [security and assurance model](security-and-assurance-model.md), the [core architecture](core-architecture.md), and feature-specific specifications. It is a target control list, not evidence that the controls exist.

## 1. How to use this checklist

- Keep an item unchecked until its acceptance condition has been demonstrated in the actual target environment or a repeatable test appropriate to the claim.
- For every checked item, retain a source-of-truth evidence link, commit/release identifier, environment, check/run identifier, verification date, verifier, and scope/limitations. A box without evidence is not complete.
- Record status as **PASS**, **FAIL**, **BLOCKED**, **NOT RUN**, or **NOT APPLICABLE**. “Not applicable” requires a written rationale and an accountable reviewer.
- A local unit test is not a production observation. A green CI run proves only the checks run on that commit. A stored hash proves integrity relative to that digest, not factual truth or authorship.
- Separate epistemic state, authorization state, execution state, business completion, evidence review and source freshness. Do not use one status field to imply another.
- Do not certify or advertise legal conformity, safety assurance, security certification, uptime, recovery objectives or tamper-proof logging from documentation alone.

## 2. Current verified boundary

At the reviewed baseline before this checklist change, the evidence-review-history implementation is on draft branch `openspec/add-evidence-review-history`, commit `8f7165143cea50f74f1afdd4779f49924889c466`. GitHub Actions run [40495382111](https://github.com/Loofy147/Inspectra/actions/runs/40495382111) passed the repository's JavaScript syntax check and 31 domain tests on that code commit.

The currently documented application boundary remains a browser-local demo using illustrative records. There is no production API/database/authentication, shared multi-user persistence, managed evidence-file repository, or independent audit service in this shell. Browser-local review events can be edited or deleted; reviewer labels do not establish verified identity.

**Interpretation:** automated domain checks pass within their tested scope; production readiness has not been established. All production gate checkboxes below start unchecked.

## 3. Gate 0 — Scope, accountability and risk acceptance

- [ ] **G0.1 Intended use:** Name the user groups, operational decisions, record types and explicit prohibited uses. Separate pilot/demo use from use as a system of record.
- [ ] **G0.2 Risk classification:** Identify safety, operational, financial, privacy, legal, reputational and availability consequences for each material workflow.
- [ ] **G0.3 Accountable owners:** Assign product/domain owner, security owner, data owner, operational on-call owner, release approver and evidence/retention owner.
- [ ] **G0.4 Deployment boundary:** Document jurisdictions, data residency needs, external processors, retention obligations and contractual constraints for the actual deployment.
- [ ] **G0.5 Decision record:** Record architecture choices, rejected alternatives, assumptions, dependencies, rollback boundaries and unresolved risks.
- [ ] **G0.6 Release authority:** Define who may approve the release and which blockers cannot be waived. No implementer may silently mark a blocker accepted on behalf of the risk owner.

**Gate exit:** intended use and risk ownership are approved; no critical scope or authorization question remains implicit.

## 4. Gate 1 — Domain model and workflow correctness

- [ ] **G1.1 Canonical schemas:** Define versioned schemas for organizations, memberships, sites, areas, assets, inspections, checklists, findings, corrective actions, risks, controls, evidence, events, management reviews and reports as applicable.
- [ ] **G1.2 Identity and relationships:** Define stable IDs, foreign keys, ownership/tenant keys, uniqueness rules, deletion behavior and relation cardinality. Validate that cross-record links cannot cross tenant boundaries.
- [ ] **G1.3 State contracts:** Specify allowed and forbidden transitions for each material workflow, including who may perform each transition and the required evidence/reason.
- [ ] **G1.4 State separation:** Keep workflow status, outcome, severity, risk score, evidence-review state, data quality, source freshness, authorization and completion separate.
- [ ] **G1.5 Server authority:** Enforce all consequential rules in trusted application/database layers. Client-side validation is defense-in-depth only.
- [ ] **G1.6 Temporal rules:** Define timezone handling, due-date boundaries, clock source, period inclusion, rescheduling/cancellation, stale records and backdated corrections.
- [ ] **G1.7 Concurrency:** Define optimistic/pessimistic concurrency behavior and conflict responses; demonstrate that competing updates do not silently overwrite one another.
- [ ] **G1.8 End-to-end trace:** Demonstrate one full, persisted trace from plan → inspection → finding → action → evidence → effectiveness verification, including invalid and reopened cases.
- [ ] **G1.9 Boundary tests:** Cover missing values, invalid dates, duplicate IDs, broken links, invalid transitions, partial records and state-dependent requirements.
- [ ] **G1.10 Known-answer fixtures:** Maintain realistic fixtures with independently specified expected outcomes; retain failed cases as regression tests.

**Gate exit:** required domain invariants are enforced by the trusted write path and covered by repeatable positive, negative and boundary tests.

## 5. Gate 2 — Identity, authorization and tenant isolation

- [ ] **G2.1 Trusted identity:** Configure a maintained identity provider and define account recovery, session expiry, revocation, sign-out and administrative access.
- [ ] **G2.2 Role/permission model:** Approve a resource/action matrix for operator, inspector, reviewer, site manager, auditor, organization administrator and read-only roles as applicable.
- [ ] **G2.3 Server-side enforcement:** Authorize every read, write, transition, bulk action, export, file upload/download and administrative operation against verified identity and resource membership.
- [ ] **G2.4 Tenant isolation:** Derive tenant membership from a trusted server-side source. Never trust a client-supplied tenant ID or editable role field.
- [ ] **G2.5 Negative authorization tests:** Test cross-tenant ID substitution, unauthorized object reads/writes, role escalation, bulk export, attachment access, replayed links and expired/revoked sessions.
- [ ] **G2.6 Privileged actions:** Define step-up/MFA and explicit approval requirements for high-impact actions; bind approval to the exact target, operation, parameters and scope, then re-check immediately before execution.
- [ ] **G2.7 Least privilege:** Separate application, database, storage, integration and operations identities; grant minimum required access and document break-glass use.
- [ ] **G2.8 Authorization audit:** Record the authenticated actor and allow/deny outcome for defined security-sensitive actions without logging credentials or excessive sensitive payload.
- [ ] **G2.9 Isolation under exports/jobs:** Verify tenant filtering for asynchronous tasks, scheduled reports, background jobs, search indexes, caches and generated downloads.

**Gate exit:** no known high-severity authorization or tenant-isolation defect remains; deny paths are tested by a checker independent of the UI.

## 6. Gate 3 — Persistence, migrations and integrity

- [ ] **G3.1 Persistence choice:** Select and document the production database, deployment region, availability/consistency model, ownership, cost envelope and operational responsibility.
- [ ] **G3.2 Database constraints:** Enforce keys, foreign keys, unique constraints, check constraints and tenant-bound relationships in the database where supported.
- [ ] **G3.3 Transaction semantics:** Define atomicity boundaries for related record changes, review-state changes and event creation. Test failure between each write boundary.
- [ ] **G3.4 Migration discipline:** Version every schema migration; test fresh install, upgrade from representative legacy snapshots, rollback/forward recovery and failure part-way through migration.
- [ ] **G3.5 Data preservation:** Verify export/import completeness, ID stability, character encoding, timezone fidelity and relation reconstruction with reconciliation reports.
- [ ] **G3.6 Data lifecycle:** Define archival, deletion, correction, redaction, export, retention and legal hold behavior; identify dependent records and audit-history implications.
- [ ] **G3.7 Environment separation:** Keep development, test, staging and production credentials/data separated. Prevent sample fixtures from entering live tenants.
- [ ] **G3.8 Cross-device proof:** Verify that authorized users see consistent persisted state across separate sessions/devices and that unauthorized users do not.
- [ ] **G3.9 Database recovery:** Demonstrate recovery from corruption, accidental deletion, failed migration and unavailable database using documented procedures.

**Gate exit:** source-of-truth persistence and migrations pass integration/recovery tests, and a record survives restart independently of a browser profile.

## 7. Gate 4 — Evidence storage, review and audit history

- [ ] **G4.1 Private file store:** Select a managed storage design with private-by-default access, configured size/type limits, capacity controls and owner/retention metadata.
- [ ] **G4.2 Upload safety:** Validate actual content, not only filename extension; scan/quarantine files; mitigate malware, decompression bombs, path traversal and unsafe active-content previews.
- [ ] **G4.3 Integrity and provenance:** Capture file ID, original filename, MIME type, byte size, cryptographic hash, uploader identity, server-observed upload time, source and version. Explain that hash integrity does not prove that a file's claims are true.
- [ ] **G4.4 Authorized retrieval:** Enforce tenant/resource authorization at every upload, preview, download, link-sharing and export path. Verify expiry and revocation for temporary download links.
- [ ] **G4.5 Review lifecycle:** Preserve each accepted/rejected/superseded decision with authenticated actor, event time, prior/new state, reason, entity version and source.
- [ ] **G4.6 Transactional event capture:** Ensure the state change and its event commit atomically or fail together; detect missing, duplicate, out-of-order and conflicting events.
- [ ] **G4.7 Audit protection:** Define append-only/tamper-evident controls, privileged access, independent retention, time synchronization, log access and alerts for gaps. Do not call application code convention alone immutable.
- [ ] **G4.8 Correction and supersession:** Preserve links to prior evidence/reviews when replaced or corrected; do not silently overwrite a source reference or discard the decision trail.
- [ ] **G4.9 Retention and deletion:** Approve per-data-class retention, legal hold, redaction, deletion and export rules and verify behavior against backups and event history.
- [ ] **G4.10 Evidence failure cases:** Test incomplete uploads, retry, duplicate submission, storage outage, malware rejection, unauthorized download, missing file, hash mismatch and restore.
- [ ] **G4.11 Historical honesty:** Older records without historical events must be marked as history unavailable/unknown; never fabricate past transitions from current state fields.

**Gate exit:** evidence files and their review history have a trusted identity, authorization, lifecycle and recoverable record. The current browser-local prototype does not satisfy this gate.

## 8. Gate 5 — Business workflow and operational effectiveness

- [ ] **G5.1 Closure semantics:** Separate work completion, issue resolution and effectiveness verification. Reopening a record preserves previous closure/verification events.
- [ ] **G5.2 Accountable action:** Every actionable exception has an owner, deadline or explicit no-deadline rationale, response path and defined escalation policy.
- [ ] **G5.3 Evidence sufficiency:** State what evidence is required for each transition and who determines sufficiency. Accepted metadata alone must not imply authenticity or effectiveness.
- [ ] **G5.4 Review independence:** For workflows requiring independent verification, prevent the same actor from satisfying the independent-review role unless the approved policy explicitly permits it.
- [ ] **G5.5 End-to-end failure paths:** Test incomplete checklists, invalid closure, missing evidence, rejected evidence, overdue actions, duplicate submissions and reopened findings.
- [ ] **G5.6 Recommendation versus authorization:** A system recommendation, severity score or KPI threshold must not itself grant permission to perform a consequential operation.
- [ ] **G5.7 Operational pilot:** Validate critical workflows using approved, de-identified or authorized representative examples and named domain reviewers before production use.

**Gate exit:** critical workflows preserve accountability and distinguish recorded process state from real-world outcome.

## 9. Gate 6 — Metrics, reports and exports

- [ ] **G6.1 Metric registry:** Define owner, purpose, formula, numerator, denominator, cohort, filters, exclusions, reporting period, as-of time, source, freshness, required fields and version for every KPI.
- [ ] **G6.2 Known-answer tests:** Independently calculate expected metric values from a fixed fixture and compare with application results.
- [ ] **G6.3 Missing-data semantics:** Distinguish zero, unknown, unavailable, stale, incomplete, not applicable and not configured.
- [ ] **G6.4 Temporal reproducibility:** Preserve sufficient event history/versioned definitions to reproduce a historical report after later record edits.
- [ ] **G6.5 Drill-down and reconciliation:** Trace metric totals to qualifying source records and account for excluded records in a visible way.
- [ ] **G6.6 Export safety:** Enforce export authorization, record export activity where required, neutralize spreadsheet formulas and verify the exported result against source data.
- [ ] **G6.7 Valid interpretation:** Do not assert compliance, safety, effectiveness or causation from a score without a validated interpretation rule and suitable evidence.

**Gate exit:** reports reconcile to the system of record and their meaning and uncertainty are clear to the intended decision-maker.

## 10. Gate 7 — Security, privacy and supply chain

- [ ] **G7.1 Threat model:** Document assets, trust boundaries, attackers, abuse cases, sensitive data flows and mitigations; revisit when architecture changes.
- [ ] **G7.2 Security requirements:** Select and version an applicable set of OWASP ASVS requirements based on exposure and risk; record requirement-level pass/fail evidence and accepted exceptions.
- [ ] **G7.3 Web/API controls:** Test injection, XSS, CSRF where applicable, SSRF, broken object/function/property authorization, rate/resource abuse, unsafe error disclosure and security misconfiguration.
- [ ] **G7.4 Secret management:** Scan for leaked secrets; keep secrets out of source, logs, client bundles and fixtures; verify rotation and revoked-key behavior.
- [ ] **G7.5 Dependency and build security:** Generate dependency inventory/SBOM where appropriate, pin or constrain dependencies, run vulnerability checks, review updates and define exception expiry.
- [ ] **G7.6 Configuration:** Verify HTTPS/TLS, security headers/CSP where appropriate, CORS, cookie/session flags, origin policy, environment variable handling and least privilege.
- [ ] **G7.7 Privacy and retention:** Minimize data collection; classify sensitive data; define access, correction, export, deletion, retention and breach-handling obligations for each deployment jurisdiction.
- [ ] **G7.8 Logging safety:** Redact credentials, tokens, personal data and confidential operational detail from logs, traces, crash dumps and telemetry.
- [ ] **G7.9 Security verification:** Complete focused automated and manual security testing; resolve or formally block release on high/critical findings according to the approved policy.
- [ ] **G7.10 Incident readiness:** Document security contact, severity classification, containment, credential revocation, evidence preservation, communication and recovery steps.

**Gate exit:** security requirements are evidenced, residual risk has an accountable owner, and no prohibited/unaccepted critical issue remains.

## 11. Gate 8 — Reliability, integrations and recovery

- [ ] **G8.1 Service objectives:** Define service-level objectives, availability measurement, alert thresholds and capacity expectations before advertising an uptime target.
- [ ] **G8.2 Observability:** Monitor application errors, latency, database health, storage errors, queue/job age, integration freshness, authorization-denial spikes and missing audit events.
- [ ] **G8.3 Safe retries:** Give mutating operations stable logical-operation identity and idempotency semantics. Distinguish operation ID from attempt ID and provider request/effect ID.
- [ ] **G8.4 Ambiguous outcomes:** When a timeout may follow an external effect, preserve an unknown outcome and reconcile by stable identity before retrying. Do not claim exactly-once external effects without a supporting provider contract.
- [ ] **G8.5 Integration contracts:** Define schemas, ownership, scopes, cursors/watermarks, last-success time, backoff, dead-letter/reconciliation, replay protection and source freshness for each connector.
- [ ] **G8.6 Partial outage:** Test database, storage, identity provider, mail/notification, background worker and external API outages. Surface partial/unavailable states rather than success-shaped defaults.
- [ ] **G8.7 Backup objectives:** Business/operations owners must set approved recovery point objective (RPO) and recovery time objective (RTO); do not invent targets.
- [ ] **G8.8 Restore exercise:** Restore into an isolated environment and verify record counts, relations, evidence access, event history and report reconciliation against known values.
- [ ] **G8.9 Rollback and forward recovery:** Rehearse application rollback, schema migration recovery and feature-flag disablement without losing committed records or duplicating external effects.
- [ ] **G8.10 Failure injection:** Test crash/restart and failures before and after durable commit/remote acknowledgement; retain outcomes and residual uncertainties.
- [ ] **G8.11 Resource protection:** Apply and test request/body limits, timeouts, rate/resource controls, queue bounds and protection against unbounded retry loops.

**Gate exit:** failure behavior and recovery are tested under documented conditions and meet owner-approved objectives.

## 12. Gate 9 — Accessibility, UX and performance

- [ ] **G9.1 Keyboard paths:** Complete all critical flows using keyboard only, including dialogs, tables, search, forms, error correction and review history.
- [ ] **G9.2 Assistive technology:** Test key workflows with representative screen readers; label controls, communicate status changes and preserve logical focus.
- [ ] **G9.3 Responsive design:** Test supported mobile/tablet/desktop viewports and real-device flows for data entry, uploads, review and exports.
- [ ] **G9.4 Accessibility standard:** Use W3C WCAG 2.2 AA as the chosen target unless the product owner records a different justified requirement; validate against the selected criteria.
- [ ] **G9.5 State clarity:** Validate empty, stale, loading, permission-denied, partial, offline, failed-save and recovery states with usability tests.
- [ ] **G9.6 Performance budgets:** Define target page/operation latency, record-volume, import/export size and concurrency envelopes; measure against representative data.
- [ ] **G9.7 Browser compatibility:** Verify the declared browser support matrix; document unsupported behavior and graceful degradation.
- [ ] **G9.8 Human factors:** Validate that severity labels, risk scores, evidence states and recommendations cannot be mistaken for safety guarantees or authorization.

**Gate exit:** the intended user population can complete critical tasks reliably and understand the application’s limits.

## 13. Gate 10 — Release engineering and operations

- [ ] **G10.1 Environment inventory:** Record production domains, hosting, database, identity, storage, integrations, regions, secrets, owners and dependencies.
- [ ] **G10.2 CI/release gates:** Require lint/syntax, unit, integration, migration, authorization, security and relevant UI/accessibility checks for the appropriate change class.
- [ ] **G10.3 Artifact traceability:** Record source commit, dependency inventory, build artifact identity, workflow run, deployment identifier, migration version and release notes.
- [ ] **G10.4 Staging parity:** Test the release candidate in an environment representative of production without mixing real sensitive data into test fixtures.
- [ ] **G10.5 Deployment safety:** Verify health checks, migration ordering, rollback/forward recovery, feature flags and safe handling of in-flight work.
- [ ] **G10.6 Runbooks:** Provide searchable procedures for deploy/rollback, incident handling, backup/restore, access revocation, integration failures and evidence-storage failures.
- [ ] **G10.7 On-call and escalation:** Assign named operational ownership, alert routing, severity levels, handover and escalation coverage.
- [ ] **G10.8 Support and change control:** Define support channel, maintenance windows where relevant, release communication, status reporting and change approval.
- [ ] **G10.9 Monitoring proof:** Verify alert delivery and handling using a controlled test; a configured alert with no successful delivery test is not accepted.
- [ ] **G10.10 Data migration acceptance:** Reconcile pre/post-migration counts and critical relationships; document and resolve or approve discrepancies before traffic is switched.
- [ ] **G10.11 License and supplier review:** Record dependency/license review and material provider/vendor obligations before release.

**Gate exit:** the exact release artifact is identifiable, deployable, observable and recoverable by a responsible operator.

## 14. Gate 11 — Limited rollout and sustained operations

- [ ] **G11.1 Pilot boundary:** Define pilot users, data classes, duration, allowed workflows, support coverage, stop conditions and rollback criteria.
- [ ] **G11.2 Production data safeguard:** Explicitly decide whether the pilot may hold real operational records. Do not use real safety-critical or regulated records until the corresponding controls are passed and approved.
- [ ] **G11.3 Acceptance review:** Obtain sign-off from product/domain, security, data/privacy and operations owners with linked evidence and residual risks.
- [ ] **G11.4 Post-launch review:** Schedule a review of incidents, failed tasks, data integrity, audit gaps, access denials, performance, support burden and user-reported problems.
- [ ] **G11.5 Regression and improvement loop:** Convert production incidents and negative findings into test cases, corrective actions, owners and re-verification records.
- [ ] **G11.6 Periodic access/risk review:** Define periodic reviews for privileged users, integrations, retention, threat model, dependencies, backup restores and unresolved risks.
- [ ] **G11.7 Business continuity:** Document owner succession, provider outage handling and a credible fallback for critical workflows.
- [ ] **G11.8 Exit criteria:** Define conditions for broad rollout, continued restricted pilot, suspension or rollback based on observed evidence.

**Gate exit:** the limited rollout meets approved guardrails and has a documented continue/stop decision.

## 15. Blocking release policy

Production release is **BLOCKED** while any of the following applies:

- A critical requirement for identity, authorization, tenant isolation, data integrity, evidence access or destructive/high-impact actions is unverified.
- A high/critical security issue remains without an explicitly authorized and time-bounded exception.
- Backups/restores, migration recovery or incident response are required for the intended use but have not been exercised.
- High-impact workflow semantics, metric formulas or required evidence are ambiguous enough to produce unsafe or misleading decisions.
- The release artifact, test results, production configuration or rollback path cannot be identified.
- Required accountable owners or residual-risk acceptance are missing.

A narrow pilot may have a separate approved gate, but must not be described as general production readiness. No checkbox can be waived solely because implementation time has been spent or documentation exists.

## 16. Evidence register for gate closure

Maintain one row per gate or material item in the project evidence register:

| Field | Required value |
|---|---|
| Checklist item | ID (for example, G2.5) |
| Result | PASS / FAIL / BLOCKED / NOT RUN / NOT APPLICABLE |
| Scope | Exact environment, workflow, version and data fixture |
| Evidence | Direct link to test, CI run, issue, report, logs or observed state |
| Source revision | Commit/build/deployment identifier |
| Verification | Method and independence level appropriate to impact |
| Reviewer | Accountable verifier, not just implementer where independent review is required |
| Date | Observation/verification date |
| Limitations | What the evidence does not prove |
| Residual risk | Severity, owner and next action |
| Recheck trigger | Date, release, dependency, policy or architecture change |

## 17. Release decision record template

Copy this record for each release decision:

- **Release/version:**
- **Source commit and artifact:**
- **Target environment:**
- **Intended scope/users/data:**
- **Gate results and evidence links:**
- **Open blockers:**
- **Accepted residual risks (owner, expiry and rationale):**
- **Backup/restore and rollback evidence:**
- **Security/accessibility verification evidence:**
- **Incident and operational readiness:**
- **Decision:** GO / LIMITED PILOT / NO-GO
- **Approver(s) and date:**
- **Conditions and stop/rollback triggers:**
- **Next review date:**

## 18. Verification references

Use the version current at the time of assessment and record the selected edition in the evidence register. These references guide verification; they do not themselves prove compliance or certification.

- [OWASP Application Security Verification Standard (ASVS)](https://asvs.owasp.org/) — security requirements and verification catalogue; stable 5.0.0 was listed by OWASP when this checklist was prepared.
- [OWASP Top 10](https://owasp.org/projects/top-ten) — awareness and threat discovery; not a replacement for an application-specific verification plan.
- [OWASP API Security Project](https://owasp.org/www-project-api-security/) — relevant when Inspectra exposes APIs or consumes external APIs.
- [NIST Secure Software Development Framework (SSDF)](https://csrc.nist.gov/projects/ssdf) — secure development lifecycle practices; distinguish final publications from drafts.
- [W3C Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/) — accessibility criteria.
- [OpenSpec spec-driven workflow](https://openspec.dev/docs/schemas/spec-driven) — proposal/spec/design/tasks for change-level requirements and verification.

**Checklist owner:** Inspectra project owner to assign.  
**Last review:** 2026-10-27.  
**Current overall state:** **NOT PRODUCTION-READY — NOT ESTABLISHED**.
