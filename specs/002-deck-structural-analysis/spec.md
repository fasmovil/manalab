# Feature Specification: Deck Structural Analysis

**Feature Branch**: `002-deck-structural-analysis`

**Created**: 2026-09-23

**Status**: Draft

**Input**: User description: "Create the next ManaLab feature: deck structural analysis."

## Clarifications

### Session 2026-09-23

- Q: How are mana-value statistics represented when there are zero resolved nonland cards? → A: Total mana value is zero, the distribution is empty, and average mana value is explicitly unavailable rather than zero.
- Q: How is average mana-value precision preserved in the structural result? → A: It is total mana value divided by resolved nonland quantity, with no presentation-specific rounding in the structural result.
- Q: How is the ability to distinguish complete and partial analysis verified objectively? → A: Acceptance cases verify explicit coverage labels and the separate imported, resolved, and unresolved quantities.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See a factual deck summary after import (Priority: P1)

A Commander player who has imported a deck can immediately see a factual
summary of what was imported, what was resolved, whether the summary covers
the whole imported deck, the identified commander or commanders, their
combined color identity, and the deck's card counts.

**Why this priority**: The player needs a trustworthy baseline before any
later feature can discuss how the deck functions or how it could change.

**Independent Test**: Analyze a fully resolved import with one or more
commander-designated cards and verify every displayed count and combined color
identity against the imported quantities and resolved card characteristics.

**Acceptance Scenarios**:

1. **Given** a fully resolved imported deck with one commander, **When** the
   player views structural analysis, **Then** the result identifies complete
   coverage, the commander, its color identity, the total declared deck-card
   count, resolved and unresolved quantities, and the library and commander
   quantities.
2. **Given** a fully resolved imported deck with multiple commanders, **When**
   the player views structural analysis, **Then** the result identifies every
   resolved commander and shows the union of their color identities.
3. **Given** a deck with cards whose quantities exceed one, **When** the
   player views structural analysis, **Then** every applicable card-count
   statistic reflects the aggregate quantities rather than the number of
   distinct card entries.

---

### User Story 2 - Inspect structural composition (Priority: P1)

A player can see the resolved deck's land and nonland quantities, top-level
card-type composition, cards with an alternative land face, and a factual
mana-value summary and distribution for resolved nonland cards.

**Why this priority**: These facts are the core structural description of a
Commander deck and are useful without assigning cards a role or judging the
deck.

**Independent Test**: Analyze a resolved deck containing multi-type cards,
lands, nonland cards, a nonland card with a land alternative face, and cards
at multiple mana values; verify the displayed statistics directly from their
card characteristics and quantities.

**Acceptance Scenarios**:

1. **Given** an Artifact Creature with quantity two, **When** the player
   views card-type composition, **Then** it contributes two to both Artifact
   and Creature while the result does not imply that type totals sum to the
   deck-card count.
2. **Given** a nonland modal double-faced card with a land alternative face,
   **When** the player views structural analysis, **Then** the card remains a
   nonland in normal land/nonland and type counts, appears in the land-face
   identification, and contributes once according to its normal mana value.
3. **Given** resolved lands and nonland commanders alongside other resolved
   nonlands, **When** the player views mana statistics, **Then** lands are
   excluded and every resolved nonland commander is included.
4. **Given** nonland cards at distinct high mana values, **When** the player
   views the mana-value distribution, **Then** each actual mana value remains
   separately represented.

---

### User Story 3 - Understand incomplete analysis (Priority: P1)

A player whose import contains unresolved cards still receives the useful
structural facts that can be established from resolved cards, with clear
coverage information that prevents partial statistics from being mistaken for
a complete deck description.

**Why this priority**: Suppressing all analysis loses useful information, but
presenting partial results as complete would undermine trust.

**Independent Test**: Analyze an import that contains resolved and unresolved
card quantities, including an unresolved commander-designated entry, and
verify that resolved statistics are present, coverage is incomplete, and no
unknown commander traits are invented.

**Acceptance Scenarios**:

1. **Given** an import with resolved and unresolved card quantities, **When**
   the player views structural analysis, **Then** the result shows the
   imported, resolved, and unresolved quantities and labels all
   characteristic-based statistics as covering only the resolved portion.
