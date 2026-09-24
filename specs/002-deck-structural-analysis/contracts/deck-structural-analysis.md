# Contract: Deck Structural Analysis Library Operation

## Purpose

Describe deterministic factual structure for an already normalized Commander deck import. This operation is a library boundary; the current project has no HTTP or UI contract.

## Operation

`analyzeDeckStructure(importResult) → StructuralAnalysis`

## Input guarantees and limits

- `importResult` is produced by the existing Commander import pipeline.
- Resolved entries include aggregate quantity, commander designation, source traceability, resolution evidence, and mandatory `CardCharacteristics`.
- The operation does not parse text, resolve names, query a provider, update a catalog, repair an import, mutate input, or read raw provider DTOs.
- The import domain supplies coverage semantics through its helper; the analyzer
  does not recognize import problem codes. Invalid/malformed source issues
  without a positive parsed quantity remain import evidence but are not imported
  cards for coverage counting.

## Output guarantees

- Coverage reports separately labeled imported, resolved, and unresolved card quantities and `complete`/`partial` status.
- All card-characteristic facts—commander identity, color identity, land/nonland quantities, type composition, land-face cards, and mana facts—derive from resolved content only. A partial result makes that scope explicit.
- Commander color identity is `complete`, `incomplete`, or `unavailable`; no unresolved commander is inferred.
- Type quantities overlap: each card quantity contributes to every normal top-level type it has.
- A normal nonland with an alternative land face is identified once, remains a nonland, and is never counted twice.
- Mana facts include nonland commanders and exclude normal lands. Zero resolved nonlands yields total `0`, empty distribution, and tagged unavailable average. Otherwise average is exact total/quantity with no display rounding and distribution preserves every actual mana value.
- The result includes sorted distinct card-data versions observed in resolved evidence and is repeatable for identical input and card-data version.

## Import-contract compatibility

- `CardCharacteristics` is mandatory for every exact resolution. A legacy local
  catalog that contains only names is invalid and produces no exact-resolution
  fallback or synthesized characteristics.
- The existing catalog updater refreshes/rebuilds an invalid legacy catalog;
  validation fixtures cover both rejection and successful characteristic-bearing
  replacement.
- `normalTopLevelTypes` is dynamic and provider-neutral. The adapter derives it
  from provider type/layout/face data, excluding supertypes and subtypes; raw
  type lines, layout names, and face DTOs are not part of this contract.

## Exclusions

The operation performs no Commander legality validation, functional role classification, strategy/archetype inference, synergy/combo or win-condition analysis, deck or mana-base evaluation, color-demand analysis, recommendation, or AI interpretation.

## Error behavior

The operation is total for a structurally valid `ImportResult`, including an empty result and partial imports. It represents uncertainty in the result rather than rejecting valid resolved information. A malformed in-memory domain value is a programming-contract violation and must not trigger provider fallback or fabricated facts.
