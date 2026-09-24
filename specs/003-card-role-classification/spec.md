# Feature Specification: Card Functional Role Classification

**Feature Branch**: `003-card-role-classification`

**Created**: 2026-09-24

**Status**: Draft

**Input**: User description: "Classify the intrinsic functional roles of resolved Commander cards."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See a card's intrinsic capabilities (Priority: P1)

A Commander player who has imported a deck can inspect each resolved card's
functional capabilities using the ManaLab Functional Role Taxonomy v1, without
the result being influenced by the other cards in that deck.

**Why this priority**: A trustworthy per-card capability layer is the
foundation for later deck-level analysis and is valuable on its own.

**Independent Test**: Classify representative resolved cards in separate decks
and verify that each card receives the same role set in both, including cards
with no applicable role.

**Acceptance Scenarios**:

1. **Given** a resolved Sol Ring, **When** its functional roles are
   classified, **Then** it is assigned Mana Acceleration.
2. **Given** a resolved Swords to Plowshares, **When** its functional roles
   are classified, **Then** it is assigned Spot Removal.
3. **Given** a resolved Path to Exile, **When** its functional roles are
   classified, **Then** it is assigned Spot Removal and not Mana Acceleration,
   because any land-search benefit is granted to the affected creature's
   controller.
4. **Given** a resolved Beast Within, **When** its functional roles are
   classified, **Then** it is assigned Spot Removal and not Token Generation,
   because any token is created for the affected permanent's controller.
5. **Given** a resolved card understood to have none of the supported v1
   capabilities, **When** its functional roles are classified, **Then** it
   has an explicitly empty role set and an unclassified outcome rather than a
   failure outcome.

---

### User Story 2 - See every relevant role on a multi-purpose card (Priority: P1)

A player can see all supported capabilities intrinsically provided by a card,
including capabilities available through meaningful modes or faces, rather
than being forced to choose one primary role.

**Why this priority**: Many Commander cards serve several functions, and
collapsing them to one label would create misleading analysis.

**Independent Test**: Classify representative multi-role, modal, and
multi-faced cards and compare their complete role sets against the stated
capabilities.

**Acceptance Scenarios**:

1. **Given** a resolved Ashnod's Altar, **When** its functional roles are
   classified, **Then** it is assigned both Sacrifice Outlet and Mana
   Acceleration.
2. **Given** a resolved Faithless Looting, **When** its functional roles are
   classified, **Then** it is assigned Card Draw, Card Selection, Discard
   Enabler, and Graveyard Enabler.
3. **Given** a resolved Cyclonic Rift, **When** its functional roles are
   classified, **Then** it is assigned Spot Removal for its ordinary use and
   Mass Removal for its overload capability.
4. **Given** a resolved Reckless Impulse, **When** its functional roles are
   classified, **Then** it is assigned Temporary Card Access and not Card
   Draw.

---

### User Story 3 - Understand uncertainty and evidence (Priority: P1)

A player or later analytical feature can distinguish confirmed roles from
behavior that could not be classified with confidence, and can inspect the
evidence behind each confirmed or unresolved conclusion.

**Why this priority**: ManaLab must remain useful with incomplete data while
never presenting an uncertain classification as fact.

**Independent Test**: Classify resolved cards with complete, incomplete, and
ambiguous relevant information and verify confirmed roles remain available,
uncertainty is explicit, and every conclusion exposes supporting evidence.

**Acceptance Scenarios**:

1. **Given** a resolved card whose available information supports Mana
   Acceleration but is insufficient to classify another relevant behavior,
   **When** its functional roles are classified, **Then** Mana Acceleration is
   confirmed and the unresolved behavior is reported as Unknown.
2. **Given** a resolved card with relevant available information that cannot
   be resolved under the current classification rules, **When** its functional
   roles are classified, **Then** the unresolved behavior is reported as
   Ambiguous without removing any confirmed roles.
3. **Given** any confirmed role or uncertainty outcome, **When** a player or
   downstream feature inspects it, **Then** the result identifies the card
   behavior or information that supports that conclusion or limitation.

### Edge Cases

- A card may receive zero, one, or several supported roles; several roles are
  not an ambiguity and no primary role is selected.
- A card that searches the library for a constrained category, including a
  land, receives Tutor when that search deliberately provides access to the
  card; Rampant Growth and Nature's Lore also receive Mana Acceleration, while
  Entomb also receives Graveyard Enabler.
