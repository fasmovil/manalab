# Implementation Plan: Commander Deck Import

**Branch**: `001-commander-deck-import` | **Date**: 2026-09-22 | **Spec**: [spec.md](./spec.md)

**Input**: Approved Commander Deck Import feature specification.

## Summary

Build a small TypeScript library that converts pasted Commander deck-list text
into a deterministic, traceable `ImportResult`. Parse lines and neutral metadata,
normalize valid entries, resolve exact card names through a provider-neutral
port backed by a reusable local card catalog, then aggregate resolved content
and independently report every import problem. Scryfall is the initial bulk-data
source, but its representations do not cross into the ManaLab domain model.

The feature produces no analysis, functional classifications, recommendations,
persistence, UI, or transport interface. It exposes a domain-level use case that
later interfaces may call.

## Technical Context

**Language/Version**: TypeScript 5.x with strict type checking; Node.js 24 LTS

**Primary Dependencies**: Node.js standard library (`fetch`, filesystem,
compression support, and `node:test`); TypeScript compiler as a development
dependency; no runtime SDK

**Storage**: Gzipped JSONL bulk dataset, sidecar provenance metadata, and
derived local name index; import results remain transient

**Testing**: Node.js built-in test runner with deterministic unit, contract, and
integration-style fixture tests

**Target Platform**: Node.js 24 LTS process, initially consumed as a library

**Project Type**: Single-project domain library

**Performance Goals**: No unsubstantiated latency target. Automated acceptance
fixtures verify correct, deterministic results for every supported input form.

**Constraints**: No persistence, authentication, UI, HTTP application API,
distributed services, AI, scoring, classification, or advanced Commander
legality validation. Card resolution uses exact normalized names only; an
unavailable or absent local catalog yields traceable unresolved results.

**Scale/Scope**: One pasted Commander deck list per invocation. The provider port
resolves from one loaded local index, so imports perform no remote lookup or
bulk download. The updater discovers `oracle_cards` with Scryfall Bulk Data
metadata, streams the gzipped JSONL payload from `jsonl_download_uri`, and
records `id`, `updated_at`, `jsonl_download_uri`, and `compressed_size` as
adapter-side provenance. Catalog checks/updates are a separate, caller-invoked
lifecycle operation; no scheduling policy is selected.

## Constitution Check

### Pre-Design Gate

| Constitution requirement | Plan response | Gate |
|---|---|---|
| Deterministic analytical core | Parsing, normalization, aggregation, and problem construction are pure; card-data version is kept in evidence. | Pass |
| Explainability and traceability | Every output and problem retains line location, raw text, interpretation, and resolution evidence. | Pass |
| Explicit uncertainty | Missing, malformed, ambiguous, and unavailable outcomes remain explicit problems; no fuzzy resolution. | Pass |
| AI independence | No generative AI is included. | Pass |
| External provider isolation | `CardReferenceProvider` isolates Scryfall manifest, bulk-file, identifiers, and lifecycle concerns. | Pass |
| Domain logic independence | Core logic depends on domain types and a port, not UI, transport, persistence, or provider modules. | Pass |
| Risk-based testing | Fixtures cover parser, normalizer, aggregation, provider mapping, partial success, Commander intent, and error paths. | Pass |
| Simplicity before speculation | Local files plus sidecar metadata and in-memory index; no database, cache service, worker, or scheduler. | Pass |
| Requirements before implementation decisions | Technology choices are implementation choices and do not alter approved behavior. | Pass |

### Post-Design Gate

Pass. The Phase 1 data model and contracts preserve provider-neutral domain
identity, traceable outcomes, explicit uncertainty, and testable boundaries.
No constitution exception or complexity justification is required.

## Project Structure

### Documentation (this feature)

```text
specs/001-commander-deck-import/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── deck-import.md
│   ├── card-reference-provider.md
│   └── card-catalog.md
└── tasks.md                 # Created later by $speckit-tasks
```

### Source Code (repository root)

```text
src/
├── index.ts
├── application/
│   ├── import-commander-deck.ts
│   └── update-card-catalog.ts
├── domain/
│   ├── cards/
│   │   ├── card-identity.ts
│   │   └── card-reference-provider.ts
│   └── deck-import/
│       ├── import-result.ts
│       ├── parse-deck-list.ts
│       ├── normalize-entry.ts
│       └── aggregate-content.ts
└── adapters/
    └── card-reference/
        ├── local-catalog-card-reference-provider.ts
        ├── local-catalog-loader.ts
        ├── local-catalog-store.ts
        └── scryfall-bulk-catalog-updater.ts

tests/
├── unit/deck-import/
├── contract/card-reference-provider/
└── integration/import-commander-deck/
```

**Structure Decision**: One library project. `domain` contains pure import
behavior and the provider port; `application` coordinates import separately
from catalog maintenance; `adapters` contains the local catalog and the only
Scryfall-specific code. Tests mirror those seams. These are planned directories,
not implementation work performed by this plan.

## Complexity Tracking

No constitution violations or additional complexity require justification.
