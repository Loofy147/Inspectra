# Design: Evidence Review Decision History

## Baseline observations

At the inspected baseline (`867aae69d85503b1dbf462ed526c241244375d73`):

- `reviewEvidence(...)` validates transitions and returns a new evidence object with the latest review fields and incremented version.
- `finishEvidenceReview(...)` mutates the current evidence object and adds a general activity item.
- The general activity feed is capped at 40 entries; it is therefore not a canonical lifecycle journal.
- `loadWorkspace()` migrates older snapshots by adding an `evidence` collection, so the new collection should follow the same compatibility pattern.
- Workspace state is serialized under one browser-local storage key. No trusted server, authenticated actor, shared database, managed object storage or tamper-resistant audit log exists.

## Data contract

Add `evidenceReviewEvents: []` to the workspace snapshot. An event has:

| Field | Meaning |
|---|---|
| `id` | Unique stable event ID, generated from the current history collection (for example `EVR-0001`) |
| `evidenceId` | Evidence reference affected |
| `fromState` / `toState` | Actual prior and resulting review states |
| `reviewedAt` | Valid event timestamp in ISO format |
| `reviewedBy` | Reviewer label supplied by the current demo workflow; not authenticated identity |
| `reviewNote` | Rationale associated with the transition |
| `fromVersion` / `toVersion` | Evidence version before and after the transition |
| `source` | Constant such as `browser-local-demo`; documents the source boundary |

The event captures the transition facts at decision time. Do not later reconstruct older events from mutable current-record fields.

## Transition path

1. Resolve the current evidence record.
2. Call the existing domain transition guard to validate the target state, note, reviewer and timestamp without mutating input.
3. Derive one event using the original record plus the validated updated record.
4. Validate the new event and its evidence relationship against the candidate workspace.
5. Apply the updated evidence record and event to the same in-memory workspace snapshot.
6. Use the existing persistence function and accurately report whether browser storage accepted the snapshot. A storage failure must not be shown as a successful save.
7. Render the latest review state and the read-only transition history.

The UI must not call the event log immutable. Because the current local-storage snapshot is editable and deletable by the user, append-only is only a UI/application convention in this prototype.

## Seed and migration behavior

- Add explicitly illustrative events for seed evidence records whose sample data already represents accepted or rejected references. Treat these as demo fixtures, not historical production facts.
- On older snapshots, initialize a missing history collection to an empty array. Preserve all existing records.
- Do not backfill events from the current record's latest review fields. Display a clear empty-history explanation when no transition records are available.

## Validation

Extend workspace integrity checks to validate event ID uniqueness, event-to-evidence links, supported states, timestamp, actor/rationale and version progression. Keep evidence-to-operational-record validation as a distinct concern.

## UI

In evidence details, render a compact chronological review history with old state → new state, actor label, timestamp, rationale and version change. Sort newest-first. Keep the latest state visible separately. Do not provide event-edit/delete controls. Clearly state that reviewer labels are user-entered in the demo and do not establish identity.

## Compatibility and failure behavior

- No production backend, file storage, or authentication changes.
- Older snapshots load without a history list and are not reset just because this collection is absent.
- Validation failure rejects the transition before mutating the evidence record or creating an event.
- If browser persistence fails, surface the existing storage failure state. Do not imply the new event is durably saved.
- If an event is malformed or has a broken evidence link, report it through System Health rather than silently treating it as valid audit evidence.

## Verification strategy

- Unit tests for accepted, rejected and superseded transitions; event construction; invalid transitions; event uniqueness; malformed metadata; broken evidence links; version mismatch; migration with missing event collection.
- Syntax checks and full domain test suite.
- UI inspection for ordering, blank state, read-only interaction, and explicit local-only/tamperability wording.
- GitHub Actions must be checked against the exact resulting commit. Passing CI verifies the tests in that workflow only; it does not verify production audit guarantees.

## Follow-on production gate

Before calling this a production audit history, define and implement server-enforced authorization, actor identity, transactional writes, append-only access controls, retention/redaction, export, backup/restore, concurrency and tamper-detection requirements, then test them against a threat model. That is a separate change.
