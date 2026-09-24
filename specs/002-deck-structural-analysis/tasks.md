---

description: "Implementation tasks for Deck Structural Analysis"
---

# Tasks: Deck Structural Analysis

**Input**: Design documents from `/specs/002-deck-structural-analysis/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md),
[research.md](./research.md), [data-model.md](./data-model.md),
[library contract](./contracts/deck-structural-analysis.md), and
[quickstart.md](./quickstart.md)

**Tests**: Required. The specification's success criteria require deterministic
unit, adapter-contract, and import-to-analysis acceptance coverage using the
existing Node test runner and deterministic local fixtures.

**Organization**: Tasks are grouped by user story after the shared normalized
card/import-contract foundation is complete.

## Format: `[ID] [P?] [Story] Description`

- **[P]** marks work in a separate file with no incomplete-task dependency.
- **[US#]** maps a task to a user story from the approved specification.

## Phase 1: Setup (Shared Test Support)

**Purpose**: Establish reusable deterministic characteristic-bearing catalog
fixtures without adding a dependency or a new test framework.

- [X] T001 [P] Create typed structural-card catalog fixture builders and representative card records in `tests/fixtures/structural-card-catalog.ts` for use by provider-contract, unit, and integration tests.

---

## Phase 2: Foundational (Normalized Card and Import Contracts)

**Purpose**: Complete the provider-neutral characteristics, safe catalog
compatibility behavior, and import-owned coverage semantics before implementing
any structural calculation.

**⚠️ CRITICAL**: All user-story phases depend on this phase.

- [X] T002 Add failing characteristic-boundary and legacy name-only catalog tests in `tests/contract/card-reference-provider/local-catalog.test.ts`, covering required fields, rejection/no exact-match fallback, and updater replacement of an invalid stored generation.
- [X] T003 Add failing representative source-normalization contract cases in `tests/contract/card-reference-provider/scryfall-bulk-catalog-updater.test.ts` for ordinary and Legendary Creatures, Artifact/Enchantment Creatures, Kindred, land/Artifact Land, split, Adventure, modal spell/land, and land/land multiface cards; assert dynamic top-level types exclude supertypes/subtypes and raw provider structures do not enter domain values.
- [X] T004 Create provider-neutral `CardCharacteristics` types and validation in `src/domain/cards/card-characteristics.ts` without yet changing the `exact-match` result contract; this establishes the shared normalized value before producers and consumers migrate.
- [X] T005 Migrate catalog storage, loading, and source normalization together in `src/adapters/card-reference/local-catalog-store.ts`, `src/adapters/card-reference/local-catalog-loader.ts`, and `src/adapters/card-reference/scryfall-bulk-catalog-updater.ts` so characteristic-bearing records are required, legacy name-only generations are invalid/rebuilt, all existing catalog fixtures in `tests/contract/card-reference-provider/` and `tests/integration/import-commander-deck/` are migrated, and no type-inconsistent name-only producer remains.
- [X] T006 Write propagation tests first in `tests/unit/deck-import/aggregate-content.test.ts` and `tests/integration/import-commander-deck/import-valid-deck.test.ts`, then atomically migrate successful resolution and resolved content in `src/domain/cards/card-reference-provider.ts`, `src/adapters/card-reference/local-catalog-card-reference-provider.ts`, `src/domain/deck-import/import-result.ts`, and `src/domain/deck-import/aggregate-content.ts` so every `exact-match` and `ResolvedDeckContent` has mandatory characteristics while all producers and consumers remain type-consistent.
- [X] T007 Add failing import-domain coverage-helper tests in `tests/unit/deck-import/import-coverage.test.ts` that prove resolved/unresolved/imported quantities and unresolved commander intent derive from semantic flags rather than concrete problem codes.
- [X] T008 Implement mandatory import-problem coverage semantics and the pure helper in `src/domain/deck-import/import-result.ts`, `src/domain/deck-import/import-coverage.ts`, and `src/application/import-commander-deck.ts`; update affected problem fixtures in `tests/unit/deck-import/` and `tests/integration/import-commander-deck/` in the same migration.
- [X] T009 Run targeted foundational validation from `package.json` against `tests/contract/card-reference-provider/`, `tests/unit/deck-import/`, and `tests/integration/import-commander-deck/` with `npm run typecheck` and `npm test` before structural-analysis tasks begin.

**Checkpoint**: A valid updated catalog resolves complete provider-neutral card
characteristics; an old name-only catalog resolves nothing until rebuilt; and
the analyzer can request coverage only through the import domain helper.

---

## Phase 3: User Story 1 - See a Factual Deck Summary After Import (Priority: P1) 🎯 MVP

**Goal**: Produce a deterministic factual summary for a complete normalized
import, including coverage, declared/resolved counts, commander/library counts,
multiple commanders, Commander color identity, and evidence versions.

**Independent Test**: Analyze a complete characteristic-bearing import with
aggregate quantities and one or more commanders; verify the exact summary,
complete color identity, and repeatability without a provider call.

- [X] T010 [P] [US1] Add complete-summary, multiple-commander, and repeatability coverage in `tests/unit/deck-structural-analysis/deck-summary.test.ts` for quantity aggregation, declared/resolved/library/commander counts, color union, and stable result ordering without provider orchestration.
- [X] T011 [US1] Define `StructuralAnalysis` result types and implement the pure summary path in `src/domain/deck-structural-analysis/analyze-deck-structure.ts`, consuming only `ImportResult` and `import-coverage.ts` for coverage, commander/color state, counts, and deterministic evidence ordering.
- [X] T012 [US1] Add import-to-analysis acceptance coverage in `tests/integration/deck-structural-analysis/structural-analysis.test.ts` that chains `importCommanderDeck` with a local characteristic-bearing fixture and verifies the User Story 1 scenarios.

**Checkpoint**: A complete imported deck receives an independently testable,
provider-free factual summary; no legality or evaluative conclusion is present.

---

## Phase 4: User Story 2 - Inspect Structural Composition (Priority: P1)

**Goal**: Add resolved-only land/nonland, overlapping type, alternative-land-face,
and exact mana-value facts to the existing structural result.

**Independent Test**: Analyze a resolved fixture containing quantities,
multi-type cards, normal lands, a nonland spell/land card, nonland commanders,
and distinct high mana values; verify every aggregate and bucket exactly.

- [X] T013 [P] [US2] Add composition and mana-statistic coverage in `tests/unit/deck-structural-analysis/composition-and-mana.test.ts` for overlapping dynamic types, land exclusion, alternative land faces, exact high-value buckets, and unrounded averages from normalized import fixtures.
- [X] T014 [US2] Extend `src/domain/deck-structural-analysis/analyze-deck-structure.ts` with resolved land/nonland counts, type composition, alternative-land-face entries, and exact mana-value total/distribution/available-average calculations using only normalized characteristics.
- [X] T015 [US2] Add direct-analyzer special-card acceptance fixtures in `tests/unit/deck-structural-analysis/composition-and-mana.test.ts` for split, Adventure, variable-cost, hybrid-cost, modal double-faced spell/land, and multi-type cards without exposing provider layout data to the analyzer.

**Checkpoint**: Composition statistics are independently testable, quantity-aware,
resolved-only facts; card types intentionally overlap and presentation grouping
or rounding is absent.

---

## Phase 5: User Story 3 - Understand Incomplete Analysis (Priority: P1)

**Goal**: Make partial coverage and unresolved Commander uncertainty explicit
while retaining useful structural facts for resolved entries.

**Independent Test**: Analyze a partial import with a flagged unresolved
commander and no provider access; verify partial coverage, resolved-only
metrics, incomplete Commander color identity, and no invented commander facts.

- [X] T016 [P] [US3] Add uncertainty and empty-population coverage in `tests/unit/deck-structural-analysis/coverage-and-uncertainty.test.ts` for partial coverage, unresolved commander color status, and zero-nonland total `0`/empty distribution/unavailable average without import orchestration.
- [X] T017 [US3] Extend tagged coverage, Commander color-identity, and average-availability handling in `src/domain/deck-structural-analysis/analyze-deck-structure.ts` so all partial and zero-population states follow the import-owned semantic helper and never infer unresolved characteristics.
- [X] T018 [US3] Add partial-import acceptance tests in `tests/integration/deck-structural-analysis/structural-analysis.test.ts` verifying separate imported/resolved/unresolved quantities, resolved-only characteristic facts, and unresolved commander incompleteness.

**Checkpoint**: Partial analysis is independently testable and visibly bounded;
invalid/malformed input remains import evidence without being fabricated into a
deck-card count.

---

## Phase 6: Public Boundary and Cross-Cutting Validation

**Purpose**: Publish the completed pure operation through the existing library
surface and run the approved validation suite without broadening feature scope.

- [X] T019 Add a public-library smoke test in `tests/integration/deck-structural-analysis/structural-analysis.test.ts` that imports the structural operation from `src/index.ts` and verifies it analyzes a normalized fixture without provider access. This test is intentionally authored before T020 and is expected to fail until T020 exports the structural-analysis operation from `src/index.ts`.
- [X] T020 Export the completed analysis operation and public result types from `src/index.ts` without adding UI, HTTP, persistence, dependencies, legality checks, classifications, strategy/evaluation, recommendations, or AI behavior.
- [X] T021 Run and record the quickstart validation commands from `specs/002-deck-structural-analysis/quickstart.md` against `package.json`: `npm run typecheck` and `npm test`; resolve any failures within the scoped source and test files above.

---

## Dependencies & Execution Order

```text
T001
  └─ T002 and T003 → T004 → T005 → T006 → T007 → T008 → T009
                                                       ├─ US1: T010 → T011 → T012
                                                       ├─ US2: T013 → T014 → T015 (after T011)
                                                       └─ US3: T016 → T017 → T018 (after T011)
