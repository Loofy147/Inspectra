# Tasks: Evidence Review Decision History

## 1. Domain contract and integrity

- [ ] **1.1** Add a pure event-construction helper that creates one event from the validated prior and updated evidence records; verify required fields, actual prior/new states, and before/after versions with focused domain tests.
- [ ] **1.2** Extend workspace integrity validation for event IDs, state values, timestamps, reviewer/rationale, version progression, and missing evidence references; verify each issue code with positive and negative tests.
- [ ] **1.3** Update seed fixtures with clearly illustrative review events for the existing accepted/rejected sample evidence; verify seed workspace integrity still returns no issues.

## 2. Compatibility and state update

- [ ] **2.1** Extend browser-local snapshot migration to initialize a missing `evidenceReviewEvents` collection without resetting existing evidence records; verify a legacy-shaped snapshot loads with the expected records and an empty history array.
- [ ] **2.2** Update the evidence-review handler to append exactly one event alongside the evidence state/version transition in the same workspace snapshot; verify accepted, rejected and superseded transitions create exactly one event each.
- [ ] **2.3** Verify invalid review attempts leave both the evidence record and history collection unchanged; verify browser-storage failure is surfaced without a success message.

## 3. User-facing history

- [ ] **3.1** Render the read-only evidence review timeline newest-first with state transition, reviewer, timestamp, rationale and version change; verify ordering and field visibility from a seeded and a newly reviewed record.
- [ ] **3.2** Render the empty/migrated-history explanation and browser-local/tamperability limitation; verify it does not infer historical events from the latest review fields and provides no edit/delete controls.

## 4. Documentation and release verification

- [ ] **4.1** Update evidence traceability, core architecture, README and roadmap to define the review-history prototype, migration limitation and separate production acceptance gate; verify all links and descriptions match the implementation.
- [ ] **4.2** Run `npm run check` and `npm test`; verify both exit successfully and the seeded workspace integrity remains clean.
- [ ] **4.3** Inspect the final diff and check GitHub Actions on the exact resulting commit; record the run URL, commit SHA, passed steps and any residual uncertainty.

## Workflow follow-up

- OpenSpec CLI initialization/validation was not run while drafting these files. In an environment with the CLI installed, initialize/update OpenSpec if desired and validate the change before implementation.
- Archive/sync the change only after implementation and verification meet the agreed acceptance gate.
