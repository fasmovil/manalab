# Data Model: Commander Deck Import

## Model boundaries

The import domain owns the import entities. A card-reference adapter translates
local catalog records into `ResolutionEvidence`; Scryfall manifest, bulk-file,
identifier, storage, and lifecycle formats never cross that boundary. Exposed
lists retain source order.

## Entities

### ImportRequest

| Field | Description | Rules |
|---|---|---|
| rawText | Player-supplied deck-list text. | May be empty; blank input yields an empty result. |
| context | Optional import context. | Cannot alter parsing, resolution, or analysis behavior. |

### SourceEntry

| Field | Description | Rules |
|---|---|---|
| lineNumber | One-based input location. | Required and immutable. |
| rawText | Original unmodified nonblank line. | Required and immutable. |
| parsedQuantity | Parsed positive whole quantity. | Invalid/missing value becomes a problem. |
| suppliedName | Candidate card name after syntax extraction. | May be absent when malformed. |
| sectionDesignation | Commander or ordinary section context. | Derived only from supported headings. |
| inlineCategoryMetadata | Bracketed category text and optional metadata. | Neutral import metadata. |
| commanderDesignated | Explicit Commander intent. | Derived only from supported section/category syntax. |

### CanonicalCardIdentity

| Field | Description | Rules |
|---|---|---|
| canonicalKey | ManaLab-owned deterministic canonical-name key. | Never a provider identifier. |
| canonicalName | Canonical name from resolution. | Required when resolved. |

### ResolutionEvidence

| Field | Description | Rules |
|---|---|---|
| resolutionKind | `exact-match`, `not-found`, `ambiguous`, or `provider-unavailable`. | Required. |
| normalizedLookupName | Name sent to the provider port. | Required after lookup. |
| cardDataVersion | Local catalog version/provenance evidence. | Preserved or explicitly absent. |
| providerProvenance | Provider name and IDs. | Evidence only; never domain identity. |

### LocalCatalogProvenance

Adapter-owned metadata stored beside the local catalog; it is mapped into
`ResolutionEvidence` but is not required by domain entities.

| Field | Description | Rules |
|---|---|---|
| provider | Source provider label. | `Scryfall` for the initial adapter. |
| datasetKind | Source data category. | Initial value is `oracle_cards`. |
| providerDatasetId | Scryfall Bulk Data record identifier. | Provider provenance only. |
| providerUpdatedAt | Dataset version timestamp. | Compared with the remote manifest. |
| sourceDownloadUri | Manifest `jsonl_download_uri` used for acquisition. | Historical evidence, not a domain dependency. |
| declaredSize | Manifest `compressed_size` used for consistency validation. | Provider evidence. |
| acquiredAt | Local successful acquisition time. | Informational; never a freshness rule. |
| localContentDigest | Optional local integrity evidence. | Validated before activation when available. |

### LocalCardCatalog

Adapter-owned reusable dataset and exact-name index loaded from local files.
It is valid only when its data and matching `LocalCatalogProvenance` pass loader
validation. It resolves exact normalized names without a network request.

### CatalogUpdateOutcome

| Variant | Meaning |
|---|---|
| `already-current` | Remote tuple matches validated local provenance; no download occurs. |
| `updated` | A newer dataset was downloaded, validated, indexed, and safely activated. |
| `update-unavailable-local-usable` | Metadata/download failed, but the existing valid catalog remains active. |
| `no-usable-catalog` | No validated local catalog is available for resolution. |

### ResolvedDeckContent

| Field | Description | Rules |
|---|---|---|
| identity | Canonical card identity. | Required. |
| quantity | Aggregate positive whole quantity. | Sum only equal identity and designation context. |
| commanderDesignated | Explicit Commander intent. | Included in aggregation key. |
| sourceEntries | Contributing entries. | Never discarded during aggregation. |
| resolutionEvidence | Resolution evidence. | Required. |

### ImportProblem

| Field | Description | Rules |
|---|---|---|
| sourceEntry | Affected source entry. | Required for each unusable nonblank line. |
| category | `invalid-quantity`, `malformed-entry`, `unresolved-name`, `ambiguous-name`, `unsupported-syntax`, or `card-reference-unavailable`. | One primary category. |
| explanation | Human-readable reason. | Must not overstate certainty. |
| resolutionEvidence | Lookup evidence when relevant. | Required for resolution problems. |

### ImportResult

| Field | Description | Rules |
|---|---|---|
| resolvedContent | Aggregated successful content. | Separate from problems; may be empty. |
| problems | All unusable nonblank entries. | Separate from content; may be empty. |
| commanderOutcome | `designated-and-resolved` or `not-designated-or-unresolved`. | Derived only from resolved designated content. |
| inputOutcome | `deck-entries-supplied` or `no-deck-entries-supplied`. | Makes empty or whitespace-only input explicit. |
| sourceEntries | Every considered nonblank source line. | Enables reconciliation. |

## Processing and validation

```text
catalog metadata check → unchanged local catalog or safely activated replacement
raw text → source entries → parsed/normalized entries + syntax problems
         → local exact-name resolution → identities or resolution problems
         → aggregation by identity + commander designation → import result
```

- Quantities are positive whole numbers.
- Case and surrounding whitespace normalize; spelling does not.
- Set/collector annotations are provenance only; they do not select a printing.
- Inline metadata is preserved. Only `Commander` changes designation; none creates
  a functional classification or analytical output.
- A deck import never performs catalog acquisition, metadata checks, or downloads.
- Update failures retain an existing validated local catalog; without one, the
  provider reports unavailability without erasing source entries or guessing.
