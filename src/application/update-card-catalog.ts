import type { CatalogUpdateOutcome, ScryfallBulkCatalogUpdater } from '../adapters/card-reference/scryfall-bulk-catalog-updater.js';
export const updateCardCatalog = (updater: ScryfallBulkCatalogUpdater): Promise<CatalogUpdateOutcome> => updater.updateIfNewer();