- Formal drawing and temporary permission to play exiled cards remain distinct,
  even when both increase a player's available options.
- Effects affecting another player or an affected permanent's controller do
  not confer a role on the classified card solely because that other party
  gains a resource or creates a token.
- A meaningful alternate mode, alternate cost, split portion, Adventure, or
  face can supply an intrinsic role. The card remains one classified card, and
  relevant behavior on another face is not discarded.
- Relevant Magic-defined mechanics are recognized where necessary for this
  taxonomy: for example, Treasure creation can support Mana Acceleration and
  Clue creation or investigating can support Card Draw. This does not require
  interpretation of mechanics unrelated to Taxonomy v1.
- If the available normalized card information lacks behavior needed to assess
  a possible role, the affected classification is Unknown; an empty role set
  is used only when the card was sufficiently understood and no v1 role
  applies.
- If information is available but current rules cannot decide a classification
  reliably, the affected classification is Ambiguous. It is not used merely
  because a card has multiple roles.
- An unresolved deck entry is outside this feature's card-classification input
  and must not receive an invented role result.

## Taxonomy Semantics

For Taxonomy v1, these product-level meanings govern functional role
classification. A card can satisfy more than one meaning at the same time.

- **Mana Acceleration**: Increases the controller's usable mana resources
  beyond ordinary land use, including temporary mana such as a ritual or
  mana-producing resources it creates. Producing mana from an ordinary land by
  itself is not Mana Acceleration.
- **Card Draw**: Causes the controller to draw one or more cards.
- **Card Selection**: Lets the controller deliberately improve, filter, or
  choose among card options without requiring net card advantage.
- **Temporary Card Access**: Temporarily permits the controller to play or
  cast cards from a zone where they would not otherwise be available, such as
  exiled cards; it is distinct from Card Draw.
- **Tutor**: Deliberately searches the library to access a card, even when the
  search is restricted to a category or other criterion.
- **Spot Removal**: Directly removes or meaningfully neutralizes a particular
  opposing permanent or other specified threat. Incidental or conditional
  damage is not Spot Removal merely because it could destroy some permanents in
  certain game states.
- **Mass Removal**: Removes or meaningfully neutralizes multiple permanents or
  a broad class of permanents through one available effect.
- **Countermagic**: Directly counters or otherwise prevents a spell or ability
  on the stack from resolving.
- **Protection**: Preserves the controller's cards, permanents, or other
  resources against removal, damage, targeting, or comparable disruption.
- **Graveyard Recursion**: Deliberately returns, reuses, or otherwise recovers
  the controller's cards or resources from the graveyard.
- **Graveyard Enabler**: Deliberately places, or enables placing, the
  controller's own cards or resources into the graveyard.
- **Token Generation**: Causes the controller to create one or more tokens.
- **Sacrifice Outlet**: Provides a usable intrinsic way for the controller to
  deliberately sacrifice the controller's own permanents or other resources.
- **Discard Enabler**: Provides a usable intrinsic way for the controller to
  deliberately discard the controller's own cards or other resources.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST classify the intrinsic functional capabilities
  of each already-resolved card using normalized, provider-neutral card
  information available to ManaLab. A card's result MUST be independent of
  the deck in which it appears, its quantity, commander designation, strategy,
  or relationships to other cards.
- **FR-002**: The system MUST support exactly these Functional Role Taxonomy v1
  roles: Mana Acceleration, Card Draw, Card Selection, Temporary Card Access,
  Tutor, Spot Removal, Mass Removal, Countermagic, Protection, Graveyard
  Recursion, Graveyard Enabler, Token Generation, Sacrifice Outlet, and
  Discard Enabler.
- **FR-003**: The system MUST assign every supported role that is sufficiently
  evidenced by a card's intrinsic behavior. It MUST allow zero, one, or
  multiple confirmed roles and MUST NOT choose or imply a single primary role.
- **FR-004**: The system MUST distinguish Card Draw from Temporary Card
  Access. Temporarily allowing a player to play or cast an exiled card is
  Temporary Card Access and MUST NOT by itself be classified as Card Draw.
- **FR-005**: The system MUST classify deliberate library searches that provide
  access to a card as Tutor even when the search criterion is restricted. It
  MUST additionally classify any separately evidenced supported capability,
  such as Mana Acceleration or Graveyard Enabler.
- **FR-006**: The system MUST consider the direction and recipient of each
  relevant effect. A resource, token, or other benefit granted only to another
  player or an affected object's controller MUST NOT cause a role to be
  assigned to the classified card on that basis alone.
