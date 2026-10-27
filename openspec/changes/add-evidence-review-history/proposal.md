# Proposal: Add Evidence Review Decision History

**Status:** Implemented prototype on an open draft pull request; not merged  
**Baseline commit inspected:** `867aae69d85503b1dbf462ed526c241244375d73`  
**Implementation commit:** `06acbb2b7b83b423cedcc8abae0ae88f37eb9a06`  
**Implementation CI:** [Run 40495059091](https://github.com/Loofy147/Inspectra/actions/runs/40495059091), successful on implementation commit `06acbb2b7b83b423cedcc8abae0ae88f37eb9a06`; later branch-head verification [run 40495382111](https://github.com/Loofy147/Inspectra/actions/runs/40495382111) passed on `8f7165143cea50f74f1afdd4779f49924889c466`. Both runs report successful syntax checks and 31 passing tests.

## Why

The evidence register currently stores the latest review state, reviewer, timestamp and rationale on the evidence record. The general activity feed is mutable and capped at 40 entries. That means the demo cannot reliably present a complete sequence of evidence-review decisions or distinguish current state from prior decisions.

A separate review-event collection will make the lifecycle visible and testable while preserving the current browser-local boundary. This is a review-history prototype, not a claim of a tamper-proof or production audit trail.

## Scope

- Record each valid evidence review transition as a distinct event.
- Preserve previous and new review states, reviewer, timestamp, rationale, and evidence record version before/after the transition.
- Display review history in the evidence detail view in reverse chronological order.
- Add integrity rules and automated tests for event IDs, evidence links, transition metadata and valid state changes.
- Migrate older browser-local snapshots safely without inventing history that was never stored.
- Seed explicitly illustrative review events for the existing illustrative accepted/rejected sample records.
- Update evidence, architecture and roadmap documentation to state the exact guarantee and remaining limitations.

## Explicitly out of scope

- Production database/API/authentication and multi-user concurrency.
- Server-side append-only guarantees, tamper-evidence or cryptographic signing.
- File upload/storage, malware scanning or content-hash verification.
- Retention/legal-hold/deletion policy, backup/restore and production recovery.
- A general event-sourcing rewrite of all Inspectra records.

## Acceptance outcomes

1. A valid review transition updates the current evidence state and creates exactly one associated history event in the same browser-local workspace snapshot.
2. Invalid review transitions or invalid reviewer/rationale inputs create no event and do not mutate the domain input.
3. A record detail view explains the recorded sequence without presenting it as proof of file authenticity or an immutable audit trail.
4. An older local snapshot without a history collection remains loadable; no historical events are fabricated from the latest state fields.
5. Domain tests and syntax checks pass on the resulting commit, and CI results are read back from GitHub.

## Risks and limits

Browser storage remains user-editable and device-local. The data can be cleared or altered by browser tools. A successful local save is not a server durability guarantee, identity verification, or regulated audit control. Existing records may have prior decisions for which no full event history exists.

The cross-cutting [Production Readiness Checklist](../../../../docs/production-readiness-checklist.md) now defines separate release gates for identity, tenant isolation, trusted persistence, evidence/file storage, server-side audit history, reporting, security, recovery, accessibility and operations. Completing this prototype does not pass any production gate by itself. Overall production readiness remains NOT ESTABLISHED.

## HOS-CHANGE-SIGNATURE v1

- **ID:** HOS-CHG-20261027-INSPECTRA-EVIDENCE-HISTORY-001
- **CLASS:** FEATURE-SPECIFICATION
- **TARGET / BASELINE:** Inspectra `main`, commit `867aae69d85503b1dbf462ed526c241244375d73`
- **SCOPE:** Evidence review lifecycle history in the current browser-local demo
- **AUTHORIZATION:** User requested applying OpenSpec and valuable working assets to improve the engineering method; this record prepares the next already-discussed Inspectra milestone
- **STATE:** IMPLEMENTED ON DRAFT PR BRANCH; prototype checks pass; not merged; production readiness remains NOT ESTABLISHED
- **EVIDENCE:** Feature commit `06acbb2b7b83b423cedcc8abae0ae88f37eb9a06`; branch-head commit `8f7165143cea50f74f1afdd4779f49924889c466`; [CI run 40495059091](https://github.com/Loofy147/Inspectra/actions/runs/40495059091) and [branch-head CI run 40495382111](https://github.com/Loofy147/Inspectra/actions/runs/40495382111); syntax checks and 31 passing tests; domain, UI, migration, seed and documentation diff. Production gate source: `docs/production-readiness-checklist.md`.
- **LIMITS / RESIDUAL RISKS:** Browser-local history is not tamper-proof or production-durable; OpenSpec CLI validation and live browser visual verification remain OPEN; human review pending
- **ROLLBACK:** Revert the feature commit on the draft branch or close the unmerged PR
- **DATA BOUNDARY:** Professional / project / technical only
- **DIGEST:** Git commit provides artifact revision; no cryptographic signature is claimed
- **PREPARED BY:** ChatGPT (AI-assisted)
- **HUMAN REVIEW:** Pending
- **SIGNATURE TYPE:** Traceability record; not cryptographic
