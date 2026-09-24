# Contract: Functional Role Classification Library Operation

## Purpose

Describe deterministic, explainable intrinsic capability classification for one
already-resolved ManaLab card. This is a library boundary; the project exposes
no HTTP, UI, or provider contract for this feature.

## Operation

`classifyCardFunctionalRoles(intrinsicCard) → FunctionalRoleClassification`

## Input guarantees and limits

- `intrinsicCard` is a narrow provider-neutral input containing only canonical
  card identity and normalized intrinsic behavior. It may be projected from an
  existing `ResolvedDeckContent`, but that deck-context value is not accepted
  by the operation.
- Its intrinsic behavior includes available behavior sources and any explicitly
  unavailable or incomplete sources from current normalized card information.
- Quantity, commander designation, source-entry history, deck composition,
  strategy, and card relationships are absent from the input and inaccessible
  to the operation.
- The operation does not parse deck text, resolve names, query or update a
  catalog, read provider DTOs, mutate input, or make a network request.

## Output guarantees

- Confirmed roles are restricted to the 14 Taxonomy v1 labels, are ordered
  consistently, and may contain zero, one, or several values without a primary
  role.
- Classification considers all available meaningful faces, modes, and alternate
  costs without duplicating the card. It applies only the limited Magic
  semantics needed by Taxonomy v1. The adapter supplies observable facts; the
  domain policy, not the adapter, maps those facts to roles such as Treasure to
  Mana Acceleration and Clue/investigate to Card Draw.
- Card Draw and Temporary Card Access remain distinct; a restricted library
  search can be Tutor; ordinary land mana alone is not Mana Acceleration; and
  effect direction prevents benefits granted only to another player from
  creating a role for the classified card.
- Each confirmed role has a human-readable explanation of the supporting
  intrinsic behavior. Each Unknown or Ambiguous issue names the missing or
  indeterminate behavior and is scoped to that aspect.
- A role that is confirmed remains confirmed when another aspect is Unknown or
  Ambiguous. An empty role set is explicitly unclassified only after sufficient
  behavior has been assessed.
- Equivalent normalized input produces an identical classification result.

## Exclusions

The operation performs no deck archetype, synergy, combo, win-condition, game
plan, legality, quality, power-level, or recommendation analysis. It does not
modify decks, accept user corrections, persist results, manage users or
workspaces, or use AI/LLM classification.

## Error behavior

The operation is total for a valid `IntrinsicCard`. Missing or incomplete
behavior in current normalized card information is represented as scoped
Unknown output, and policy-indeterminate available behavior as Ambiguous
output; neither condition triggers provider fallback or fabricated role data.
A persisted catalog that predates the intrinsic-behavior schema is incompatible
catalog data and must be rebuilt before it can yield an exact resolution; it is
not turned into an Unknown card-domain result. A malformed in-memory domain
value is a programming-contract violation.
