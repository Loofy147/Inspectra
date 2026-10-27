# Tasks: Evidence Review Decision History

## 1. Domain contract and integrity

- [x] **1.1** Add a pure event-construction helper that creates one event from the validated prior and updated evidence records; verify required fields, actual prior/new states, and before/after versions with focused domain tests.
- [x] **1.2** Extend workspace integrity validation for event IDs, state values, timestamps, reviewer/rationale, version progression, and missing evidence references; verify each issue code with positive and negative tests.
- [x] **1.3** Update seed fixtures with clearly illustrative review events for the existing accepted/rejected sample evidence; verify seed workspace integrity still returns no issues.

## 2. Compatibility and state update

- [x] **2.1** Extend browser-local snapshot migration to initialize a missing `evidenceReviewEvents` collection without resetting existing evidence records; verify a legacy-shaped snapshot loads with the expected records and an empty history array.
- [x] **2.2** Update the evidence-review handler to append exactly one event alongside the evidence state/version transition in the same workspace snapshot; verify accepted, rejected and superseded transitions create exactly one event each.
- [x] **2.3** Verify invalid review attempts leave both the evidence record and history collection unchanged; verify browser-storage failure is surfaced without a success message.

## 3. User-facing history

- [x] **3.1** Render the read-only evidence review timeline newest-first with state transition, reviewer, timestamp, rationale and version change; verify ordering and field visibility from a seeded and a newly reviewed record.
- [x] **3.2** Render the empty/migrated-history explanation and browser-local/tamperability limitation; verify it does not infer historical events from the latest review fields and provides no edit/delete controls.

## 4. Documentation and release verification

- [x] **4.1** Update evidence traceability, core architecture, README and roadmap to define the review-history prototype, migration limitation and separate production acceptance gate; verify all links and descriptions match the implementation.
- [x] **4.2** GitHub Actions ran `npm run check` and `npm test` successfully against the exact implementation commit; record the run URL, commit SHA, passed steps and residual uncertainty.
- [ ] **4.3** Inspect and review the final diff; decide whether to mark this draft ready for review. Do not merge until the review gate is met.

## Workflow follow-up

- OpenSpec CLI validation was not run because CLI availability was not established in this execution environment. The change has been manually reviewed against the documented proposal/spec/design/tasks structure; CLI/schema conformance remains OPEN.
- Do not archive the change until implementation, tests, documentation and the review gate are complete.
