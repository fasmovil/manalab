# Contract: Local Card Catalog Lifecycle

## Purpose

Define the infrastructure-side responsibilities for acquiring, validating,
activating, and loading a reusable local card catalog. Deck import and domain
logic do not call this contract.

## Operations

| Operation | Contract |
|---|---|
| `checkForUpdate()` | Query Scryfall Bulk Data metadata and select the `oracle_cards` record. |
| `updateIfNewer()` | Compare remote and stored catalog provenance, then download only a newer dataset. |
| `loadCatalog()` | Validate local data plus sidecar metadata and construct an exact-name index. |
| `getCatalogProvider()` | Expose a loaded local catalog through `CardReferenceProvider`. |

## Version comparison

The updater selects the `oracle_cards` manifest record and compares provider
`id` and `updated_at` to local provenance. The current Scryfall transport fields
`jsonl_download_uri` and `compressed_size` are retained as consistency evidence.
If the canonical version tuple is unchanged, it returns `already-current` and
does not download. Local acquisition time is recorded but MUST NOT create a
fixed freshness rule.

## Safe replacement and degraded behavior

- Stream the gzip-compressed JSONL payload from `jsonl_download_uri` to a
  unique temporary location.
- Validate decompression, JSONL records, required card fields, and matching
  provenance; build a candidate exact-name index.
- Activate data and metadata together using a safe replacement operation only
  after validation succeeds; retain the prior valid catalog until then.
- If metadata lookup, download, or validation fails while a valid local catalog
  exists, keep that catalog available and return
  `update-unavailable-local-usable` to the lifecycle caller.
- If no validated local catalog exists, return `no-usable-catalog`. The local
  `CardReferenceProvider` then supplies explicit unavailable outcomes for deck
  import, as required by the import contract.

## Boundary rules

- Scryfall manifest fields, bulk serialization, download mechanics, temporary
  paths, and sidecar storage are adapter concerns.
- This contract chooses no scheduler, background worker, application-start hook,
  or manual-refresh interface. A future application lifecycle decides when to
  invoke it.
- No database, Redis, persistence service, or distributed cache is required.
