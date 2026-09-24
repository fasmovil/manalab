# Implementation Plan: Deck Structural Analysis

**Branch**: `002-deck-structural-analysis` | **Date**: 2026-09-23 | **Spec**: [spec.md](./spec.md)

**Input**: Approved Deck Structural Analysis specification and its 2026-09-23 clarifications.

## Summary

Add a pure, deterministic structural-analysis operation that accepts the existing normalized `ImportResult` and produces traceable factual deck metrics. It neither parses raw text nor resolves cards nor accesses a provider. The current import model supplies aggregated resolved quantities, commander designation, source entries, unresolved resolution problems, and per-entry data-version evidence. It does not retain card characteristics needed by this feature. The smallest coherent extension adds provider-neutral card characteristics to successful resolutions and carries them into resolved deck content; the local catalog adapter normalizes and validates those characteristics while keeping Scryfall shapes adapter-only.

The analyzer derives imported/resolved/unresolved coverage through an
import-owned coverage helper, then calculates commander and library counts,
Commander color-identity completeness, overlapping top-level type quantities,
nonland cards with alternative land faces, and exact resolved-nonland mana
statistics. No functional, strategic, legality, evaluative, recommendation, or
AI capability is introduced.

## Technical Context

**Language/Version**: TypeScript 5.x, strict mode; Node.js 24 LTS; ES modules

**Primary Dependencies**: Node.js standard library and TypeScript only; no new runtime or development dependencies

**Storage**: Existing local card catalog gains normalized structural characteristics alongside its existing provenance; structural analyses remain transient values

**Testing**: Node.js built-in `node:test` and `node:assert/strict`; `npm test` builds then executes compiled tests; `npm run typecheck` performs strict type checking

**Target Platform**: Node.js 24 LTS domain library

**Project Type**: Single-project library; there is currently no frontend, backend, HTTP route, or serialization layer

**Performance Goals**: Deterministic, linear traversal of normalized resolved content and problems; automated acceptance fixtures verify all required facts. No unsubstantiated latency target is introduced.

**Constraints**: Analyze only `ImportResult`; make no provider call, network
request, catalog update, parse, repair, persistence, or presentation decision.
Preserve exact numeric mana values and use no rounding/grouping. Characteristic
statistics are resolved-only when coverage is partial. A legacy name-only
catalog is invalid, never an exact-resolution fallback, and must be refreshed
through the existing updater. No external dependency, UI, transport,
evaluation, classification, legality validation, recommendation, or AI work is
in scope.

**Scale/Scope**: One normalized Commander import result per invocation. The analyzer is a focused reusable domain operation designed for later consumers, not a general functional or strategic analysis framework.

## Constitution Check

### Pre-Design Gate

| Constitution requirement | Plan response | Gate |
|---|---|---|
| Deterministic analytical core | The analyzer is pure over `ImportResult`; stable ordering, exact quantities, and preserved card-data versions make results repeatable. | Pass |
| Explainability and traceability | Coverage, aggregates, commander completeness, and distinct input card-data versions are exposed from normalized evidence. | Pass |
| Explicit uncertainty | Partial coverage and unresolved commander effects are explicit; zero nonlands produce an unavailable average, never a fabricated zero. | Pass |
| AI independence | No generative AI is used. | Pass |
| External provider isolation | Adapter code maps provider records to a ManaLab-owned `CardCharacteristics` value; analyzer never observes Scryfall DTOs. | Pass |
| Domain logic independence | Structural logic is a pure domain module with no catalog, transport, UI, or persistence dependency. | Pass |
| Risk-based testing | Unit, provider-contract, and import-to-analysis integration tests cover calculations, special forms, partial results, and evidence. | Pass |
| Simplicity before speculation | One characteristic extension and one analyzer; no new service, database, provider port, or dependency. | Pass |
| Requirements before implementation decisions | The design follows the approved factual scope and preserves every stated exclusion. | Pass |

### Post-Design Gate

Pass. The Phase 1 model and library contract retain a provider-neutral boundary, make uncertainty explicit, and keep the analysis independently testable. No constitution exception or complexity justification is required.

## Project Structure

### Documentation (this feature)

```text
specs/002-deck-structural-analysis/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── deck-structural-analysis.md
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
│   │   ├── card-characteristics.ts       # New provider-neutral value
│   │   ├── card-identity.ts
│   │   └── card-reference-provider.ts    # Exact resolution carries characteristics
│   ├── deck-import/
│   │   ├── aggregate-content.ts           # Retains characteristics
│   │   ├── import-coverage.ts             # New import-owned coverage meaning
│   │   └── import-result.ts               # Resolved content contract extension
│   └── deck-structural-analysis/
│       └── analyze-deck-structure.ts      # New pure analyzer and result types
└── adapters/
    └── card-reference/
        ├── local-catalog-card-reference-provider.ts
        ├── local-catalog-loader.ts
        ├── local-catalog-store.ts          # Stores normalized characteristics
        └── scryfall-bulk-catalog-updater.ts # Adapter-only source mapping

tests/
├── contract/card-reference-provider/
│   └── local-catalog.test.ts               # Characteristics, legacy catalog, and type mapping fixtures
├── integration/
│   └── deck-structural-analysis/           # New import-to-analysis fixtures
└── unit/
    └── deck-structural-analysis/           # New pure calculation tests
```

**Structure Decision**: Extend the existing single-library architecture. The current project has no frontend/backend/API boundary to reuse or extend; the public library export in `src/index.ts` is the applicable convention. Export the new analysis operation there, without inventing a transport layer. Keep catalog transformation in the existing adapter and all derived calculations in the new domain module.

## Architecture Decisions Requiring Review

1. **Approved contract extension**: exact resolutions and `ResolvedDeckContent` gain mandatory provider-neutral characteristics described in [data-model.md](./data-model.md). This is required because the current name-only catalog cannot compute structural characteristics.
2. **Average representation**: represent the result as an explicit tagged available/unavailable value rather than a nullable numeric zero. This makes the zero-resolved-nonland case unambiguous to later consumers.
3. **Import-owned coverage semantics**: do not widen `ImportResult` with a
   redundant counter and do not let the analyzer inspect `ImportProblem` codes.
   Extend each import problem with an import-owned boolean stating whether its
   valid intended quantity contributes to imported-card coverage, and centralize
   aggregation in `deck-import/import-coverage.ts`. New problem construction
   must explicitly set that semantic field; the analyzer consumes only the
   helper result. Invalid/malformed input remains a traceable problem but does
   not contribute a card quantity.
4. **Color-identity completeness**: expose a tagged complete/incomplete/unavailable result. An unresolved commander makes color identity incomplete even when resolved commanders supply a useful partial color set.
5. **Legacy catalog policy**: a catalog record missing mandatory
   `CardCharacteristics` is invalid at the loader/store boundary. It supplies
   no exact match or synthesized defaults; the existing updater rebuilds it
   from current source data. Contract tests cover invalidation and refresh.
6. **Top-level type normalization**: the adapter—not the analyzer—derives
   dynamic normal top-level types from provider type, layout, and face data,
   excluding supertypes/subtypes. Adapter contract fixtures cover ordinary,
   multi-type, Kindred, land, and specified special-card cases without exposing
   raw provider fields to the domain.

## Complexity Tracking

No constitution violations or additional complexity require justification.
