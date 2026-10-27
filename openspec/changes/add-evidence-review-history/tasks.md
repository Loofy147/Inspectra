# Tasks: Evidence Review Decision History

## 1. Domain contract and integrity

- [x] **1.1** Add a pure event-construction helper that creates one event from the validated prior and updated evidence records; verify required fields, actual prior/new states, and before/after versions with focused domain tests.
- [x] **1.2** Extend workspace integrity validation for event IDs, state values, timestamps, reviewer/rationale, version progression, and missing evidence references; verify each issue code with positive and negative tests.
- [x] **1.3** Update seed fixtures with clearly illustrative review events for the existing accepted/rejected sample evidence; verify seed workspace integrity still returns no issues.

## 2. Compatibility and state update

- [x] **2.1** Extend browser-local snapshot migration to initialize a missing `evidenceReviewEvents` collection without resetting existing evidence records; verify a legacy-shaped snapshot loads with the expected records and an empty history array.
- [x] **2.2** Update the evidence-review handler to append exactly one event alongside the evidence state/version transition in the same workspace snapshot; direct domain tests cover accepted, rejected and superseded transitions.
- [x] **2.3** Verify invalid domain review attempts leave evidence and review history unchanged; this is covered by a pure-operation regression test.
- [ ] **2.4** Verify the browser-storage failure path in a live browser and confirm the UI reports the save failure instead of the success message.

## 3. User-facing history

- [ ] **3.1** Verify the rendered history in a live browser with seeded and newly reviewed records, including ordering, field visibility and mobile layout; source inspection confirms newest-first sorting, but browser rendering has not been exercised.
- [x] **3.2** Implement and inspect the empty/migrated-history explanation and browser-local/tamperability limitation; unit tests verify migration does not infer history from latest review fields, and the history markup provides no edit/delete controls.

## 4. Documentation and release verification

- [x] **4.1** Update evidence traceability, core architecture, README and roadmap to define the review-history prototype, migration limitation and separate production acceptance gate; verify all links and descriptions match the implementation.
- [x] **4.2** Verified by [GitHub Actions run 40495059091](https://github.com/Loofy147/Inspectra/actions/runs/40495059091) on implementation commit `06acbb2b7b83b423cedcc8abae0ae88f37eb9a06`: syntax check passed; 31 tests passed, 0 failed.
- [x] **4.3** Inspect source and implementation diff against the feature contract; remaining live-browser, CLI validation and human-review limitations stay explicitly open. Do not merge until the review gate is met.
- [x] **4.4** Add a cross-cutting production readiness checklist and link it from README, roadmap, architecture, evidence and security documentation; read back changed repository files and preserve the NOT PRODUCTION-READY status.

## Workflow follow-up

- OpenSpec CLI validation was not run because CLI availability was not established in this execution environment. The change has been manually reviewed against the documented proposal/spec/design/tasks structure; CLI/schema conformance remains OPEN.
- Do not archive the change until implementation, tests, documentation and the review gate are complete.
- Production readiness is a separate release gate; use `docs/production-readiness-checklist.md`. The checklist describes target controls and is not itself evidence that they pass.
