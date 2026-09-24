---
description: "Dependency-ordered implementation tasks for Card Functional Role Classification"
---

# Tasks: Card Functional Role Classification

**Input**: Design documents from `/specs/003-card-role-classification/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), and [library contract](./contracts/functional-role-classification.md)

**Tests**: Required. The approved specification defines automated acceptance and repeatability outcomes; write focused tests before the corresponding implementation.

**Organization**: Tasks are grouped by user story. Foundational work supplies the provider-neutral intrinsic-card boundary required by every story.

## Phase 1: Setup (Shared Fixtures)

**Purpose**: Establish deterministic, provider-neutral fixtures for role tests.

- [ ] T001 Create reusable intrinsic-behavior and resolved-card fixture builders in tests/fixtures/functional-role-card-catalog.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the narrow intrinsic-card input and catalog behavior boundary required before any classification can be implemented.

**⚠️ CRITICAL**: Complete this phase before user-story work.

- [ ] T002 Add adapter contract tests for intrinsic-behavior persistence, per-face availability, legacy-catalog incompatibility, and current-source unavailable behavior in tests/contract/card-reference-provider/local-catalog.test.ts
- [ ] T003 Define provider-neutral intrinsic-behavior types and the narrow IntrinsicCard domain type in src/domain/cards/card-characteristics.ts
- [ ] T004 Carry intrinsic behavior through exact card resolution and resolved import content in src/domain/cards/card-reference-provider.ts and src/domain/deck-import/import-result.ts
- [ ] T005 Implement the explicit ResolvedDeckContent-to-IntrinsicCard projection without widening the classifier input in src/domain/card-role-classification/intrinsic-card.ts
- [ ] T006 Enforce the intrinsic-behavior catalog schema and reject pre-schema legacy catalogs rather than synthesizing unavailable behavior in src/adapters/card-reference/local-catalog-store.ts and src/adapters/card-reference/local-catalog-loader.ts
- [ ] T007 Normalize provider-specific rules, keywords, faces, availability, and observable Magic facts into provider-neutral behavior without assigning ManaLab roles in src/adapters/card-reference/scryfall-bulk-catalog-updater.ts
- [ ] T008 Extend deterministic local catalog fixtures with available, unavailable, multi-face, and legacy-schema behavior cases in tests/fixtures/structural-card-catalog.ts

**Checkpoint**: The import/catalog boundary can provide a valid narrow `IntrinsicCard`, preserves genuine current-data gaps, rejects stale schemas, and does not expose provider DTOs or deck-context fields to the future classifier.

---

## Phase 3: User Story 1 - See a card's intrinsic capabilities (Priority: P1) 🎯 MVP

**Goal**: Classify a resolved card's direct intrinsic capabilities using the approved taxonomy, with a valid unclassified result and no deck-context input.

**Independent Test**: Classify Sol Ring, Swords to Plowshares, and a sufficiently understood no-role card through the exported library operation; verify expected roles, explicit unclassified output, and no dependence on quantity or commander designation.

### Tests for User Story 1

- [ ] T009 [P] [US1] Add unit acceptance tests for direct Mana Acceleration, Card Draw, Card Selection, Temporary Card Access, Tutor, Spot Removal, and explicit unclassified outcomes in tests/unit/card-role-classification/basic-role-classification.test.ts
- [ ] T010 [P] [US1] Add integration tests proving classification receives the narrow IntrinsicCard projection rather than ResolvedDeckContent deck fields in tests/integration/card-role-classification/intrinsic-card-boundary.test.ts

### Implementation for User Story 1

- [ ] T011 [US1] Define FunctionalRole, role-conclusion, issue, and FunctionalRoleClassification domain result types with canonical taxonomy ordering in src/domain/card-role-classification/classify-card-functional-roles.ts
- [ ] T012 [US1] Implement pure direct-role classification and explicit unclassified behavior over IntrinsicCard in src/domain/card-role-classification/classify-card-functional-roles.ts
- [ ] T013 [US1] Export classifyCardFunctionalRoles and its public result/input types from src/index.ts

**Checkpoint**: A consumer can classify straightforward resolved cards through the public library API and receive only intrinsic, provider-neutral results.

---

## Phase 4: User Story 2 - See every relevant role on a multi-purpose card (Priority: P1)

**Goal**: Return all supported roles from meaningful modes, alternate costs, and faces while respecting effect direction and the bounded Magic semantics.

**Independent Test**: Classify Ashnod's Altar, Faithless Looting, Cyclonic Rift, and Reckless Impulse; verify each complete role set exactly. Verify Path to Exile and Beast Within do not inherit benefits granted to another controller.

### Tests for User Story 2

- [ ] T014 [P] [US2] Add multi-role and effect-direction acceptance tests for Ashnod's Altar, Faithless Looting, Path to Exile, Beast Within, Rampant Growth, Nature's Lore, and Entomb in tests/unit/card-role-classification/multi-role-and-direction.test.ts
- [ ] T015 [P] [US2] Add mode, alternate-cost, split, Adventure, and multi-faced-card acceptance tests including Cyclonic Rift and Reckless Impulse in tests/unit/card-role-classification/modes-and-faces.test.ts
- [ ] T016 [P] [US2] Add bounded Magic-semantics acceptance tests for Treasure, Clue, investigate, conditional damage, Countermagic, Protection, Graveyard Recursion, Token Generation, and Discard Enabler in tests/unit/card-role-classification/taxonomy-semantics.test.ts

### Implementation for User Story 2

- [ ] T017 [US2] Extend the bounded domain policy for additive roles, controller/effect direction, and the remaining Taxonomy v1 role semantics in src/domain/card-role-classification/classify-card-functional-roles.ts
- [ ] T018 [US2] Extend the bounded domain policy to evaluate all available behavior sources, modes, alternate costs, faces, and taxonomy-relevant observable Magic facts exactly once per card in src/domain/card-role-classification/classify-card-functional-roles.ts
- [ ] T019 [US2] Add import-to-classification integration coverage for multi-role and alternate-face normalized behavior in tests/integration/card-role-classification/multi-role-classification.test.ts

**Checkpoint**: Multi-purpose cards expose their complete intrinsic Taxonomy v1 role sets without primary-role selection, face duplication, or effect-direction errors.

---

## Phase 5: User Story 3 - Understand uncertainty and evidence (Priority: P1)

**Goal**: Preserve confirmed roles while making missing and policy-indeterminate behavior understandable, scoped, and repeatable.

**Independent Test**: Classify cards with available confirmed behavior plus a missing source, an indeterminate available behavior, and a fully understood no-role behavior; verify localized Unknown/Ambiguous explanations and deep-equal repeatability in different deck contexts.

### Tests for User Story 3

- [ ] T020 [P] [US3] Add unit acceptance tests for scoped Unknown, scoped Ambiguous, retained confirmed roles, and human-readable explanations in tests/unit/card-role-classification/uncertainty-and-explanations.test.ts
- [ ] T021 [P] [US3] Add repeatability and deck-context-independence integration tests for roles, issues, and explanations in tests/integration/card-role-classification/repeatability.test.ts

### Implementation for User Story 3

- [ ] T022 [US3] Implement scoped Unknown and Ambiguous issue construction, partial classification retention, and domain-owned explanations in src/domain/card-role-classification/classify-card-functional-roles.ts
- [ ] T023 [US3] Implement stable ordering for confirmed roles, issues, and explanations so equivalent IntrinsicCard inputs produce deeply equal results in src/domain/card-role-classification/classify-card-functional-roles.ts

**Checkpoint**: Consumers can see which roles are confirmed and why another aspect is unknown or ambiguous, without a global card status or fabricated classification.

---

## Phase 6: Polish & Cross-Cutting Validation

**Purpose**: Verify the complete public boundary and all approved exclusions.

- [ ] T024 Add exported-library contract coverage for FunctionalRoleClassification input, output, exclusions, and error behavior in tests/integration/card-role-classification/library-contract.test.ts
- [ ] T025 Run the complete feature validation matrix and record any deliberate exclusions in specs/003-card-role-classification/quickstart.md
- [ ] T026 Run strict type checking and the full deterministic test suite with npm run typecheck and npm test

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: Starts immediately.
- **Phase 2**: Depends on T001 and blocks all user stories; T003–T005 establish the complete intrinsic-card boundary before US1 begins.
- **User Stories**: US1, US2, and US3 all require Phase 2. US2 and US3 may prepare their distinct tests after T011, but their policy extensions require the direct-classification base from T012.
- **Polish**: Requires the implemented desired user stories.

### User Story Dependencies

```text
Phase 1 → Phase 2 (T002–T008) → US1 core (T011–T012) → US2 and US3 → Polish
                                         └──────────────→ US1 integration completes MVP
