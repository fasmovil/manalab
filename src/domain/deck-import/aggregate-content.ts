import type { ResolvedDeckContent, SourceEntry } from './import-result.js';
import type { CardResolution } from '../cards/card-reference-provider.js';
export function aggregate(entries: { entry: SourceEntry; resolution: CardResolution }[]): ResolvedDeckContent[] {
  const grouped = new Map<string, ResolvedDeckContent>();
  for (const { entry, resolution } of entries) if (resolution.kind === 'exact-match') {
    const key = `${resolution.identity.canonicalKey}:${entry.commanderDesignated}`;
    const prior = grouped.get(key);
    if (prior) { prior.quantity += entry.parsedQuantity!; prior.sourceEntries.push(entry); }
    else grouped.set(key, { identity: resolution.identity, characteristics: resolution.characteristics, quantity: entry.parsedQuantity!, commanderDesignated: entry.commanderDesignated, sourceEntries: [entry], resolutionEvidence: resolution.evidence });
  }
  return [...grouped.values()];
}
