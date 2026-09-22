# Feature Specification: Commander Deck Import

**Feature Branch**: `001-commander-deck-import`

**Created**: 2026-09-22

**Status**: Draft

**Input**: User description: "Create the first ManaLab feature: text-based Commander deck import."

## Clarifications

### Session 2026-09-22

- Q: When a deck-list line includes a common printing annotation such as `1 Sol Ring (CMM) 396`, how should ManaLab handle it? → A: Accept common set/collector annotations; resolve by card name and retain the original source line.
- Q: If card-reference data is temporarily unavailable during an import, what result should the player receive? → A: Return a traceable result: no cards are resolved, and every affected entry identifies unavailable card resolution.
- Q: How forgiving should ManaLab be when a card name does not exactly match the canonical name? → A: Normalize harmless formatting only; report non-exact names as problems and optionally show non-binding suggestions.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Import a Deck List (Priority: P1)

A Commander player pastes a conventional text deck list and receives a
normalized deck representation containing each card ManaLab successfully
identified, ready for later validation and analysis.

**Why this priority**: A reliable import is the prerequisite for every later
ManaLab capability and delivers immediate value by turning an informal list
into usable deck content.

**Independent Test**: Paste a list of quantity-prefixed card names, including
blank lines and extra whitespace, and verify the resulting resolved deck
content has the correct aggregate quantities and canonical card identities.

**Acceptance Scenarios**:

1. **Given** a text list with conventional quantity-and-card-name lines,
   **When** the player imports it, **Then** each resolvable entry appears in
   normalized deck content with its aggregate quantity and canonical identity.
2. **Given** entries for the same resolved card on multiple lines, **When** the
   player imports the list, **Then** ManaLab combines their quantities into one
   deck-content entry while retaining the source information needed to explain
   the import.
3. **Given** a list with blank lines, leading or trailing whitespace, and
   varied spacing between a quantity and card name, **When** the player imports
   it, **Then** those formatting differences do not change the intended result.

---

### User Story 2 - Understand Import Problems (Priority: P1)

A player whose list contains an invalid, malformed, or unrecognized entry can
see the original entry, where it occurred, and a clear reason it was not
included in resolved deck content, while still receiving all usable results.

**Why this priority**: Silent loss of cards undermines trust and makes a deck
unsuitable for later analysis.

**Independent Test**: Import a list with one known card and one unrecognized
line; verify the known card is available as resolved content and the other line
is reported as an import problem without being discarded silently.

**Acceptance Scenarios**:

1. **Given** a list containing both resolvable and unresolvable entries,
   **When** it is imported, **Then** resolved entries are returned and each
   unresolvable entry is reported separately with its original text, line
   location, and a human-understandable problem category.
2. **Given** an entry with an invalid or missing quantity, **When** the player
   imports it, **Then** ManaLab reports the entry as a problem and does not
   infer a quantity that could alter the player's deck.
3. **Given** a list containing only unusable nonblank entries, **When** it is
   imported, **Then** ManaLab reports the import as having no resolved deck
   content and presents all identified problems.

---

### User Story 3 - Preserve Commander Intent (Priority: P2)

A player can use established Commander deck-list section conventions or an
inline Commander category to identify intended commander entries, and ManaLab
preserves that intent in the import result without performing advanced
Commander legality validation.

**Why this priority**: Commander identity is useful context for a Commander
deck from the start, while full legality assessment belongs to a later feature.

**Independent Test**: Import lists using a conventional `Commander` or
`Commanders` section and an inline `[Commander]` or `[Commander{top}]` category,
then verify that each corresponding resolved entry is marked as
commander-designated content rather than ordinary deck content.

**Acceptance Scenarios**:

1. **Given** a conventional `Commander` or `Commanders` section heading and
   resolvable entries in that section, **When** the player imports the list,
   **Then** ManaLab preserves those entries as commander-designated content.
2. **Given** a commander-designated entry that cannot be resolved, **When** the
   player imports the list, **Then** ManaLab reports the problem and does not
   claim that a commander was successfully identified.
3. **Given** no recognized commander section, **When** the player imports a
   list, **Then** ManaLab imports resolvable deck content and indicates that no
   commander designation was supplied rather than guessing one.
