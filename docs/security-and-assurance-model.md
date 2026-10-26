# Security and Assurance Model

**Status:** Design baseline, not a security certification  
**Prepared:** 2026-10-26

## 1. Trust boundaries

Inspectra will eventually process operational findings, images/documents, user identities, sites/assets, supplier/contractor details, approvals, and performance reports. Treat those records as organization-confidential by default. Requirements for personal data, retention, cross-border processing, and regulated records must be set for the deployment jurisdiction.

Current shell boundary: data and activity are stored in one browser profile. There is no authenticated identity, shared database, server-side authorization, encrypted evidence repository, or independent audit service. The sample workspace must not be used as a live operational record.

## 2. Core security requirements

### Identity and sessions
- Use a maintained identity provider; require verified identity for operational write actions.
- Define session duration, refresh, revocation, recovery, and administrative access.
- Do not use editable profile/user metadata for authorization.
- Record the authenticated actor on every sensitive mutation; do not trust a client-supplied actor field.
- Define MFA/step-up requirements for privileged and high-impact actions.

### Tenant isolation and access control
- Resolve organization membership on the server from trusted identity and membership records.
- Apply authorization on every object read/write and bulk/export operation.
- Use least privilege for roles such as operator, inspector, reviewer, site manager, auditor, organization administrator, and read-only executive.
- Test cross-tenant ID substitution, unauthorized record access, unauthorized status transition, bulk export, attachment download, and role escalation.
- Do not confuse authenticated access with permission to access a particular record.
- Enforce invariants on the server/database, not only by hiding UI controls.

### Evidence and files
- Allow only configured file types and size limits; validate actual content, not just filename extension.
- Keep storage private; use short-lived, audience-limited download authorization where appropriate.
- Store metadata including record link, uploader, upload time, content type, size, integrity hash, review state, retention class, and version.
- Protect against malware, archive bombs, path traversal, unsafe previews, and HTML/script execution.
- Keep evidence review status separate from file presence. A hash establishes integrity relative to a known hash; it does not prove that a document's claims are true.
- Define replacement, deletion, legal hold, redaction, export, and retention behavior.

### Auditability
- Record actor, event time, entity, before/after state or stable diff, reason, correlation ID, and source for required state changes.
- Protect event history from ordinary user alteration and unauthorized deletion; define privileged break-glass access and alerting.
- Test missing, duplicate, out-of-order and conflicting events, and record reopening.
- Define retention, search/export access, clock synchronization, and sensitive-field redaction.
- Do not call browser activity logs or ordinary server logs an immutable audit trail.

### API and integrations
- Use explicit request/response schemas, validation, authorization, rate limits, safe error messages and request IDs.
- Store connector secrets only in trusted secret management; never commit them or expose server-only keys to browser bundles.
- Use scoped credentials, rotations, idempotency keys, retries with bounded backoff, and a dead-letter/reconciliation path.
- Validate webhook signatures and replay windows where supported.
- Distinguish connector unavailable, last sync failed, stale source, partial sync, and healthy/fresh data.

### Data quality and KPI integrity
- Enforce required fields and referential integrity.
- Preserve template, requirement, risk-scale, and metric-definition versions.
- Make missing, stale, not applicable, unknown and zero different values/states.
- Display numerator/denominator, cohort, period, source, and data-quality limitations for rates.
- Export metric definitions and filters alongside totals where feasible.
- Independently recompute sample KPI values in tests and reconcile to source records.

### Operational resilience
- Provide tested backup and restore, migration/rollback, incident response, access review, dependency update and recovery procedures.
- Monitor failed jobs, source freshness, storage errors, queue age, authorization-denial spikes, and audit-event gaps.
- Keep production and demo data separate; no seeded demo records should be mixed into a live tenant.
- Do not advertise availability, RPO/RTO, encryption posture, or certification without evidence.

## 3. Threat scenarios to include in verification

- Tenant A user can read/update Tenant B objects by changing an ID.
- A user changes their own role using profile metadata or a request body.
- A stale session still performs a privileged action after access is revoked.
- A checklist result is marked complete without required responses or valid transitions.
- An action is closed with no resolution evidence or then reported as “effective.”
- An attachment URL is guessed, reused after expiry, or accessed by another tenant.
- A CSV export formula is interpreted by spreadsheet software.
- A webhook or sync payload is replayed, duplicated, reordered, or partially applied.
- Logs or audit events expose secrets or sensitive findings to unauthorized users.
- A failing integration leaves stale data displayed as current.
- A KPI changes after the fact because a record was edited without preserving history.
- A malicious upload is rendered or served as active content.

## 4. Verification baseline

Use OWASP ASVS 5.0.0 as a requirements catalogue for application security verification, tailored to actual exposure and risk. The current frontend alone cannot satisfy a full server/auth/storage assurance assessment because those components are not yet connected.

Minimum pre-production evidence:
- automated authorization tests for every resource family and state transition;
- negative cross-tenant tests;
- schema/validation and KPI formula tests;
- upload/download access and retention tests;
- audit-history integrity and event-completeness tests;
- dependency, secret, configuration and static checks;
- accessibility testing with keyboard and assistive technology;
- backup/restore and recovery exercise;
- documented residual risk, threat owner and release decision.

## 5. References

- [OWASP Application Security Verification Standard — stable 5.0.0](https://asvs.owasp.org/) — a security requirements and verification framework, not a certificate in itself.
- [Supabase product security guidance](https://supabase.com/docs/guides/security/product-security.md) — apply if Supabase is selected; revisit current guidance before integration.
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) — accessibility requirements and test reference.
- [ISO 45004:2024](https://www.iso.org/standard/64285.html) — performance measurement principles relevant to balanced indicators.

## 6. Status labels

Use the following internally and in release notes:

- **IMPLEMENTED:** code exists and behavior was inspected.
- **TESTED:** a repeatable test passed; name the test and environment.
- **CONNECTED:** an integration is configured and a current successful read/write was verified.
- **AUDITABLE:** required events are recorded and tested against the documented control.
- **PRODUCTION-READY:** only after the approved release gates are passed with retained evidence.
- **UNKNOWN / NOT RUN / BLOCKED:** no passing evidence exists.

A feature being described in the UI or this document does not elevate its status.
