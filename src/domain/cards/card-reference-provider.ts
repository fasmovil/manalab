import type { CanonicalCardIdentity, ResolutionEvidence } from './card-identity.js';
import type { CardCharacteristics } from './card-characteristics.js';

export type CardResolution =
  | { kind: 'exact-match'; identity: CanonicalCardIdentity; characteristics: CardCharacteristics; evidence: ResolutionEvidence }
  | { kind: 'not-found' | 'ambiguous' | 'unavailable'; evidence: ResolutionEvidence };
export interface CardReferenceProvider { resolveExactNames(names: readonly string[]): Promise<Map<string, CardResolution>> }
