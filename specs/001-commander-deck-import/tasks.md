---

description: "Task list for Commander Deck Import implementation"
---

# Tasks: Commander Deck Import

**Input**: Design documents from `/specs/001-commander-deck-import/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md),
[research.md](./research.md), [data-model.md](./data-model.md), and
[contracts/](./contracts/)

**Tests**: Automated tests are required by the feature specification and
constitution. Write each listed test first and confirm it fails before its
implementation task.

**Organization**: Tasks are grouped by user story after shared setup and
foundational local-catalog work.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the strict TypeScript/Node library and its test layout.

- [X] T001 Initialize TypeScript, Node.js test, typecheck, and package scripts in package.json and tsconfig.json
- [X] T002 Create the planned source and test directories in src/ and tests/
- [X] T003 [P] Create deterministic card, catalog-provenance, and import-text fixtures in tests/fixtures/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish provider-neutral domain contracts and the reusable local
card-catalog lifecycle required by every import story.

**⚠️ CRITICAL**: Complete this phase before user-story work.

- [X] T004 Define provider-neutral card identity, resolution evidence, import result, problem, and CardReferenceProvider types in src/domain/cards/card-identity.ts, src/domain/cards/card-reference-provider.ts, and src/domain/deck-import/import-result.ts
- [X] T005 [P] Write local-catalog loader and exact-resolution contract tests in tests/contract/card-reference-provider/local-catalog.test.ts
- [X] T006 Implement validated catalog data/sidecar provenance loading and deterministic exact-name indexing in src/adapters/card-reference/local-catalog-loader.ts and src/adapters/card-reference/local-catalog-store.ts
- [X] T007 Implement the local-catalog CardReferenceProvider, including no-usable-catalog unavailable outcomes and provenance evidence, in src/adapters/card-reference/local-catalog-card-reference-provider.ts
- [X] T008 [P] Write Bulk Data lifecycle fixture tests for unchanged datasets, newer datasets, failed updates with a usable catalog, and no usable catalog in tests/contract/card-reference-provider/scryfall-bulk-catalog-updater.test.ts
- [X] T009 Implement Scryfall manifest comparison, streamed gzip JSONL candidate ingestion, validation/indexing, and safe replacement in src/adapters/card-reference/scryfall-bulk-catalog-updater.ts
- [X] T010 Implement the catalog update use case that returns lifecycle outcomes without scheduling policy in src/application/update-card-catalog.ts
- [X] T011 Run and fix the foundational catalog/provider contract suite in tests/contract/card-reference-provider/

**Checkpoint**: A validated local catalog can be loaded once, resolve exact names
through the provider port, retain provenance, and remain usable after a failed
update check.

---

## Phase 3: User Story 1 - Import a Deck List (Priority: P1) 🎯 MVP

**Goal**: Convert conventional valid text deck lists into normalized, aggregated,
traceable resolved content using the local catalog.

**Independent Test**: Import quantity-prefixed and name-only entries with
whitespace, duplicates, and set/collector annotations against a local fixture;
verify canonical identity, quantity, and contributing source entries.

### Tests for User Story 1

- [X] T012 [P] [US1] Write parser and normalization fixture tests for quantities, name-only entries, whitespace, blank lines, and set/collector annotations in tests/unit/deck-import/parse-deck-list.test.ts
- [X] T013 [P] [US1] Write aggregation and source-traceability tests for duplicate resolved entries in tests/unit/deck-import/aggregate-content.test.ts

### Implementation for User Story 1

- [X] T014 [US1] Implement line parsing, supported section boundaries, and neutral metadata extraction in src/domain/deck-import/parse-deck-list.ts
- [X] T015 [US1] Implement harmless name normalization and exact-resolution request preparation in src/domain/deck-import/normalize-entry.ts
- [X] T016 [US1] Implement aggregation by canonical identity and commander designation while retaining source entries in src/domain/deck-import/aggregate-content.ts
- [X] T017 [US1] Implement the import use case orchestration against CardReferenceProvider in src/application/import-commander-deck.ts
- [X] T018 [US1] Write the valid-list end-to-end acceptance fixture in tests/integration/import-commander-deck/import-valid-deck.test.ts

**Checkpoint**: A valid deck list is independently importable from the local
catalog with normalized canonical content and full traceability.

---

## Phase 4: User Story 2 - Understand Import Problems (Priority: P1)

**Goal**: Return per-line, explainable problems without preventing valid content
from being imported.

**Independent Test**: Import a fixture containing valid cards plus invalid
quantities, malformed lines, unknown names, ambiguous names, and no usable
catalog; verify valid content remains and every unusable nonblank line has one
traceable problem.

### Tests for User Story 2

- [X] T019 [P] [US2] Write unit tests for invalid quantities, malformed syntax, and unsupported nonblank annotations in tests/unit/deck-import/import-problems.test.ts
- [X] T020 [P] [US2] Write integration fixtures for partial success, unresolved/ambiguous names, and no usable catalog in tests/integration/import-commander-deck/import-problems.test.ts

### Implementation for User Story 2

- [X] T021 [US2] Implement deterministic problem construction and one-problem-per-unusable-entry reconciliation in src/domain/deck-import/import-result.ts
- [X] T022 [US2] Extend import orchestration to combine parse, local-resolution, and unavailable outcomes without suppressing valid entries in src/application/import-commander-deck.ts
- [X] T023 [US2] Verify resolution evidence and original source line/number are retained for every problem in tests/integration/import-commander-deck/import-problems.test.ts

**Checkpoint**: Mixed valid and invalid input is independently importable with
all usable content returned and every unusable nonblank line clearly explained.

---

## Phase 5: User Story 3 - Preserve Commander Intent (Priority: P2)

**Goal**: Preserve explicit Commander intent from supported sections and inline
metadata without treating external categories as ManaLab analysis.

**Independent Test**: Import fixtures using `Commander`/`Commanders` headings,
`[Commander]`/`[Commander{top}]`, and `[Ramp]`/`[Land]` categories; verify only
Commander syntax changes designation and all categories remain source metadata.

### Tests for User Story 3

- [X] T024 [P] [US3] Write section-heading and inline Commander-category parsing tests in tests/unit/deck-import/commander-designation.test.ts
- [X] T025 [P] [US3] Write non-Commander category preservation and non-classification tests in tests/integration/import-commander-deck/import-metadata.test.ts

### Implementation for User Story 3

- [X] T026 [US3] Extend parser state and source entries for Commander sections, non-Commander boundaries, and inline Commander metadata in src/domain/deck-import/parse-deck-list.ts
- [X] T027 [US3] Extend aggregation and import-result commander outcome derivation without inferring legality or roles in src/domain/deck-import/aggregate-content.ts and src/domain/deck-import/import-result.ts
- [X] T028 [US3] Verify Commander-designated unresolved entries and mixed designation contexts in tests/integration/import-commander-deck/import-metadata.test.ts

**Checkpoint**: All supported Commander conventions are preserved while external
categories never become classification, findings, or recommendations.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate public surface, deterministic repeatability, and the
documented end-to-end workflow.

- [X] T029 [P] Export only the import use case and provider-neutral domain contract from src/index.ts
- [X] T030 [P] Add identical-input/identical-catalog-version repeatability coverage in tests/integration/import-commander-deck/import-repeatability.test.ts
- [X] T031 Run the quickstart validation commands and reconcile fixture coverage with specs/001-commander-deck-import/quickstart.md
- [X] T032 Review src/ and tests/ against specs/001-commander-deck-import/contracts/ to confirm no provider DTO, identifier, category classification, or lifecycle concern leaks into domain code

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Starts immediately.
- **Foundational (Phase 2)**: Depends on T001–T003 and blocks all user stories.
- **US1 (Phase 3)**: Depends on T004–T011.
- **US2 (Phase 4)**: Depends on the US1 import orchestration (T017); its tests
  can be prepared after Phase 2.
- **US3 (Phase 5)**: Depends on the US1 parser and aggregation (T014–T017); its
  tests can be prepared after Phase 2.
- **Polish (Phase 6)**: Depends on all desired story phases.

### User Story Completion Order

```text
Setup → Local catalog foundation → US1 (valid import MVP)
                              ├→ US2 (problems and partial success)
                              └→ US3 (Commander intent and metadata)
