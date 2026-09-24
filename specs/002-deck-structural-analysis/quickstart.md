# Quickstart: Validate Deck Structural Analysis

## Prerequisites

- Node.js 24 LTS.
- Dependencies installed with `npm install` after implementation.

## Automated validation

```sh
npm run typecheck
npm test
```

Use deterministic in-memory local-catalog fixtures only. See the [data model](./data-model.md) and [library contract](./contracts/deck-structural-analysis.md).

## Required validation fixtures

1. A complete import with aggregate quantities verifies imported/resolved/unresolved counts, complete coverage, commander/library counts, single and multiple Commander color unions, and repeatable evidence versions.
2. A partial import verifies import-owned coverage semantics: only problems
   explicitly marked as contributing a positive intended quantity affect
   unresolved count; characteristic metrics remain resolved-only; and an
   unresolved commander makes color identity incomplete. The analyzer is never
   tested against concrete import problem codes.
3. An Artifact Creature quantity contributes to both type totals; an unknown supported top-level type is retained rather than rejected; all type totals overlap.
4. Ordinary lands are excluded from mana facts; nonland commanders are included; a normal nonland with an alternative land face is identified once and remains nonland.
5. Split, modal double-faced, Adventure, variable-cost, and hybrid fixtures prove the adapter preserves canonical normalized characteristics while the analyzer performs no provider-layout logic.
6. Distinct high mana values remain distinct ascending distribution buckets, and a non-integral average remains the exact quotient without analysis rounding.
7. Zero resolved nonlands produces total mana value `0`, an empty distribution, and an explicitly unavailable average.
8. Provider-contract fixtures reject legacy name-only catalog records and every
   record that omits or invalidates normalized characteristics; the existing
   updater rebuilds a valid replacement. No incomplete catalog produces an
   exact match, and import-to-analysis integration fixtures make no network
   request.
9. Adapter contract fixtures derive provider-neutral top-level types correctly
   for an ordinary creature, Legendary Creature, Artifact Creature, Enchantment
   Creature, Kindred card, land, Artifact Land, split card, Adventure card,
   modal double-faced spell/land card, and land/land multiface card. They prove
   supertypes/subtypes do not leak into `normalTopLevelTypes`.

## Expected result

All tests pass and repeated analysis of the same normalized import produces a deeply equal structural result. The result distinguishes declared imported totals from resolved-only characteristic statistics and contains no functional, strategic, evaluative, legal, recommendation, or AI conclusion.
