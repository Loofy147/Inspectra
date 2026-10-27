# Evidence Review History — Delta Specification

## ADDED Requirements

### Requirement: Record each valid evidence review transition as a history event

The browser-local workspace MUST record one distinct review-history event for every successfully applied evidence-review transition. Each event MUST include a unique event ID, evidence ID, previous review state, new review state, event timestamp, reviewer, rationale, previous evidence-record version, new evidence-record version, and an explicit source marker identifying the browser-local demo.

#### Scenario: A pending evidence reference is accepted

- **GIVEN** an evidence reference is in `pending_review`
- **AND** a named reviewer and valid rationale are provided
- **WHEN** the transition to `accepted` is applied
- **THEN** the evidence reference is updated to `accepted`
- **AND** its version increments exactly once
- **AND** exactly one history event records `pending_review` → `accepted`
- **AND** the event records matching reviewer, rationale, timestamp, and before/after versions
- **AND** the record and event are saved together in the same browser-local workspace snapshot

#### Scenario: An accepted or rejected reference is superseded

- **GIVEN** an evidence reference is in `accepted` or `rejected`
- **WHEN** a valid supersede decision is made with a named reviewer and rationale
- **THEN** exactly one event records the actual prior state → `superseded`
- **AND** the event's before/after versions match the evidence record transition

#### Scenario: An invalid review attempt is rejected

- **GIVEN** a transition is not allowed, a reviewer is missing, a rationale is too short, or the timestamp is invalid
- **WHEN** the review operation is attempted
- **THEN** the domain operation rejects the attempt
- **AND** no history event is created
- **AND** the input evidence record remains unmodified

### Requirement: Display review history without conflating it with current state

The evidence detail view MUST display recorded review events newest-first, link them to their evidence reference, and distinguish the latest current review state from earlier decisions. The history UI MUST NOT provide edit or delete controls for individual events.

#### Scenario: A reviewer opens evidence details

- **GIVEN** one or more history events exist for the evidence reference
- **WHEN** its detail view opens
- **THEN** each event's transition, reviewer, timestamp, rationale, and version change are visible
- **AND** the most recent event is shown first
- **AND** the detail view continues to state that browser-local history is not immutable or independently authenticated

#### Scenario: No history event is available

- **GIVEN** a workspace has no recorded events for an evidence reference
- **WHEN** its detail view opens
- **THEN** the UI says that no transition history is recorded in this workspace snapshot
- **AND** it does not infer a past transition from the current review fields alone

### Requirement: Migrate old browser-local workspaces without inventing past events

The loader MUST accept a valid older workspace snapshot that has no evidence review-history collection, initialize the collection as empty, and preserve existing evidence metadata. It MUST NOT construct historical event records solely by copying the latest `reviewStatus`, `reviewedAt`, `reviewedBy`, or `reviewNote` values.

#### Scenario: A pre-history snapshot is loaded

- **GIVEN** an otherwise-valid browser-local workspace has evidence metadata but no history collection
- **WHEN** the workspace loads
- **THEN** the workspace remains usable with an empty history collection
- **AND** existing evidence records are preserved
- **AND** the UI communicates that historical transitions may not be available

### Requirement: Report broken review-history data

Workspace integrity validation MUST identify duplicate or missing event IDs, missing evidence references, unsupported state values, invalid timestamps, missing reviewer/rationale, and invalid version progression. A history event MUST NOT be treated as proof that the referenced file exists, is genuine, or is authentic.

#### Scenario: An event references a missing evidence record

- **GIVEN** a history event references an evidence ID that does not exist in the workspace
- **WHEN** workspace integrity validation runs
- **THEN** a record-specific integrity issue is returned
- **AND** the issue is distinguishable from a broken link to an operational record
