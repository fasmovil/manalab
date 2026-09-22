# Contract: Deck Import Use Case

## Purpose

Provider-independent library boundary for importing one text deck list.

## Operation

`importCommanderDeck(request, cardReferenceProvider) → ImportResult`

## Input

| Value | Required | Contract |
|---|---:|---|
| raw deck-list text | Yes | Preserved unchanged as evidence; blank lines are ignored. |
| card-reference provider | Yes | Satisfies the provider-port contract. |
| optional context | No | Cannot alter parsing, resolution, or analysis. |

## Output guarantees

- Resolved content includes canonical identity, aggregate quantity, explicit
  Commander designation, source entries, and resolution evidence.
- Every unusable nonblank source line has one problem containing raw text, line
  number, category, and explanation.
- Valid entries remain available when other entries are invalid or unresolved.
- If no usable local catalog is available, the provider returns an `ImportResult`
  with `card-reference-unavailable` problems for affected entries. A deck import
  does not initiate a remote update or bulk download.
- Inline categories are source metadata. Only `Commander` affects Commander
  designation; no metadata creates analytical output.
- Empty or whitespace-only input returns `no-deck-entries-supplied` with no
  resolved content or import problems.
- Equal raw input and equal card-data version produce equal import results.

## Supported syntax envelope

- Positive whole quantity plus card name, or card name alone for quantity one.
- Leading/trailing whitespace and variable separator spacing.
- Conventional trailing set/collector annotations.
- `Commander`/`Commanders` headings and `Deck`/`Mainboard`/`Sideboard` boundaries.
- Bracketed inline categories, including `Commander` with optional metadata.

Unrecognized nonblank syntax remains an import problem; this contract does not
define a complete external-provider export grammar.