2. **Given** an import with no unresolved cards, **When** the player views
   structural analysis, **Then** the result states that coverage is complete.
3. **Given** an unresolved commander-designated entry, **When** the player
   views structural analysis, **Then** the result does not claim a complete
   commander list or a complete combined Commander color identity.

### Edge Cases

- An import with no resolved cards still returns an analysis with zero
  resolved-card statistics and an explicit incomplete-coverage outcome when
  unresolved quantities exist; it does not fabricate card characteristics.
- An import with no unresolved cards and no resolved cards reports complete
  coverage of zero imported cards, with no identified commander or color
  identity.
- A card may have any supported top-level Magic card type, including a type
  outside historically common type lists; it remains represented by that type
  in composition rather than being discarded or forced into another type.
- A card with multiple top-level types contributes its quantity once to each
  applicable type; overlapping type totals are not treated as a partition.
- Modal double-faced, split, Adventure, variable-cost, hybrid-cost, and other
  supported special-layout cards use their canonical normal-card
  characteristics for structural type, land/nonland, and mana-value facts.
- A nonland card with an alternative land face is not duplicated and is not
  counted as a land solely because that alternative face exists.
- A resolved commander can also have a quantity greater than one in the
  imported input. The analysis reports observed quantities and does not make a
  Commander-legality judgment.
- When no resolved commander is identified, the result states that no resolved
  commander is available for color-identity calculation; it does not infer one.
- When there are zero resolved nonland cards, total mana value is zero, the
  mana-value distribution is empty, and average mana value is explicitly
  unavailable because no nonland-card population exists.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST produce a deterministic structural analysis from
  an imported Commander deck's normalized resolved content, commander
  designation, quantities, and unresolved-card issues, using the applicable
  normalized card characteristics.
- **FR-002**: The analysis MUST report the total imported card quantity, the
  successfully resolved card quantity, and the unresolved card quantity. Each
  quantity MUST be calculated from card quantities rather than distinct card
  entries.
- **FR-003**: The analysis MUST state whether coverage is complete. Coverage
  is complete only when the imported card quantity contains no unresolved card
  quantity; otherwise it MUST clearly identify all characteristic-based
  statistics as describing the resolved portion only.
- **FR-004**: The analysis MUST report every successfully resolved
  commander-designated card and its observed quantity. It MUST not infer an
  unresolved or undesignated commander.
- **FR-005**: The analysis MUST report the combined Commander color identity
  as the union of the color identities of all successfully resolved
  commander-designated cards. If an unresolved commander-designated card makes
  the combined identity incomplete, the result MUST state that limitation and
  MUST NOT present the resolved-only union as the complete Commander color
  identity.
- **FR-006**: The analysis MUST report the total declared deck-card quantity,
  resolved commander quantity, and resolved library quantity. The declared
  total equals resolved plus unresolved card quantities; resolved library
  quantity excludes resolved commander-designated quantities.
- **FR-007**: The analysis MUST report resolved land and resolved nonland
  quantities using each card's normal structural characteristics. Those counts
  MUST be explicitly scoped to resolved cards whenever coverage is incomplete.
- **FR-008**: The analysis MUST report composition by every top-level card type
  represented in resolved content. A card with multiple top-level types MUST
  contribute its full quantity to every applicable type, and the result MUST
  make clear that type totals can overlap and need not equal a deck total.
- **FR-009**: The analysis MUST identify each resolved nonland card with an
  alternative land face and its quantity, without counting that card as a land
  or as more than one card solely because it has that face.
- **FR-010**: The analysis MUST report the total mana value, average mana
  value, and exact mana-value distribution for resolved nonland cards. Each
  distribution bucket MUST retain its actual mana value and the quantity at
  that value. When there are zero resolved nonland cards, total mana value MUST
  be zero, the distribution MUST be empty, and average mana value MUST be
  explicitly unavailable rather than reported as zero.
- **FR-011**: Resolved land cards MUST contribute neither to total mana value,
  average mana value, nor to the mana-value distribution. Resolved nonland
  commander-designated cards MUST contribute to each of those statistics like
  other resolved nonland cards.
