# Inspectra

**Inspectra is being defined as an operational inspection and assurance platform**: a shared place to plan checks, record evidence, track risks and corrective actions, and help managers decide where intervention is needed.

> **Repository status (2026-10-25):** this repository was empty when the documentation baseline was established. The current contents define product direction and evidence requirements; they do not claim that an application, backend, integrations, tests, or production controls already exist.

## Documentation

- [Management metrics and product expansion plan](docs/management-measurement-and-expansion-plan.md) — KPI definitions, data requirements, recommended management modules, target sectors, and safeguards against misleading metrics.
- [Implementation roadmap and acceptance checklist](docs/roadmap.md) — staged work, verification gates, and definition of done.

## Product principles

1. **Evidence before score.** Every KPI must expose its formula, denominator, period, data source, freshness, and limitations.
2. **Action before decoration.** A metric should help someone identify a record, assign an owner, decide what to do, and verify closure.
3. **Lead and lag together.** Track prevention activities and outcomes; do not use incident counts or any other single metric as a proxy for overall safety.
4. **No silent missing data.** Unknown, stale, unconfigured, incomplete, and zero are different states.
5. **One core, configurable domains.** Safety, quality, compliance, facilities, assets, contractors, and environmental workflows should reuse common records and permissions rather than become disconnected product forks.
6. **Honest operating status.** Distinguish mock/sample data from live records, local storage from shared persistence, and event history from an immutable audit trail.

## Research basis

The plan draws on published guidance including ISO 45004:2024 on occupational health and safety performance evaluation, OSHA guidance on leading indicators and hazard identification, ISO 19011:2026 on auditing management systems, ISO 31000:2018 on risk management, ISO 37301:2021 on compliance management, ISO 55001:2024 on asset management, ISO 14001:2026 on environmental management, and the ISO 9001:2026 quality management edition. See the source list in the plan.

These references inform product design; they do **not** imply Inspectra is certified, legally compliant in any jurisdiction, or a substitute for a competent compliance professional.
