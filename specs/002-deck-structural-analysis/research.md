# Research: Deck Structural Analysis

## Decision 1: Keep unresolved-coverage semantics in deck import

**Decision**: Add an import-owned semantic field to each `ImportProblem` that
states whether its valid intended quantity contributes to imported-card
coverage, and expose an import-domain coverage helper. The structural analyzer
uses that helper rather than recognizing any concrete problem category.

**Rationale**: Feature 001 owns the distinction between parsing failures and
card-resolution failures. A mandatory semantic field makes the author of every
new problem type choose its coverage effect, avoiding a silent structural
coverage regression as problem taxonomy evolves. This adds no redundant counter
to `ImportResult`.

**Alternatives considered**: Having the analyzer enumerate current category
codes couples it to import implementation and becomes stale. A second counter
on `ImportResult` duplicates derivable information and risks divergence.

## Decision 2: Reuse `ImportResult` as the sole analyzer input

**Decision**: The structural analyzer accepts only the existing normalized `ImportResult`; it does not accept raw deck-list text, a provider, a catalog, or an adapter record.

**Rationale**: Feature 001 already owns parsing, exact resolution, aggregation, commander designation, source traceability, and provider interaction. Reusing that result makes the analysis deterministic and preserves partial imports instead of creating a second interpretation pipeline.

**Alternatives considered**: Re-parsing duplicates syntax rules. Resolving during analysis makes the result depend on provider state and could change import outcomes.

## Decision 3: Extend successful normalized cards with characteristics

**Decision**: Add a ManaLab-owned `CardCharacteristics` value to the `exact-match` provider result and retain it on each `ResolvedDeckContent`. It contains canonical mana value, dynamic normal top-level types, color identity, and `hasAlternativeLandFace`.

**Rationale**: The inspected 001 catalog stores only `{ name }`; its domain exposes only canonical identity and resolution evidence. Quantity, commander designation, source entries, and card-data version already exist, but mana value, types, color identity, and face facts do not. This is the smallest extension that enables 002 without bypassing the domain boundary.

**Alternatives considered**: Supplying raw Scryfall records violates provider isolation. A new provider query violates deterministic reuse of the import result. Retaining every face/layout detail is unnecessary because the feature needs normal characteristics plus a land-face flag.

## Decision 4: Normalize top-level types and special-card semantics in the adapter

**Decision**: The existing Scryfall bulk updater maps and validates source
records into `CardCharacteristics` during catalog update. It derives normal
top-level types from provider type/layout/face data, excluding supertypes and
subtypes; uses canonical source mana value; preserves color identity; and
derives alternative-land-face status from face characteristics. The analyzer
consumes only the normalized value.

**Rationale**: This supplies canonical facts for variable costs, split, modal double-faced, Adventure, hybrid, and future supported layouts without teaching the analyzer provider layout rules. A nonland card with a land alternative remains nonland because its normal types—not the flag—determine land classification.

**Alternatives considered**: Layout-specific arithmetic in the analyzer leaks provider semantics. Treating any land face as an ordinary land misclassifies modal cards.

## Decision 5: Reject legacy name-only catalogs safely

**Decision**: A stored catalog record without complete mandatory
`CardCharacteristics` is invalid under the new catalog contract. The loader
does not load it for exact resolution; the local provider therefore cannot
return an exact match from it. The existing updater refreshes/rebuilds a valid
catalog rather than synthesizing structural defaults.

**Rationale**: Partial characteristics would create deceptively complete deck
analysis. The existing catalog validation and updater lifecycle already offer a
simple place to reject invalid persisted data and rebuild it safely.

**Alternatives considered**: Defaulting zero mana value, empty types, or no
colors would make incorrect facts look valid. Supporting dual name-only and
characteristic-bearing paths adds complexity and still cannot meet the feature
contract.

## Decision 6: Use tagged completeness and availability states

**Decision**: Represent coverage and Commander color identity with explicit states, and represent average mana value as a tagged available/unavailable value. Zero resolved nonlands yields total `0`, an empty distribution, and an unavailable average.

**Rationale**: A numeric zero average is misleading without a population, and a resolved-only color union is incomplete when commander-designated input remains unresolved. Tagged states make uncertainty explicit and keep presentation independent from structural truth.

**Alternatives considered**: Omitting average or color state would force consumers to infer meaning. Rejecting partial imports loses useful resolved facts.

## Decision 7: Preserve exact values and deterministic ordering

**Decision**: Sum quantities as positive integers; retain canonical mana values as numbers; calculate average only as total divided by resolved-nonland quantity; create one bucket per actual mana value; sort type names, mana-value buckets, colors, and data-version evidence deterministically.

**Rationale**: Multi-type counts deliberately overlap and high mana values must not be grouped in the structural result. Stable ordering makes deep-equality repeatability tests and later presentation reliable.

**Alternatives considered**: Rounding, display buckets, fixed historical type enums, and insertion-order-dependent maps lose facts or stability.

## Decision 8: Reuse the library and test seams

**Decision**: Export the new domain operation from `src/index.ts`, use no new dependencies, and mirror existing Node test seams: pure unit calculations, local-catalog provider contract fixtures, and integration fixtures chaining import to analysis.

**Rationale**: The repository is a strict TypeScript Node library, not an application with UI, HTTP, or serialization conventions. Existing deterministic in-memory catalogs and Node's built-in test runner are sufficient.

**Alternatives considered**: A web endpoint, UI, test framework, or dependency creates a parallel architecture without a current requirement.

## Source note

The existing adapter uses Scryfall `oracle_cards` bulk data. Scryfall's card-object and bulk-data documentation are the adapter reference for source-field mapping; DTO names and layouts remain adapter implementation details: [Cards API](https://scryfall.com/docs/api/cards) and [Bulk Data API](https://scryfall.com/docs/api/bulk-data).