- **FR-012**: When resolved nonland quantity is greater than zero, the analysis
  MUST calculate average mana value as total mana value divided by resolved
  nonland quantity. The structural result MUST retain that value without
  presentation-specific rounding or decimal formatting.
- **FR-013**: For variable costs, split cards, modal double-faced cards,
  Adventure cards, hybrid mana, and other supported
  card forms, the analysis MUST use the canonical Magic mana value and normal
  structural characteristics applicable to that card form. It MUST not
  substitute a simplified or presentation-grouped value that loses factual
  distinctions.
- **FR-014**: The analysis MUST support more than one commander when the
  imported deck identifies multiple commander-designated entries.
- **FR-015**: The analysis MUST be traceable: each reported aggregate MUST be
  reproducible from the imported quantities, resolution outcome, normalized
  card characteristics, and applicable card-data version.
- **FR-016**: The feature MUST describe structural facts only. It MUST NOT
  perform Commander legality validation; quality or power evaluation;
  functional classification; strategy, synergy, combo, or win-condition
  analysis; mana-base quality or color-demand analysis; recommendations; or
  AI-generated interpretation.

### Key Entities *(include if feature involves data)*

- **Structural analysis**: The deterministic, factual result describing an
  imported deck's coverage, counts, commander information, color identity,
  type composition, land-face identification, and mana-value facts.
- **Coverage summary**: The imported, resolved, and unresolved card quantities
  plus the complete or partial status that establishes the scope of the
  analysis.
- **Resolved deck entry**: A normalized card identity with aggregate quantity,
  commander designation, and the normal card characteristics used in analysis.
- **Unresolved card issue**: An imported card quantity that could not be
  resolved and therefore limits the completeness of characteristic-based
  structural facts.
- **Card-type composition**: A quantity for each represented top-level card
  type, allowing a resolved card to contribute to multiple types.
- **Land-face entry**: A resolved nonland card with an alternative land face,
  retained separately from normal land classification.
- **Mana-value summary**: The resolved-nonland total, average, and exact
  per-mana-value quantity distribution.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Automated acceptance cases verify 100% agreement between the
  analysis and hand-calculated card quantities for imported, resolved,
  unresolved, commander, library, land, nonland, and top-level type counts,
  including repeated card quantities and multi-type cards.
- **SC-002**: Automated acceptance cases with unresolved cards verify that
  every result identifies partial coverage and that no card characteristic,
  commander identity, or complete color identity is claimed for unresolved
  content.
- **SC-003**: Automated acceptance cases covering modal double-faced, split,
  Adventure, variable-cost, hybrid-cost, and multi-type cards verify the
  expected normal structural facts and canonical mana-value totals,
  averages, and exact distributions in every case. Cases with zero resolved
  nonlands verify a zero total, empty distribution, and explicitly unavailable
  average; cases with nonzero resolved nonlands verify the unrounded quotient.
- **SC-004**: Automated repeatability checks verify that the same normalized
  imported deck and card-data version always produce identical structural
  analysis results.
- **SC-005**: Automated acceptance cases for representative complete and
  partial imports verify an explicit complete-or-partial coverage status and
  separately labeled imported, resolved, and unresolved quantities, so the
  result objectively distinguishes total imported-card quantities from
  resolved-only characteristic statistics without making functional or
  strategic claims.

## Assumptions

- This feature operates on the existing import result; it does not parse,
  resolve, repair, or persist a deck list.
- Every unresolved card issue that contributes to an imported card quantity
  retains the positive intended quantity parsed during import. Non-card input
  or malformed entries without a valid intended quantity remain import
  problems but do not constitute an imported card for this analysis.
- “Total deck card count” means the declared imported-card quantity: resolved
  plus unresolved quantities. Counts that require card characteristics are
  necessarily counts of resolved cards and are visibly scoped as such for a
  partial import.
- Normal card characteristics and canonical mana values are available in the
  normalized card data used by the import result. The external card-data source
  remains an isolated boundary and does not define the ManaLab domain model.
- The feature reports observed imported quantities even when those quantities
  could be illegal in Commander; legality belongs to a later feature.
- Presentation may later choose visual grouping, but the structural analysis
  retains exact raw values, especially for mana-value distribution and average
  mana value; display formatting does not alter the structural result.
