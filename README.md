# Inspectra — Operational Assurance

Inspectra is a sector-neutral foundation for planning inspections, managing findings and corrective actions, tracking risks and controls, and helping managers understand operational states from traceable records.

## Current repository state

The repository contains a browser-run core interface and domain-rule tests. The current workspace uses illustrative demo data stored in the current browser. It is not connected to a shared database, authentication provider, file repository, or live operating systems. Activity shown in this mode is not an immutable audit trail.

Do not use the current demo workspace as the system of record for safety-critical or regulated operations.

## Run locally

Requires Node.js 22 or later. No third-party runtime packages are required for the current shell.

- **npm run dev** — start the local static server at http://localhost:4173.
- **npm test** — run domain-rule tests using Node's built-in test runner.
- **npm run check** — run JavaScript syntax checks.

## Find records quickly

- Press **Ctrl+K** on Windows/Linux or **Cmd+K** on macOS to focus workspace search.
- Search across inspections, findings, corrective actions, audits, management reviews, sites, assets, risks, people, suppliers/contractors, and requirements.
- Search matches record IDs and available text fields, including the linked site name where recorded. Open supported records directly from the results.
- Press **Escape** to clear/leave the active search view.

Search only covers the current browser-local demo dataset. It does not search other users' devices, external systems, or a shared production database.

## Record integrity checks

Open **System health** to inspect the current workspace for missing required values, malformed dates, duplicate IDs, broken links, site/asset mismatches, and inconsistent finding/action or review/follow-up relationships. Each reported issue includes a record identifier, a short explanation, and a suggested correction.

New inspections, findings, audits, management reviews, and review follow-ups are checked before they are saved. Date inputs are also checked against the actual calendar, so impossible dates such as February 31 are rejected.

These checks protect the structure of the current browser-local demo; they do not validate operational truth, legal compliance, or server-side security. A production system still needs authoritative database constraints and trusted backend validation.

## Shared core workspaces

- Overview and measurement
- Work queue
- Inspections
- Findings and corrective actions
- Risk and controls
- Sites and assets
- Audit and compliance
- People and suppliers
- Reports
- System health

These are domain-neutral workflows, not sector-specific compliance packs. Industry templates and jurisdiction-specific rules should be added only after the reusable core has suitable data contracts, authorization, evidence handling, and verification.

## Product principles

1. Evidence before score: each KPI needs an explicit formula, denominator, period, provenance, freshness, and limitations.
2. Action before decoration: exceptions should link to records, owners, next actions, and verification.
3. State is not outcome: workflow status, checklist result, severity, risk, evidence state, and authorization state are separate concepts.
4. Missing is not zero: unknown, stale, unconfigured, incomplete, unavailable, and zero are distinct states.
5. Reuse the core: sector capabilities should configure shared entities and workflows rather than fork the product.
6. Honest operating status: demo/local behavior must never be described as live, shared, independently verified, or production-ready.

## Documentation

- [Management measurement and product expansion plan](docs/management-measurement-and-expansion-plan.md)
- [Core architecture](docs/core-architecture.md)
- [Security and assurance model](docs/security-and-assurance-model.md)
- [Implementation roadmap](docs/roadmap.md)

## Research anchors

Product measurements draw on ISO 45004:2024 performance-evaluation guidance and OSHA guidance on leading indicators and hazard identification. Security verification planning references OWASP ASVS 5.0.0. These references guide design and testing; they do not establish certification or legal compliance.

- [ISO 45004:2024](https://www.iso.org/standard/64285.html)
- [OSHA leading indicators](https://www.osha.gov/leading-indicators)
- [OSHA hazard identification and assessment](https://www.osha.gov/safety-management/hazard-Identification/)
- [OWASP ASVS 5.0.0](https://asvs.owasp.org/)
