import type { CardReferenceProvider } from '../domain/cards/card-reference-provider.js';
import { aggregate } from '../domain/deck-import/aggregate-content.js';
import type { ImportProblem, ImportResult } from '../domain/deck-import/import-result.js';
import { parseDeckList } from '../domain/deck-import/parse-deck-list.js';
import { resolvableEntries } from '../domain/deck-import/normalize-entry.js';
export async function importCommanderDeck(rawText: string, provider: CardReferenceProvider): Promise<ImportResult> {
  const parsed = parseDeckList(rawText); const candidates = resolvableEntries(parsed.entries).filter(({ entry }) => !parsed.problems.some(p => p.sourceEntry === entry));
  const resolutions = await provider.resolveExactNames([...new Set(candidates.map(c => c.lookupName))]); const problems: ImportProblem[] = [...parsed.problems];
  for (const { entry, lookupName } of candidates) { const result = resolutions.get(lookupName)!; if (result.kind !== 'exact-match') problems.push({ sourceEntry: entry, category: result.kind === 'unavailable' ? 'card-reference-unavailable' : result.kind === 'ambiguous' ? 'ambiguous-name' : 'unresolved-name', explanation: result.kind === 'unavailable' ? 'Card reference data is unavailable.' : 'Card name could not be resolved exactly.', contributesToImportedCardQuantity: true, resolutionEvidence: result.evidence }); }
  const resolvedContent = aggregate(candidates.map(c => ({ entry: c.entry, resolution: resolutions.get(c.lookupName)! })));
  return { resolvedContent, problems, sourceEntries: parsed.entries, inputOutcome: rawText.trim() ? 'deck-entries-supplied' : 'no-deck-entries-supplied', commanderOutcome: resolvedContent.some(c => c.commanderDesignated) ? 'designated-and-resolved' : 'not-designated-or-unresolved' };
}
