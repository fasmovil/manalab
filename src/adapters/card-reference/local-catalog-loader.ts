import { isValidStoredCatalog, type StoredCatalog } from './local-catalog-store.js';
import { normalizeName } from '../../domain/deck-import/normalize-entry.js';
export interface LoadedCatalog { provenance: StoredCatalog['provenance']; byNormalizedName: Map<string, { name: string }> }
export const normalizeCatalogName = normalizeName;
export function loadCatalog(stored: StoredCatalog): LoadedCatalog { if (!isValidStoredCatalog(stored)) throw new Error('Invalid local catalog.'); return { provenance: stored.provenance, byNormalizedName: new Map(stored.cards.map(c => [normalizeCatalogName(c.name), c])) }; }