- **FR-007**: The system MUST consider relevant capabilities across meaningful
  alternate modes, alternate costs, and card faces. It MUST retain all
  supported roles evidenced by those capabilities without duplicating the
  card or restating structural facts already produced by earlier analysis.
- **FR-008**: The system MUST account for Magic-defined keywords, keyword
  actions, tokens, and predefined game objects when their defined meaning is
  necessary to classify a role in Taxonomy v1. It MUST not claim to interpret
  unrelated Magic rules or provide a complete rules interpretation.
- **FR-009**: For every classified card, the system MUST explicitly distinguish
  among: confirmed supported roles; no supported roles/unclassified, when the
  available information was sufficient and none apply; Unknown, when available
  information is insufficient to classify relevant behavior reliably; and
  Ambiguous, when relevant information is available but current classification
  rules cannot resolve it with sufficient confidence.
- **FR-010**: The system MUST preserve partial classification. Unknown or
  Ambiguous behavior for one possible role MUST NOT remove or downgrade other
  roles that are confirmed by sufficient evidence.
- **FR-011**: The system MUST expose understandable evidence for each confirmed
  role and for every Unknown or Ambiguous outcome, identifying the relevant
  observed card behavior or missing/indeterminate information.
- **FR-012**: Given the same normalized card information and applicable
  classification behavior, the system MUST produce identical roles, uncertainty
  outcomes, and explanations.
- **FR-013**: The feature MUST consume resolved-card results from the existing
  import and domain model rather than independently interpreting provider data.
  It MUST preserve the boundary between provider-specific data and ManaLab
  domain behavior.
- **FR-014**: The feature MUST NOT perform deck-strategy or archetype
  detection, card-to-card synergy or combo detection, win-condition or game
  plan inference, quality or power-level evaluation, recommendations, deck
  modification, assisted deck building, user correction workflows,
  authentication, workspaces, persistent deck libraries, or AI-generated
  classification.

### Key Entities *(include if feature involves data)*

- **Functional role classification**: The deterministic, per-resolved-card
  result containing confirmed Taxonomy v1 roles, any unresolved or ambiguous
  classification aspects, and explainable evidence.
- **Functional role**: One intrinsic, deckbuilding-relevant gameplay
  capability from the ManaLab Functional Role Taxonomy v1.
- **Classification evidence**: The observable card behavior or normalized
  information that supports a confirmed role, or identifies why a behavior is
  Unknown or Ambiguous.
- **Uncertainty outcome**: A visible Unknown or Ambiguous classification issue
  scoped to the affected behavior, independent of any confirmed roles.
- **Unclassified outcome**: An explicit result for a sufficiently understood
  card to which none of the supported v1 roles apply.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Automated acceptance cases covering every Taxonomy v1 role
  verify the expected role is confirmed for at least one representative
  resolved card, with no roles outside the 14-role taxonomy returned.
- **SC-002**: Automated acceptance cases for Ashnod's Altar, Faithless
  Looting, Tireless Provisioner, Jeska's Will, Cyclonic Rift, Reckless Impulse,
  Rampant Growth, Nature's Lore, Entomb, Beast Within, and Path to Exile
  verify every specified included and excluded role exactly.
- **SC-003**: Automated cases with the same resolved card in at least two
  different deck contexts verify 100% identical classification results,
  including evidence and uncertainty outcomes.
- **SC-004**: Automated cases for complete, incomplete, and indeterminate
  card information verify that 100% of confirmed roles are retained during
  partial classification, that Unknown and Ambiguous outcomes remain distinct,
  and that a sufficiently understood no-role card is explicitly unclassified.
- **SC-005**: Automated repeatability checks verify that the same normalized
  card information and applicable classification behavior produce identical
  complete results.

## Assumptions

- This feature builds on the existing resolved-card and normalized domain
  information produced by features 001 and 002; it neither imports nor resolves
  deck entries.
- A "meaningful" mode, cost, or face is one a player can use as part of the
  card's own available game behavior; its intrinsic capability is included
  regardless of typical deck use.
- The supported taxonomy labels are product vocabulary, not official Magic
  rules categories, and its scope is limited to version 1 of this feature.
- The relevant normalized card information is available for review so results
  and their explanations can be assessed.
- Cards outside the resolved-card input remain handled by existing import
  outcomes; they do not receive a functional classification in this feature.