4. **Given** a resolvable card entry with an inline `Commander` category and
   optional category metadata, **When** the player imports the list, **Then**
   ManaLab preserves that entry as commander-designated content.
5. **Given** a resolvable card entry with an inline non-Commander category such
   as `[Ramp]`, `[Land]`, or `[Tokens]`, **When** the player imports the list,
   **Then** ManaLab tolerates and preserves it as import metadata without
   assigning a functional classification or analytical conclusion.

### Edge Cases

- A zero, negative, fractional, or otherwise malformed quantity is an import
  problem; it does not create resolved content.
- A nonblank line that is a section heading, comment, or unsupported deck-list
  annotation is handled explicitly: recognized Commander headings affect
  commander designation; other unsupported non-card text is reported instead
  of being mistaken for a card.
- Ambiguous card names are not silently matched to an arbitrary card; they are
  reported with the ambiguity or inability-to-resolve reason.
- Case and surrounding whitespace differences in a card name are harmless
  formatting differences. Spelling variations and similar names are not
  auto-corrected or selected; optional suggestions are non-binding.
- A card name may contain punctuation, apostrophes, commas, or split-card
  separators; valid names must not be rejected merely because they are not
  simple words.
- A conventional trailing set/collector annotation is accepted for a card line
  and does not require selecting or validating a particular printing; the
  original source line remains traceable.
- An inline `[Commander]` category, including optional metadata such as
  `[Commander{top}]`, marks a resolvable entry as commander-designated content.
- An inline non-Commander category such as `[Ramp]`, `[Land]`, or `[Tokens]` is
  preserved as import metadata only. It neither changes commander designation
  nor assigns a ManaLab role, classification, finding, or recommendation.
- A card entry repeated between commander-designated and ordinary sections is
  preserved with its designation context and must not lose source traceability
  when quantities are aggregated.
- Empty or whitespace-only input returns no resolved content and a clear
  outcome indicating that no deck entries were supplied.
- If card-reference data is unavailable, no affected entry is reported as
  resolved; each such entry remains traceable with an unavailable-resolution
  problem rather than a fabricated result.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST accept a player-provided text deck list and
  process nonblank lines independently so a problem on one line does not block
  resolution of other lines.
- **FR-002**: The system MUST recognize conventional card-entry lines with an
  explicit positive whole-number quantity followed by a card name, and MUST
  tolerate leading/trailing whitespace and one or more separating spaces.
- **FR-003**: The system MUST accept a card-name-only line as a quantity of one
  when it is otherwise a resolvable card entry.
- **FR-004**: The system MUST accept a conventional trailing set/collector
  annotation on a card-entry line, resolve the card by its name, and preserve
  the complete original source line. The feature MUST NOT treat that annotation
  as a requirement to select or validate a particular printing.
- **FR-005**: The system MUST recognize an inline, bracketed `Commander`
  category on a resolvable card-entry line, case-insensitively and with optional
  category metadata, as commander designation for that entry. It MUST preserve
  the supplied category metadata as source-entry metadata without interpreting
  it for Commander legality or other analysis.
- **FR-006**: The system MUST tolerate inline, bracketed non-Commander
  categories as source-entry metadata. Such metadata MUST NOT create or change
  ManaLab functional classifications, metrics, findings, recommendations, or
  other analytical conclusions.
- **FR-007**: The system MUST ignore blank lines without creating an import
  problem or deck-content entry.
- **FR-008**: The system MUST resolve a valid card name to canonical card
  identity suitable for later ManaLab validation and analysis, including a
  stable canonical identifier and canonical name.
- **FR-009**: The system MUST normalize harmless card-name formatting
  differences, including case and surrounding whitespace. It MUST NOT
  auto-correct spelling variations or select among similar card names; any
  suggestion MUST remain non-binding until the input itself identifies a
  resolvable card.
- **FR-010**: The system MUST return resolved deck content separately from
  import problems. Each resolved content entry MUST include its total quantity,
  canonical identity, commander designation when supplied by a recognized
  section or inline category, and traceable source entries.
- **FR-011**: The system MUST combine duplicate resolved entries that refer to
  the same canonical card and designation context by summing their quantities;
  it MUST retain enough source information to explain the aggregation.
