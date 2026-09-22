# Research: Commander Deck Import

## Decision 1: TypeScript on Node.js 24 LTS

**Decision**: Use strict TypeScript on Node.js 24 LTS with ES modules.

**Rationale**: The repository has no runtime to preserve. Strict types make
resolved, malformed, ambiguous, and provider-unavailable outcomes explicit.
Node 24 is an LTS release, and its standard library supplies HTTP and a test
runner, avoiding dependencies without current value.

**Alternatives considered**: Python is viable but supplies less compile-time
enforcement for the important result variants. A web framework, third-party HTTP
client, or test framework is rejected because this feature has no UI/transport
requirement and Node supplies the required capabilities.

Sources: [Node.js release policy](https://nodejs.org/en/about/previous-releases),
[TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro), and
[TypeScript modules guidance](https://www.typescriptlang.org/docs/handbook/namespaces-and-modules.html).

## Decision 2: Separate pure import stages

**Decision**: Parse raw text into source entries without provider access,
normalize only harmless formatting and supported syntax, resolve exact unique
names through a port, then aggregate only successful resolutions.

**Rationale**: The separation makes deterministic behavior, partial success, and
traceability direct properties of the design and allows focused automated tests.

**Alternatives considered**: A parser that performs network requests while
scanning lines is rejected because it mixes syntax with side effects. Treating
provider metadata as domain classification is rejected by the specification and
provider-isolation principle.

## Decision 3: Scryfall Bulk Data behind a provider-neutral local catalog

**Decision**: Obtain Scryfall's `oracle_cards` Bulk Data dataset through a
catalog-update adapter. The current adapter discovers `jsonl_download_uri` and
`compressed_size` from the selected manifest record, streams and decompresses
the gzip JSONL payload, persists a validated local dataset with provenance,
loads an exact-name index, and has a local-catalog implementation satisfy
`CardReferenceProvider` for deck imports.

**Rationale**: One local catalog is reusable across deck imports and keeps normal
resolution deterministic and independent of live availability. `oracle_cards`
contains one record per Oracle identity, avoiding printing duplication for
name-based import. The domain still sees only provider-neutral exact-resolution
outcomes and evidence.

**Alternatives considered**: Fuzzy lookup remains rejected because it returns a
likely card. Per-import exact/collection network lookup is rejected because it
couples normal imports to remote availability. A database, Redis, or distributed
cache is rejected because a local dataset plus metadata and index is sufficient.

Sources: [Scryfall Bulk Data](https://scryfall.com/docs/api/bulk-data) and
[Scryfall access guidance](https://scryfall.com/docs/faqs/i-m-having-trouble-accessing-the-scryfall-api-or-i-m-blocked-17).

## Decision 4: Separate catalog lifecycle from imports and preserve degradation

**Decision**: A distinct catalog-update operation fetches Scryfall Bulk Data
metadata, selects `oracle_cards`, and compares its version tuple to local
provenance. It downloads only a newer dataset to temporary local files, validates
and indexes it, then atomically replaces catalog and sidecar metadata. Deck
import only loads/resolves from a local catalog and never triggers an update.

**Rationale**: The comparison uses provider dataset `id` and `updated_at`, with
`jsonl_download_uri` and `compressed_size` as consistency evidence. If metadata
is unchanged, there is no download; there is no fixed freshness interval. If checking or
downloading fails, a validated existing catalog stays usable. With no usable
catalog, the provider emits existing explicit unavailable outcomes.

**Alternatives considered**: A fixed 24-hour freshness rule is rejected because
the feature has no application lifecycle. Discarding a usable catalog after a
failed update is rejected because it creates unnecessary degradation. Retrying
or downloading during an import is rejected because it makes import behavior
remote-dependent and unpredictable.

Sources: [Scryfall Bulk Data](https://scryfall.com/docs/api/bulk-data) and
[Scryfall API access guidance](https://scryfall.com/docs/faqs/i-m-having-trouble-accessing-the-scryfall-api-or-i-m-blocked-17).

## Decision 5: Provider identifiers are provenance, not domain identity

**Decision**: Use a ManaLab-owned canonical key derived deterministically from
the local catalog's canonical name. Keep provider IDs, dataset version, and
local acquisition evidence as provenance only.

**Rationale**: This creates an initial stable identity without making a Scryfall
printing or Oracle identifier a required domain field. A future adapter or card
registry can evolve independently of parser and aggregation behavior.

**Alternatives considered**: Scryfall printing and Oracle identifiers are useful
provider evidence but are rejected as ManaLab domain identity. A persistent card
registry is rejected because persistence is out of scope.
