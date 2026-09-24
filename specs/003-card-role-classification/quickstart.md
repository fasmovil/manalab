# Quickstart: Validate Card Functional Role Classification

## Prerequisites

- Node.js 24 LTS.
- Dependencies installed with `npm install` after implementation.

## Automated validation

```sh
npm run typecheck
npm test
```

Use deterministic local catalog fixtures only. See the [data model](./data-model.md)
and [library contract](./contracts/functional-role-classification.md).

## Required validation fixtures

1. At least one resolved card proves each of the 14 Taxonomy v1 roles; no
   output contains a role outside that taxonomy.
2. Sol Ring, a temporary-mana ritual, Rampant Growth, and Nature's Lore prove
   Mana Acceleration; an ordinary mana-producing land proves no Mana
   Acceleration solely from its ordinary mana ability.
3. Faithless Looting proves Card Draw, Card Selection, Discard Enabler, and
   Graveyard Enabler. Reckless Impulse proves Temporary Card Access and not
   Card Draw.
4. Entomb proves Tutor plus Graveyard Enabler; a constrained library search
   proves that restrictions do not remove Tutor.
5. Swords to Plowshares proves Spot Removal. Path to Exile proves Spot Removal
   but not Mana Acceleration, and Beast Within proves Spot Removal but not
   Token Generation. A targeted conditional-damage fixture proves that damage
   is not Spot Removal merely because it might destroy a permanent in a
   particular game state.
6. Cyclonic Rift proves Spot Removal and Mass Removal across ordinary and
   overload use. A spell/ability-on-the-stack fixture proves Countermagic; a
   prevention effect directed only at a future cast or activation does not.
7. A controller-preserving fixture proves Protection; a controller-owned
   graveyard-recovery fixture proves Graveyard Recursion. Tireless Provisioner
   proves controller-owned Token Generation and Treasure-based Mana
   Acceleration.
8. Ashnod's Altar proves Sacrifice Outlet plus Mana Acceleration; a forced or
   mandatory self-sacrifice effect without a usable choice does not prove an
   outlet. A controlled discard fixture proves Discard Enabler.
9. Split, Adventure, modal double-faced, and alternate-cost fixtures prove
   that all meaningful available behavior is assessed once without duplicating
   the card.
10. A sufficiently understood no-role card produces an empty confirmed-role
    set and explicit unclassified result. A card missing behavior needed for an
    otherwise possible role produces scoped Unknown while retaining confirmed
    roles; available behavior outside the bounded policy produces scoped
    Ambiguous while retaining confirmed roles.
11. The same normalized card used in two imports with different quantities,
    commander designations, and deck context produces deeply equal roles,
    issues, and explanations. Repeating a classification of the same normalized
    input produces the same complete result.
12. Adapter-boundary tests prove behavior is normalized from catalog input,
    face availability is retained, and raw provider DTOs never reach the
    classifier. A catalog predating the intrinsic-behavior schema is rejected
    as incompatible and rebuilt; genuinely incomplete current source behavior
    becomes explicit uncertainty. Integration tests prove classification makes
    no provider or network request and receives no deck-context fields.

## Expected result

All tests pass. The exported library operation returns deterministic intrinsic
card capabilities with explainable confirmed roles and explicitly scoped
uncertainty. It produces no deck strategy, evaluation, recommendation, or AI
conclusion.