- **FR-012**: The system MUST record each invalid, malformed, ambiguous, or
  unresolvable nonblank entry as an import problem that includes the original
  text, line location, and a clear reason or problem category.
- **FR-013**: The system MUST NOT silently discard a nonblank entry that it
  cannot use as resolved deck content.
- **FR-014**: The system MUST recognize the established `Commander` and
  `Commanders` section headings, case-insensitively and with surrounding
  whitespace permitted, as commander designation for subsequent card entries
  until a recognized non-commander section heading is encountered or input ends.
- **FR-015**: The system MUST recognize the conventional `Deck`, `Mainboard`,
  and `Sideboard` section headings as non-commander boundaries; such headings
  do not create deck content and end any active commander designation.
- **FR-016**: The system MUST indicate whether at least one commander-designated
  entry was successfully resolved; it MUST NOT infer a commander when no
  recognized section or inline Commander category is supplied.
- **FR-017**: The system MUST make its outcomes reproducible for the same input
  and the same applicable card data version, and MUST expose sufficient source
  and resolution evidence to explain every included or problematic entry.
- **FR-018**: If card-reference data is unavailable, the system MUST return a
  traceable import result with no affected entries resolved and an
  unavailable-resolution problem for every affected nonblank card entry. It
  MUST preserve the source entries and MUST NOT fabricate a card identity.
- **FR-019**: The feature MUST NOT perform structural analysis, functional card
  classification, recommendations, scoring, assisted deck building, account or
  library management, persistence, external deck-provider import, generative
  AI, or advanced Commander legality validation.

### Key Entities *(include if feature involves data)*

- **Import request**: The player-supplied raw deck-list text and its import
  context.
- **Source entry**: A nonblank input line, its location, original text,
  interpreted quantity when valid, commander designation context, and any
  tolerated inline category metadata.
- **Resolved deck content**: A successfully identified card in the imported
  deck, its aggregate quantity, canonical identity, designation context, and
  contributing source entries.
- **Canonical card identity**: The stable card identity and canonical card name
  preserved for downstream ManaLab capabilities.
- **Import problem**: An unusable or uncertain source entry, its location and
  original text, plus a clear category and explanation of the failure.
- **Import result**: The complete, traceable separation of resolved deck
  content, commander-identification outcome, and import problems.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Automated acceptance cases for every supported valid input form
  verify the expected normalized canonical identities, aggregate quantities,
  blank-line handling, harmless name normalization, duplicate handling, and
  preserved source evidence.
- **SC-002**: Automated acceptance cases verify that every intentionally
  unusable nonblank entry is represented by a traceable import problem with its
  original text, line location, and problem category.
- **SC-003**: Automated acceptance cases containing both valid and unusable
  entries verify that all valid entries are resolved as expected while every
  unusable entry is reported separately.
- **SC-004**: Automated acceptance cases verify that Commander designation is
  preserved from `Commander` and `Commanders` sections and from inline
  `Commander` categories with optional metadata, while inline non-Commander
  categories remain non-analytical import metadata.
- **SC-005**: Automated repeatability checks verify that identical input and
  card-data version produce identical resolved content, commander designation,
  preserved metadata, and import problems.

## Assumptions

- The feature uses publicly recognizable deck-list conventions rather than a
  ManaLab-specific text syntax; a line containing only a card name represents
  one copy.
- Card identity resolution depends on an available authoritative card catalog,
  which is an external boundary and does not define ManaLab's domain model.
- Unavailable card-reference data is represented in the import result. Reuse or
  fallback to a previously validated local catalog is not a product requirement
  of this feature; it is an implementation choice documented in the technical
  plan.
- The initial import result is transient feature output; retaining a deck for a
  user or later retrieval is out of scope.
- `Commander` and `Commanders` section headings, plus inline `Commander`
  categories with optional metadata, express commander designation. `Deck`,
  `Mainboard`, and `Sideboard` end section-based designation. Other inline
  categories are accepted only as non-analytical import metadata; this feature
  is not a complete parser for any external provider's export format.
- The feature preserves commander designation but does not determine legality,
  color identity, permitted copy counts, or valid partner/background
  relationships.
