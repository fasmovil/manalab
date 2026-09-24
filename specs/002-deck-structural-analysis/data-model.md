# Data Model: Deck Structural Analysis

## Model boundaries

`ImportResult` remains the only analyzer input. Feature 001 continues to own
source parsing, problem construction, exact resolution, aggregation, resolution
evidence, and import-card coverage semantics. The card-reference adapter owns
mapping source card data to normalized characteristics. Structural analysis owns
only derived provider-neutral facts and never receives raw catalog/provider
records.

### Import-owned coverage semantics

`ImportProblem` gains a mandatory `contributesToImportedCardQuantity` boolean.
The import pipeline sets it `true` only when a problem represents an unresolved
valid intended card quantity; syntax/quantity failures set it `false`. A pure
deck-import helper derives resolved, unresolved, and imported quantities from
`ImportResult`. The structural analyzer calls that helper and never imports or
examines the `ProblemCategory` taxonomy. New problem creation must explicitly
set the boolean, so a future resolution-origin case cannot be omitted silently.

## Required extension to the import contract

### CardCharacteristics

Mandatory on an `exact-match` card resolution and retained unchanged by every `ResolvedDeckContent` aggregation.

| Field | Description | Validation / use |
|---|---|---|
| canonicalManaValue | Canonical numeric Magic mana value. | Finite and nonnegative; summed/bucketed exactly for resolved nonlands. |
| normalTopLevelTypes | Unique top-level type names of the normal card. | Nonempty, dynamic string collection; never constrained to a historical enum. `Land` determines normal land status. |
| colorIdentity | Unique Commander color-identity symbols. | Subset of `W`, `U`, `B`, `R`, `G`; unioned only across resolved commanders. |
| hasAlternativeLandFace | Whether a normal nonland has an alternative land face. | Boolean; identifies the card but does not change normal types, count, land status, or mana value. |

The adapter rejects incomplete or invalid characteristic records during catalog
validation/update rather than passing uncertain structural facts into an exact
resolution. A legacy name-only catalog is therefore invalid under this contract:
the loader/store does not make it available for exact resolution, and the
existing updater must rebuild it. No defaults are synthesized. No
provider-specific ID, type-line string, face object, or layout name crosses this
boundary.

### Existing data audit

| Required by 002 | Existing 001 availability | Plan disposition |
|---|---|---|
| Resolved quantity and designation | Available on `ResolvedDeckContent`. | Reuse. |
| Unresolved quantity and commander intent | Source entry is available; coverage semantic is added to `ImportProblem`. | Reuse import-owned coverage helper and semantic field, not problem codes. |
| Canonical identity | Available. | Reuse. |
| Card-data provenance | Per-entry optional `resolutionEvidence.cardDataVersion`. | Reuse and expose sorted distinct values as analysis evidence. |
| Mana value, normal types, color identity, land-face fact | Not available; current catalog retains names only. | Add `CardCharacteristics`. |
| Raw layout/faces | Not available, and not required in the domain. | Derive the required boolean in the adapter only. |

## StructuralAnalysis

| Field | Description | Rules |
|---|---|---|
| coverage | Imported/resolved/unresolved quantities and complete/partial status. | Imported = resolved + qualifying unresolved; complete iff unresolved is zero. |
| commanders | Resolved commander entries with identity and observed quantity. | One entry for each commander-designated resolved content entry; no legality judgment. |
| commanderColorIdentity | Colors plus completeness status. | Union resolved commander colors; incomplete if any qualifying unresolved commander exists; unavailable when no commander is identified. |
| declaredDeckCardQuantity | Imported-card quantity. | Equal to coverage imported quantity. |
| resolvedCommanderQuantity | Quantity of resolved commander-designated entries. | Counted independently of legality. |
| resolvedLibraryQuantity | Quantity of resolved non-commander entries. | Does not include unresolved quantity. |
| resolvedLandQuantity / resolvedNonlandQuantity | Normal structural card counts. | Resolved-only; each card is classified once from `normalTopLevelTypes`. |
| typeComposition | One quantity per represented normal top-level type. | A card contributes full quantity to every listed type; totals intentionally overlap. |
| alternativeLandFaceCards | Resolved normal nonland entries with land alternatives. | Each appears once with quantity; it is not counted as land because of this flag. |
| manaValue | Resolved-nonland mana-value facts. | Defined below. |
| cardDataVersionsUsed | Sorted distinct known card-data versions from resolved-content evidence. | Evidence, not identity; may be empty if evidence is absent. |

### Coverage derivation

The import-owned helper calculates `resolvedCardQuantity` from resolved content
and `unresolvedCardQuantity` from positive intended quantities on problems whose
`contributesToImportedCardQuantity` is true. Parser failures without a valid
intended quantity remain traceable import problems but are not cards in this
feature's declared deck count. `importedCardQuantity` is their sum. The analyzer
uses this result rather than concrete import problem categories.

### Commander color identity state

| Status | Condition | Colors |
|---|---|---|
| complete | At least one resolved commander and no qualifying unresolved commander. | Exact union of resolved commander colors. |
| incomplete | At least one qualifying unresolved commander. | Known union of resolved commander colors, explicitly not a complete identity. |
| unavailable | No resolved or qualifying unresolved commander. | Empty; no commander identity is available. |

### ManaValueSummary

| Field | Description | Rules |
|---|---|---|
| resolvedNonlandQuantity | Population size. | Includes nonland commanders; excludes all normal lands. |
| totalManaValue | Quantity-weighted sum. | `0` when population is zero. |
| averageManaValue | Tagged `available` with exact quotient or `unavailable`. | Available only when population is greater than zero; never rounded by analysis. |
| distribution | Ordered list of `(manaValue, quantity)` buckets. | One bucket per exact value, ascending numeric order; empty when population is zero. |

## Determinism and ordering

The analyzer preserves resolved commander and alternative-land-face entry order from normalized resolved content. It emits color symbols in canonical `W/U/B/R/G` order, types in ascending lexical order, mana buckets in ascending numeric order, and card-data versions in ascending lexical order. Maps/sets are not exposed directly. Equivalent normalized input and card-data evidence therefore produce deeply equal output.

## State transitions

There is no persistence or lifecycle transition.

```text
raw deck list → existing import pipeline → ImportResult → structural analysis
```

The analysis step is pure and repeatable without mutation, provider access, or changing the import result.
