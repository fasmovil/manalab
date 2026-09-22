# Quickstart: Validate Commander Deck Import

## Prerequisites

- Node.js 24 LTS.
- After implementation, install dependencies with `npm install`.

## Automated validation

```sh
npm test
npm run typecheck
```

Use deterministic local card-catalog fixtures for normal import tests and
separate catalog/provider-contract tests for Scryfall Bulk Data mapping. See
[deck-import contract](./contracts/deck-import.md) and
[data model](./data-model.md).

## Required acceptance fixtures

1. Quantity-prefixed and name-only entries normalize, aggregate duplicates, and
   retain source lines.
2. Blank lines plus harmless whitespace/case variations do not change results.
3. Set/collector annotations and inline categories remain source metadata; only
   inline `Commander` changes Commander designation.
4. Invalid quantities, malformed lines, ambiguous names, and unknown names each
   produce traceable problems without blocking valid entries.
5. An absent usable local catalog produces no invented identity and one
   `card-reference-unavailable` problem per affected entry.
6. Commander headings, inline Commander metadata, and non-Commander categories
   produce the outcomes defined in the contract.
7. Identical input and identical fake card-data version produce equal results.

## Catalog lifecycle fixtures

1. Load a validated local dataset and resolve exact normalized names without a
   network request.
2. Preserve catalog version/provenance as resolution evidence.
3. Given matching remote Bulk Data metadata, report `already-current` and make
   no dataset download.
4. Given a newer remote dataset tuple, stream/decompress the gzipped JSONL
   payload named by `jsonl_download_uri`, validate/index it, and safely activate
   the replacement with matching provenance and `compressed_size` evidence.
5. Given a metadata or download failure plus a validated local catalog, retain
   that catalog and report `update-unavailable-local-usable` to the lifecycle
   caller.
6. Given no validated local catalog, report `no-usable-catalog`; import then
   returns explicit unavailable problems.

## Expected result

All fixtures pass. The import result separates resolved content from problems
and retains evidence for every nonblank source line. Normal import fixtures do
not depend on Scryfall availability; any live catalog check is opt-in and
validates only the lifecycle adapter boundary.
