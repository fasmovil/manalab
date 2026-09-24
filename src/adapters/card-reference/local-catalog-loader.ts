import { isValidStoredCatalog, type StoredCatalog } from './local-catalog-store.js';
import { normalizeName } from '../../domain/deck-import/normalize-entry.js';
export interface LoadedCatalog { provenance: StoredCatalog['provenance']; byNormalizedName: Map<string, StoredCatalog['cards'][number][]> }
export const normalizeCatalogName = normalizeName;
export function loadCatalog(stored: StoredCatalog): LoadedCatalog { if (!isValidStoredCatalog(stored)) throw new Error('Invalid local catalog.'); const byNormalizedName = new Map<string, StoredCatalog['cards'][number][]>(); for (const card of stored.cards) { const key = normalizeCatalogName(card.name); byNormalizedName.set(key, [...(byNormalizedName.get(key) ?? []), card]); } return { provenance: stored.provenance, byNormalizedName }; }
