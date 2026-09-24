import { LocalCatalogStore } from '../src/adapters/card-reference/local-catalog-store.js';
import { ScryfallBulkCatalogUpdater } from '../src/adapters/card-reference/scryfall-bulk-catalog-updater.js';
import { updateCardCatalog } from '../src/application/update-card-catalog.js';
import { catalogDirectory } from './smoke-catalog-config.js';

async function main(): Promise<void> {
  const store = new LocalCatalogStore(catalogDirectory);
  const outcome = await updateCardCatalog(new ScryfallBulkCatalogUpdater(store));
  const catalog = await store.load();
  if (!catalog || outcome === 'no-usable-catalog') throw new Error(`Catalog refresh did not produce a usable catalog (${outcome}).`);

  console.log('=== Scryfall / Catalog ===');
  console.log(`- catalog directory: ${catalogDirectory}`);
  console.log(`- bulk/catalog refresh result: ${outcome}`);
  console.log(`- catalog cards: ${catalog.cards.length}`);
  console.log(`- provider: ${catalog.provenance.provider}`);
  console.log(`- card-data version: ${catalog.provenance.providerDatasetId}:${catalog.provenance.providerUpdatedAt}`);
  console.log(`- acquired at: ${catalog.provenance.acquiredAt}`);
  console.log('[PASS] catalog refresh produced a usable normalized catalog');
}

main().catch(error => {
  console.error('=== Scryfall / Catalog: FAILED ===');
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
