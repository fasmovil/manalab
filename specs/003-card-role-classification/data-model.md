# Data Model: Card Functional Role Classification

## Model boundaries

The existing import flow remains responsible for parsing, exact resolution,
aggregation, quantities, commander designation, source traceability, and
resolution evidence. The card-reference adapter remains responsible for
normalizing external records into provider-neutral observable card facts.
Functional-role classification receives only a narrow intrinsic-card input and
produces intrinsic, provider-neutral results; it neither fetches data nor sees
provider DTOs or deck context.

## Required extension to normalized card information

### IntrinsicCardBehavior

`CardCharacteristics` gains a mandatory provider-neutral intrinsic-behavior
value, retained unchanged through `CardResolution` and `ResolvedDeckContent`.
The value models what is known about a card's own gameplay behavior; it does
not describe deck strategy, expected use, or another card's effects.

| Element | Description | Validation / use |
|---|---|---|
| behavior sources | The normal card and every meaningful alternate face whose behavior can be assessed. | Each source has a stable card-local label and is retained once; a card is never duplicated for its faces. |
| available behavior | Provider-neutral rules and relevant keyword facts for a source, including modes and alternate costs expressed by that source. | May be empty for a sufficiently understood vanilla/no-role source; used by the bounded taxonomy policy. |
| unavailable behavior | Explicit statement that behavior for a source or relevant portion is absent or incomplete. | Produces scoped Unknown explanation; it is never converted to empty available behavior. |
| canonical observable concepts | Provider-neutral facts such as token identity or keyword action. | The adapter may represent facts such as creating a Treasure or Clue, or investigating, but does not assign ManaLab roles from them. |

The adapter maps and validates external card data into this value. It does not
interpret Taxonomy v1: mappings such as Treasure to Mana Acceleration and
Clue/investigate to Card Draw belong only to the domain classification policy.
A persisted catalog record that predates this required schema is incompatible
and must be rebuilt under the existing catalog compatibility policy; it is not
converted to unavailable behavior. New/current normalized source information
that genuinely lacks a relevant source or portion is represented as unavailable
behavior. New catalog data must preserve the availability of each relevant
face/behavior source rather than omit it.

## Classification input

### IntrinsicCard

`IntrinsicCard` contains only canonical card identity and
`IntrinsicCardBehavior`. It is projected from the existing
`ResolvedDeckContent` upstream because no current domain value offers this
narrow boundary. Quantity, commander designation, source entries, resolution
evidence, and every other deck-context field are absent from this input and are
therefore inaccessible to the classifier.

## Classification result

### FunctionalRole

The closed Taxonomy v1 label set is: Mana Acceleration, Card Draw, Card
Selection, Temporary Card Access, Tutor, Spot Removal, Mass Removal,
Countermagic, Protection, Graveyard Recursion, Graveyard Enabler, Token
Generation, Sacrifice Outlet, and Discard Enabler. Labels are emitted in the
taxonomy's canonical order and never contain a primary-role marker.

### Confirmed role conclusion

| Element | Description | Rules |
|---|---|---|
| role | One supported FunctionalRole. | A role appears at most once even when several faces or modes support it. |
| explanation | Human-readable description of the observed intrinsic behavior. | Identifies the behavior and, where useful, its face or mode without exposing provider fields. |

### Classification issue

| Element | Description | Rules |
|---|---|---|
| kind | `Unknown` or `Ambiguous`. | Unknown means needed behavior information is unavailable; Ambiguous means behavior is available but the bounded policy cannot decide it reliably. |
| affected aspect | The possible role or behavior whose conclusion is unresolved. | Scoped to the issue, not the whole card. |
| explanation | Missing, indeterminate, or policy-limited behavior explanation. | Does not remove independently confirmed roles. |

### FunctionalRoleClassification

| Element | Description | Rules |
|---|---|---|
| card identity | The classified canonical card identity. | Preserves the relationship to the resolved entry. |
| confirmed roles | Ordered confirmed-role conclusions. | Zero, one, or multiple roles are valid. |
| unresolved or ambiguous aspects | Ordered classification issues. | Empty when no uncertainty remains; may coexist with confirmed roles. |
| unclassified | Explicit indication that no supported role applies. | True only when behavior is sufficiently assessed, confirmed roles are empty, and no issue prevents that conclusion. |

This model deliberately has no required global classification status and no
separate evidence-versus-inference representation.

## Classification flow and state

```text
external card data
  → adapter-normalized IntrinsicCardBehavior
  → exact CardResolution
  → aggregated ResolvedDeckContent
  → IntrinsicCard projection
  → classifyCardFunctionalRoles
  → confirmed roles + scoped issues + explanations
```

The classifier is total for a valid `IntrinsicCard`. Available behavior is
evaluated across all sources using only Taxonomy v1 semantics. It records
confirmed roles, then any localized uncertainty. There is no persistence,
global lifecycle state, or mutation of the input.

## Determinism and ordering

Equivalent normalized behavior and identity produce deeply equal output.
Confirmed roles follow Taxonomy v1 order; issues follow stable source and
aspect order; explanations use stable domain-owned wording. The design does
not introduce classification-rule versioning as a required product input or
output.
