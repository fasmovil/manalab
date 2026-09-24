import { canonicalKeyFor, type ResolutionEvidence } from '../../domain/cards/card-identity.js';
import type { CardReferenceProvider, CardResolution } from '../../domain/cards/card-reference-provider.js';
import type { LoadedCatalog } from './local-catalog-loader.js';
export class LocalCatalogCardReferenceProvider implements CardReferenceProvider {
  constructor(private readonly catalog?: LoadedCatalog) {}
  async resolveExactNames(names: readonly string[]): Promise<Map<string, CardResolution>> {
    const results = new Map<string, CardResolution>(); for (const name of names) {
      const evidence: ResolutionEvidence = { resolutionKind: this.catalog ? 'not-found' : 'provider-unavailable', normalizedLookupName: name, cardDataVersion: this.catalog ? `${this.catalog.provenance.providerDatasetId}:${this.catalog.provenance.providerUpdatedAt}` : undefined };
      const cards = this.catalog?.byNormalizedName.get(name);
      results.set(name, cards?.length === 1 ? { kind: 'exact-match', identity: { canonicalKey: canonicalKeyFor(cards[0].name), canonicalName: cards[0].name }, characteristics: cards[0].characteristics, evidence: { ...evidence, resolutionKind: 'exact-match' } } : cards?.length ? { kind: 'ambiguous', evidence: { ...evidence, resolutionKind: 'ambiguous' } } : this.catalog ? { kind: 'not-found', evidence } : { kind: 'unavailable', evidence });
    } return results;
  }
}