All story checkpoints → T019 → T020 → T021
```

### User Story Dependencies

- **US1** is the MVP and starts after the foundational contract/catalog phase.
- **US2** starts after the foundation and US1's shared analyzer result types
  (`T011`); it otherwise has no dependency on US3.
- **US3** starts after the foundation and US1's shared analyzer result types
  (`T011`); it otherwise has no dependency on US2.

## Parallel Opportunities

- After fixture setup, the failing contract tests in `T002` and `T003` may be
  prepared in parallel because they cover separate catalog seams. `T004` then
  establishes the shared value type before the catalog migration in `T005`.
- After the foundational phase, `T010`, `T013`, and `T016` can be authored in
  parallel in separate test files.
- Once `T011` is complete, US2 and US3 implementation/testing streams can run
  in parallel, except for coordinated edits to
  `src/domain/deck-structural-analysis/analyze-deck-structure.ts`.

## Implementation Strategy

### MVP First

1. Complete the characteristic, legacy-catalog, and import-coverage foundation.
2. Complete US1 through `T012` and validate its factual complete-deck summary.
3. Stop for review before adding composition or partial-coverage increments.

### Incremental Delivery

1. US1 delivers a reusable complete deck summary.
2. US2 adds resolved-only composition and exact mana facts.
3. US3 makes incomplete imports and zero-nonland cases explicit.
4. The final phase exposes the finished operation and runs the full validation
   suite.

## Notes

- Every task uses the required checklist format with a sequential ID and exact
  file path.
- Tests are deliberately adjacent to the behavior they validate and should
  fail before their paired implementation task.
- The plan preserves all feature exclusions and adds no transport/UI layer or
  dependency.

---

## Phase 7: Convergence

- [X] T022 Add the missing representative provider-normalization contract fixtures in `tests/contract/card-reference-provider/scryfall-bulk-catalog-updater.test.ts` for ordinary Creature, Enchantment Creature, land, Artifact Land, split, Adventure, and land/land multiface cards; assert their provider-neutral normal types and land-face semantics, and verify raw provider fields remain absent from domain characteristics per T003 and the plan's adapter-boundary decision. (partial)
- [X] T023 Add an updater replacement contract test in `tests/contract/card-reference-provider/scryfall-bulk-catalog-updater.test.ts` showing that an invalid active legacy name-only catalog is replaced by a valid characteristic-bearing generation through the existing updater per T002 and the legacy-catalog policy. (partial)

---

## Phase 8: Convergence

- [X] T024 Add provider-free public-library smoke coverage in `tests/integration/deck-structural-analysis/structural-analysis.test.ts` that imports `analyzeDeckStructure` from `src/index.ts` and analyzes a normalized `ImportResult` fixture directly per T019 and the public-library boundary decision. (partial)
- [X] T025 Expand import-to-analysis acceptance assertions in `tests/integration/deck-structural-analysis/structural-analysis.test.ts` for declared, resolved commander, and resolved library quantities on complete imports; exact imported/resolved/unresolved quantities and resolved-only structural facts on partial imports; and sorted distinct card-data-version evidence per T012, T018, SC-001, SC-005, and FR-015. (partial)
- [X] T026 Add an empty complete-import unit case in `tests/unit/deck-structural-analysis/coverage-and-uncertainty.test.ts` verifying zero coverage/counts, unavailable Commander identity, and zero/empty/unavailable mana facts per the specification edge cases and library totality contract. (partial)
