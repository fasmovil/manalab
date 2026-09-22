export interface CanonicalCardIdentity { canonicalKey: string; canonicalName: string }
export interface ResolutionEvidence {
  resolutionKind: 'exact-match' | 'not-found' | 'ambiguous' | 'provider-unavailable';
  normalizedLookupName: string; cardDataVersion?: string;
}
export const canonicalKeyFor = (name: string) => `card:${name.trim().toLowerCase()}`;