US2 + US3 → Polish
```

### Parallel Opportunities

- T003 can proceed after T001 alongside directory setup.
- T005 and T008 write independent contract suites after the shared types exist.
- T012/T013, T019/T020, and T024/T025 are independent test files within their
  respective stories.
- Once US1's shared import orchestration is complete, US2 and US3 can proceed
  in parallel because their principal tests and responsibilities are separate.
- T029 and T030 can proceed in parallel after all story behavior is complete.

## Parallel Example: User Story 1

```text
Task: "Write parser and normalization fixtures in tests/unit/deck-import/parse-deck-list.test.ts"
Task: "Write aggregation fixtures in tests/unit/deck-import/aggregate-content.test.ts"
```

## Implementation Strategy

### MVP First

1. Complete Setup and the local-catalog foundation.
2. Complete US1 through T018.
3. Run the US1 independent acceptance fixture against a deterministic local
   catalog; stop and validate before adding error or Commander refinements.

### Incremental Delivery

1. Add US2 to make all invalid or unavailable input explicit without regressing
   valid import behavior.
2. Add US3 to preserve Commander intent and neutral metadata.
3. Complete cross-cutting repeatability and contract-boundary review.

## Notes

- Every task uses the required checkbox, sequential ID, and exact file path.
- `[P]` tasks use distinct files and have no dependency on incomplete sibling
  tasks.
- User-story tasks include `[US1]`, `[US2]`, or `[US3]` labels for traceability.
- No task introduces persistence beyond the required local dataset/metadata,
  a database, a scheduler, a background worker, an HTTP framework, or AI.

---

## Phase 7: Convergence

- [X] T033 Stream gzip JSONL catalog ingestion instead of buffering the full Bulk Data payload in src/adapters/card-reference/scryfall-bulk-catalog-updater.ts per plan: local catalog transport (contradicts)
- [X] T034 Activate catalog data and provenance as one recoverable generation with an atomic active-pointer switch in src/adapters/card-reference/local-catalog-store.ts per plan: safe catalog replacement (partial)
- [X] T035 Compare `jsonl_download_uri` and `compressed_size` alongside dataset ID and timestamp, with fixture coverage, in src/adapters/card-reference/scryfall-bulk-catalog-updater.ts and tests/contract/card-reference-provider/scryfall-bulk-catalog-updater.test.ts per plan: version consistency evidence (partial)
- [X] T036 Classify conventional comments and unsupported non-card annotations before card resolution in src/domain/deck-import/parse-deck-list.ts and tests/unit/deck-import/import-problems.test.ts per Edge Cases (partial)

## Phase 8: Convergence

- [X] T037 Add an explicit empty-input outcome to the import result and acceptance coverage for whitespace-only input per Edge Cases and SC-002 (partial)
- [X] T038 Replace runtime-locale-sensitive card-name and canonical-key normalization with locale-independent normalization and add a determinism regression test per FR-017 and Constitution I (partial)
- [X] T039 Validate persisted catalog record shape, required provenance, and optional local content digest before loading or exposing a local catalog, with corruption fixtures per plan: local catalog transport and data-model: LocalCardCatalog (partial)
- [X] T040 Add deterministic catalog-lifecycle contract coverage for failed acquisition when no usable local catalog exists, asserting the no-usable-catalog outcome per plan testing strategy (partial)

## Phase 9: Convergence

- [X] T041 Use the same locale-independent exact-name normalization for local catalog indexing as import lookup preparation, with cross-boundary regression coverage per FR-017 and Constitution I (partial)
- [X] T042 Reject non-finite or unsafe quantity values before card resolution and aggregation, with a traceable invalid-quantity fixture per FR-002 and FR-010 (partial)
- [X] T043 Validate every streamed Bulk Data card record and catalog replacement candidate before activation, retaining the prior active generation when validation fails, with contract coverage per plan: safe replacement and contracts/card-catalog.md (partial)
- [X] T044 Add deterministic acceptance coverage for ambiguous resolution and commander-designated unresolved entries per SC-002 and US3/AC2 (partial)

## Phase 10: Convergence

- [X] T045 Classify fractional and signed quantity forms with an optional `x` suffix as invalid quantities before resolution, with fixtures per Edge Cases and FR-012 (partial)
- [X] T046 Validate catalog records and provenance within the `loadCatalog()` boundary before constructing an index, with direct-loader corruption coverage per contracts/card-catalog.md (partial)

## Phase 11: Convergence

- [X] T047 Prevent duplicate normalized catalog names from becoming arbitrary exact matches by preserving an ambiguous outcome or rejecting the catalog, with provider-contract coverage per FR-012 and contracts/card-reference-provider.md (partial)
- [X] T048 Add Commander acceptance fixtures for the `Commanders` heading and preserved inline Commander/non-Commander metadata per SC-004 and US3 acceptance scenarios (partial)
