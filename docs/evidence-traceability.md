# Evidence Traceability Model

**Status:** Implemented browser-local metadata prototype; managed file storage is not implemented  
**Scope:** Sector-neutral operational assurance core

## Purpose

An evidence reference records what a supporting item is, who recorded it, when it was captured, where it came from, which operational record it supports, and whether the reference has been reviewed.

Evidence metadata is a traceability index. It is not the underlying file, proof of authenticity, a finding outcome, or proof that a control is effective.

## Prototype record contract

| Field | Purpose | Current rule |
|---|---|---|
| `id` | Stable evidence-reference identifier | Required and unique |
| `title` | Human-readable reference name | Required |
| `evidenceType` | Type of reference | `document_reference`, `photo_note`, `inspection_note`, `measurement_note`, or `external_reference` |
| `linkedEntityType` / `linkedEntityId` | Operational record supported by the reference | Required; referenced record must exist |
| `capturedAt` / `capturedBy` | Provenance: when and by whom the reference was recorded | Required |
| `sourceDescription` | Origin and context, including relevant limitations | Required; substantive text expected |
| `sourceReference` | Human-entered source identifier or locator | Optional; treated as text, not fetched |
| `storageMode` | Where the underlying content is managed | Must be `metadata_only` in this shell |
| `reviewStatus` | Workflow state for the reference | Pending review, accepted, rejected, superseded |
| `reviewedAt`, `reviewedBy`, `reviewNote` | Reviewer, time and reason for a decision | Required for accepted, rejected or superseded state |
| `version` | Prototype record version | Incremented for review-state changes |

The prototype links evidence references to inspections, findings, corrective actions, audits, management reviews, sites, assets, risks and contractors. Cross-register integrity checks report missing linked records and unsupported evidence types/states.

## Review lifecycle

- **Pending review → Accepted:** record a reviewer and a reason for acceptance.
- **Pending review → Rejected:** record a reviewer and a reason for rejection.
- **Accepted or Rejected → Superseded:** record why the reference is no longer the current reference.
- Other transitions are rejected by the domain rule.

The current UI permits review decisions and preserves the current decision metadata. Its local activity list is mutable and is not an immutable audit trail. A durable production implementation must preserve the full decision history as server-side events rather than relying on the current record fields alone.

## UX behavior

- Evidence can be recorded from the Evidence workspace or directly from a supported operational record detail.
- The record detail shows linked evidence references and review state.
- Global workspace search includes evidence metadata.
- The register can be exported as CSV for review and reconciliation.
- System Health checks evidence fields, type/state values, linked-record existence, and review provenance.

## Explicit limitations

The current prototype does **not** upload or store files. It does not calculate content hashes, scan for malware, prove authorship, resolve external links, enforce per-record authorization, control retention, prevent tampering, or provide cross-device access. A human-entered source reference is not evidence that a file exists or can be opened.

Do not put passwords, access tokens, sensitive personal data, or confidential evidence into the browser demo.

## Production acceptance gates

Before managed evidence storage is enabled, implementation must define and verify:

- Storage provider, allowed file types, size limits, malware scanning and content integrity controls.
- Authenticated upload/download paths and server-enforced authorization at both tenant and record level.
- Evidence identity, original filename, MIME type, size, cryptographic hash, uploaded-by actor, upload time and source/provenance fields.
- Review decision history as append-only server-side events, with actor, timestamp, prior/new state, reason and entity version.
- Versioning, supersession and correction behavior that preserves references to earlier evidence.
- Retention, legal hold where applicable, deletion/redaction, export, backup and restore rules.
- Safe failure states for incomplete upload, retry, duplicate submission, unavailable storage, permission denial and malware rejection.
- Tests proving tenant isolation, unauthorized denial, tamper detection where required, reproducible exports and recovery behavior.

These are production requirements, not claims about current functionality.
