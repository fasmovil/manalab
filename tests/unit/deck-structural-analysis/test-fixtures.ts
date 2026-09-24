import type { CardCharacteristics } from '../../../src/domain/cards/card-characteristics.js';
import type { ImportProblem, ImportResult, ResolvedDeckContent, SourceEntry } from '../../../src/domain/deck-import/import-result.js';

export const characteristics = (overrides: Partial<CardCharacteristics> = {}): CardCharacteristics => ({
  canonicalManaValue: 2,
  normalTopLevelTypes: ['Artifact'],
  colorIdentity: [],
  hasAlternativeLandFace: false,
  ...overrides,
});

export const resolved = (name: string, quantity: number, commanderDesignated: boolean, cardCharacteristics = characteristics()): ResolvedDeckContent => ({
  identity: { canonicalKey: `card:${name.toLowerCase()}`, canonicalName: name },
  characteristics: cardCharacteristics,
  quantity,
  commanderDesignated,
  sourceEntries: [],
  resolutionEvidence: { resolutionKind: 'exact-match', normalizedLookupName: name.toLowerCase(), cardDataVersion: 'fixture-v1' },
});

export const unresolvedProblem = (quantity: number, commanderDesignated = false): ImportProblem => {
  const sourceEntry: SourceEntry = { lineNumber: 1, rawText: `${quantity} Missing`, parsedQuantity: quantity, suppliedName: 'Missing', commanderDesignated, inlineCategoryMetadata: [] };
  return { sourceEntry, category: 'unresolved-name', explanation: 'Fixture-only unresolved entry.', contributesToImportedCardQuantity: true };
};

export const importResult = (resolvedContent: ResolvedDeckContent[], problems: ImportProblem[] = []): ImportResult => ({
  resolvedContent,
  problems,
  sourceEntries: [],
  inputOutcome: 'deck-entries-supplied',
  commanderOutcome: resolvedContent.some(entry => entry.commanderDesignated) ? 'designated-and-resolved' : 'not-designated-or-unresolved',
});