```

- **US1**: Requires T001–T008; has no dependency on US2 or US3.
- **US2**: Requires T001–T008 and the direct-classification base from T011–T012; it does not require US1's integration test.
- **US3**: Requires T001–T008 and the direct-classification base from T011–T012; it validates partial results independently of multi-role coverage.

### Parallel Opportunities

- After the shared fixture builder exists, T002 and T008 can proceed alongside type design preparation, but behavior propagation, projection, catalog compatibility, and adapter normalization in T003–T007 remain ordered by their data-flow dependencies.
- T009 and T010 can run in parallel. T014, T015, and T016 can run in parallel. T020 and T021 can run in parallel because each owns a distinct test file.
- After T011, separate contributors can prepare US2 and US3 tests in parallel; after T012, coordinate changes to the shared classifier implementation file in T017, T018, T022, and T023 sequentially.

## Parallel Examples

### User Story 1

```text
Task: "Add direct-role acceptance tests in tests/unit/card-role-classification/basic-role-classification.test.ts"
Task: "Add narrow-input integration tests in tests/integration/card-role-classification/intrinsic-card-boundary.test.ts"
```

### User Story 2

```text
Task: "Add direction tests in tests/unit/card-role-classification/multi-role-and-direction.test.ts"
Task: "Add mode/face tests in tests/unit/card-role-classification/modes-and-faces.test.ts"
Task: "Add semantics tests in tests/unit/card-role-classification/taxonomy-semantics.test.ts"
```

### User Story 3

```text
Task: "Add uncertainty tests in tests/unit/card-role-classification/uncertainty-and-explanations.test.ts"
Task: "Add repeatability tests in tests/integration/card-role-classification/repeatability.test.ts"
```

## Implementation Strategy

### MVP First (User Story 1)

1. Complete the intrinsic-behavior schema, catalog compatibility boundary, and narrow `IntrinsicCard` projection in Phases 1–2.
2. Implement and validate US1's direct intrinsic classification and explicit unclassified result.
3. Stop and verify the public library operation independently before extending it with modes/faces or uncertainty behavior.

### Incremental Delivery

1. Foundation + US1 establishes a deterministic direct-role classifier.
2. US2 adds all meaningful multi-role, direction, face, and bounded semantic behavior without changing deck-context independence.
3. US3 adds localized uncertainty, evidence explanations, and repeatability.
4. Polish validates the complete library contract and quickstart matrix.
