<!--
Sync Impact Report
- Version change: scaffold → 1.0.0
- Modified principles: none; initial constitution established
- Added sections: Core Principles; Analytical Integrity and Boundaries; Delivery and Verification; Governance
- Removed sections: none
- Follow-up TODOs: none
-->

# ManaLab Constitution

## Core Principles

### I. Deterministic Analytical Core
Core analytical results MUST be deterministic, reproducible, explainable, and
automatically testable whenever reasonably possible. Given the same normalized
inputs, applicable rules, and data version, an analysis MUST produce the same
result. Any deliberate exception MUST be explicit, bounded, and documented.

Rationale: players and maintainers need results they can inspect, repeat, and
trust when evaluating a Commander deck.

### II. Explainability and Traceability
Every analytical finding MUST be traceable to the evidence, metrics,
classifications, rules, and input data that produced it. The system MUST avoid
opaque aggregate scores or conclusions that cannot be meaningfully justified to
a user or reviewer.

Rationale: a useful deck diagnosis explains why it exists, not merely that it
exists.

### III. Evidence Before Recommendation
Recommendations MUST derive from identifiable findings and supporting evidence.
Popularity, arbitrary heuristics, or unexplained model output MUST NOT alone
justify a recommendation. The evidence-to-finding-to-recommendation chain MUST
remain inspectable.

Rationale: actionable advice is credible only when its supporting diagnosis is
clear and relevant to the deck being analyzed.

### IV. Explicit Uncertainty
The system MUST represent unknown, ambiguous, incomplete, conflicting, or
insufficiently supported conclusions. It MUST NOT manufacture confidence,
precision, classifications, or recommendations beyond the available evidence.
Where uncertainty materially affects a result, it MUST be visible in the result
or its explanation.

Rationale: transparent limits are more valuable than misleading certainty in a
domain with incomplete data and context-dependent card roles.

### V. AI Independence
Core analytical correctness MUST NOT depend on generative AI. Generative AI MAY
augment presentation or explanation only when structured analytical results
remain the source of truth and the core analysis functions without it.

Rationale: correctness, reproducibility, and availability of foundational deck
analysis must not depend on probabilistic third-party generation.

### VI. External Provider Isolation
Card-data, deck-import, and other external systems MUST be treated as boundary
adapters. Provider-specific representations, identifiers, availability, and
failure behavior MUST NOT become ManaLab's core domain model or rule logic.
Data crossing a provider boundary MUST be normalized and validated before core
use.

Rationale: ManaLab must preserve a coherent domain model and remain resilient
to provider changes or additional providers.

### VII. Domain Logic Independence
Core domain and analytical logic MUST remain independent of UI, presentation,
transport, persistence, and external-provider concerns. It MUST be possible to
exercise and reason about that logic using domain-level inputs and outputs
without those concerns.

Rationale: separation keeps critical rules testable, explainable, and durable
as interfaces and integrations evolve.

### VIII. Risk-Based Testing
Testing depth MUST reflect the consequence of incorrect behavior. Parsing,
normalization, validation, classification, metrics, analytical rules, and other
domain-critical logic require strong automated tests, including edge cases and
known ambiguity where relevant. Teams MUST NOT optimize for arbitrary coverage
percentages at the expense of meaningful verification.

Rationale: the most consequential analytical paths deserve the clearest and
most durable evidence of correctness.

### IX. Simplicity Before Speculation
Designs MUST use the simplest approach that correctly satisfies current,
accepted requirements. Infrastructure, abstractions, distributed designs, and
future-oriented complexity require a present, documented justification. A
possible future need alone is insufficient justification.

Rationale: unnecessary complexity obscures domain behavior and delays useful
analytical capability.

### X. Requirements Before Implementation Decisions
Feature specifications MUST describe user needs, observable behavior, business
rules, constraints, and acceptance criteria without prematurely prescribing
technologies or architecture. Implementation decisions belong in planning and
MUST be justified by the approved requirements and these principles.

Rationale: separating what is needed from how it is built keeps product choices
testable and leaves implementation options open until evidence warrants them.

## Analytical Integrity and Boundaries

ManaLab MUST distinguish factual data, derived metrics, functional
classifications, findings, and recommendations so that each layer can identify
its inputs and assumptions. Rules, thresholds, and classification policies that
materially affect conclusions MUST be reviewable and versionable. A finding
MUST not present a community preference or external-provider assertion as an
independent ManaLab conclusion without disclosing its source and limitations.

When domain rules or external data cannot support a conclusion, the result MUST
state the limitation or omit the conclusion. New analytical capability MUST
preserve the ability to inspect its evidence and reproduce its result from the
applicable inputs and rule/data versions.

## Delivery and Verification

Before implementation, each feature specification MUST be reviewed against this
constitution for deterministic behavior, evidence and uncertainty handling,
boundary ownership, domain independence, and testable acceptance criteria. A
plan MUST identify how it preserves these principles, including tests
proportionate to the risk and any justified exceptions.

During implementation and review, changes MUST be checked against the approved
specification and plan as well as this constitution. Reviewers MUST reject or
require explicit resolution for opaque conclusions, unsupported
recommendations, hidden uncertainty, leaked provider concerns, coupled core
logic, or unjustified complexity. Any approved exception MUST document its
scope, rationale, risk, and a verification approach.

## Governance

This constitution governs all ManaLab features and supersedes conflicting
project practices. Amendments require a documented proposal that explains the
change, its rationale, affected principles or sections, migration or transition
impact where applicable, and the intended semantic-version increment. An
amendment is effective only after the constitution is updated and its impact is
recorded in the Sync Impact Report.

Constitution versions use semantic versioning: MAJOR for backward-incompatible
governance removals or redefinitions, MINOR for new principles or materially
expanded guidance, and PATCH for clarifications or non-semantic refinements.
The ratification date records the original adoption date; the last-amended date
changes whenever the constitution changes.

Feature specifications, plans, and implementation reviews MUST include a
constitution-compliance check. If a proposed feature cannot comply, the team
MUST either amend the constitution before proceeding or document and obtain an
explicitly approved, bounded exception under the Delivery and Verification
section. The constitution remains technology-agnostic unless a technology
constraint becomes fundamental to a governed requirement and is explicitly
amended here.

**Version**: 1.0.0 | **Ratified**: 2026-09-22 | **Last Amended**: 2026-09-22
