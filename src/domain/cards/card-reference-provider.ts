import type { CanonicalCardIdentity, ResolutionEvidence } from './card-identity.js';

export type CardResolution =
  | { kind: 'exact-match'; identity: CanonicalCardIdentity; evidence: ResolutionEvidence }
  | { kind: 'not-found' | 'ambiguous' | 'unavailable'; evidence: ResolutionEvidence };
export interface CardReferenceProvider { resolveExactNames(names: readonly string[]): Promise<Map<string, CardResolution>> }
