# Contract: Card Reference Provider Port

## Purpose

Define the only boundary through which deck import requests card information.
Domain and application import logic never depend on a provider SDK, DTO,
identifier, bulk-file format, or catalog lifecycle concern.

## Operation

`resolveExactNames(names) → ResolutionBatch`

## Input

| Value | Contract |
|---|---|
| names | Distinct harmlessly normalized candidate names from valid source entries. |
| request context | Optional correlation data that cannot change exact-match semantics. |

## Output variants

| Variant | Meaning | Domain handling |
|---|---|---|
| exact match | Canonical name and adapter evidence are available. | Produce resolved content. |
| not found | No exact canonical card was identified. | Produce `unresolved-name`. |
| ambiguous | One identity cannot be selected without guessing. | Produce `ambiguous-name`. |
| unavailable | Provider cannot supply a reliable answer. | Produce `card-reference-unavailable`. |

## Adapter obligations

- Associate every requested name with an outcome.
- Resolve from the validated loaded local catalog during normal deck import;
  imports MUST NOT request remote lookup or bulk acquisition.
- Map provider IDs, catalog provenance, versions, errors, and shapes to evidence
  only.
- Do not use fuzzy or most-likely lookup behavior.
- Deduplicate external requests without losing source-entry traceability.
- Never invent an exact match on malformed, unavailable, or ambiguous data.

## Initial implementation choice

The first adapter is a local-catalog provider built from Scryfall `oracle_cards`
Bulk Data. Catalog update and loading are separate adapter responsibilities
defined in [card-catalog.md](./card-catalog.md). This is replaceable
implementation detail, not a product or domain-contract requirement.
