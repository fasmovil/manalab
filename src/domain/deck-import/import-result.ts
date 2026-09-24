import type { CanonicalCardIdentity, ResolutionEvidence } from '../cards/card-identity.js';
import type { CardCharacteristics } from '../cards/card-characteristics.js';
export type ProblemCategory = 'invalid-quantity' | 'malformed-entry' | 'unresolved-name' | 'ambiguous-name' | 'unsupported-syntax' | 'card-reference-unavailable';
export interface SourceEntry {
  lineNumber: number; rawText: string; parsedQuantity?: number; suppliedName?: string;
  commanderDesignated: boolean; inlineCategoryMetadata: string[];
}
export interface ImportProblem { sourceEntry: SourceEntry; category: ProblemCategory; explanation: string; contributesToImportedCardQuantity: boolean; resolutionEvidence?: ResolutionEvidence }
export interface ResolvedDeckContent { identity: CanonicalCardIdentity; characteristics: CardCharacteristics; quantity: number; commanderDesignated: boolean; sourceEntries: SourceEntry[]; resolutionEvidence: ResolutionEvidence }
export interface ImportResult { resolvedContent: ResolvedDeckContent[]; problems: ImportProblem[]; sourceEntries: SourceEntry[]; inputOutcome: 'deck-entries-supplied' | 'no-deck-entries-supplied'; commanderOutcome: 'designated-and-resolved' | 'not-designated-or-unresolved' }
