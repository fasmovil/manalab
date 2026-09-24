# Implementation Plan: Card Functional Role Classification

**Branch**: `003-card-role-classification` | **Date**: 2026-09-24 | **Spec**: [spec.md](./spec.md)

**Input**: Approved Card Functional Role Classification specification.

## Summary

Add a deterministic, explainable per-card library operation that classifies the
intrinsic capabilities of already resolved cards into the 14-role ManaLab
taxonomy. The operation consumes provider-neutral normalized card behavior
carried by the existing import result, examines all meaningful faces, modes,
and costs, and returns confirmed roles plus scoped Unknown or Ambiguous issues
without inferring deck strategy or querying a provider. It extends the existing
card-information boundary because the current normalized characteristics retain
only structural facts, not gameplay behavior.

## Technical Context

**Language/Version**: TypeScript 5.x, strict mode; Node.js 24 LTS; ES modules

**Primary Dependencies**: Node.js standard library and TypeScript only; no new runtime or development dependencies

**Storage**: Existing local card catalog gains provider-neutral intrinsic behavior information; classifications remain transient values

**Testing**: Node.js built-in `node:test` and `node:assert/strict`; `npm test` builds then executes compiled tests; `npm run typecheck` performs strict type checking

**Target Platform**: Node.js 24 LTS domain library

**Project Type**: Single-project library; there is no frontend, backend, HTTP route, or serialization layer

**Performance Goals**: Deterministic classification of one normalized resolved-card entry at a time; correctness, uncertainty, and explainability are verified through automated fixtures. No unsubstantiated latency target is introduced.

**Constraints**: Consume only already-resolved normalized card content; no provider calls, network requests, catalog updates, parsing, deck-context inference, persistence, presentation, recommendation, legality, or AI classification. Consider only Taxonomy v1 and the bounded Magic semantics it needs. Preserve missing behavior as explicit uncertainty rather than synthesizing capabilities.

**Scale/Scope**: One reusable card-level classification operation per narrow
intrinsic-card input projected from a resolved entry. Later deck-level
consumers may aggregate outputs, but aggregation and strategic interpretation
are not introduced here.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Gate

| Constitution requirement | Plan response | Gate |
|---|---|---|
| Deterministic analytical core | A pure domain operation consumes normalized card behavior and applies a bounded, reviewable Taxonomy v1 policy. Stable role and issue ordering produces repeatable outputs. | Pass |
| Explainability and traceability | Every confirmed role and each Unknown/Ambiguous issue retains a human-readable explanation tied to normalized behavior or explicitly missing information. | Pass |
| Explicit uncertainty | Uncertainty is scoped to a possible role or behavior; confirmed roles remain present and an empty role set is unclassified only when assessment was sufficient. | Pass |
| AI independence | No generative AI, probabilistic classifier, or remote classification service is used. | Pass |
| External provider isolation | The catalog adapter normalizes source rules, keyword, and face facts into ManaLab-owned behavior data. The classifier never receives a provider DTO. | Pass |
| Domain logic independence | Classification is a pure domain module with no catalog, transport, UI, persistence, or provider dependency. | Pass |
| Risk-based testing | Unit, adapter-contract, and import-to-classification tests cover each taxonomy role, multi-role cards, directions, faces, semantics, uncertainty, and determinism. | Pass |
| Simplicity before speculation | One normalized behavior extension and one classifier are added. There is no general Magic rules engine, tag-service integration, transport layer, or persistence model. | Pass |
| Requirements before implementation decisions | The design implements the approved semantics and exclusions without changing taxonomy, product scope, or classification-rule versioning requirements. | Pass |

### Post-Design Gate

Pass. The Phase 1 model keeps provider data outside the domain, represents
partial behavior truthfully, gives downstream consumers a deterministic library
contract, and requires evidence-focused testing. No constitution exception or
complexity justification is required.

## Project Structure

### Documentation (this feature)

```text
specs/003-card-role-classification/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── functional-role-classification.md
└── tasks.md                 # Created later by $speckit-tasks
```

### Source Code (repository root)
```text
src/
├── index.ts
├── application/
│   └── import-commander-deck.ts
├── domain/
│   ├── cards/
│   │   ├── card-characteristics.ts          # Extended with normalized behavior
│   │   └── card-reference-provider.ts       # Carries behavior on exact matches
│   ├── deck-import/
│   │   └── import-result.ts                  # Retains behavior on resolved content
│   ├── deck-structural-analysis/
│   └── card-role-classification/
│       └── classify-card-functional-roles.ts # New pure classifier, intrinsic input, and result types
└── adapters/
    └── card-reference/
        ├── local-catalog-store.ts            # Persists normalized behavior state
        └── scryfall-bulk-catalog-updater.ts  # Adapter-only behavior mapping

tests/
├── fixtures/
│   └── structural-card-catalog.ts             # Extended deterministic catalog fixtures
├── contract/card-reference-provider/
│   └── local-catalog.test.ts                  # Behavior normalization boundary
├── integration/card-role-classification/
│   └── functional-role-classification.test.ts # Import-to-classification path
└── unit/card-role-classification/
    └── classify-card-functional-roles.test.ts # Pure taxonomy and uncertainty rules
```

**Structure Decision**: Extend the current single-library architecture. Reuse
the established provider-neutral characteristics flow from feature 002, add a
sibling pure domain module for card roles, and export the library operation from
`src/index.ts`. Do not create an HTTP/UI interface or a deck-level aggregation
module.

## Complexity Tracking

No constitution violations or additional complexity require justification.
