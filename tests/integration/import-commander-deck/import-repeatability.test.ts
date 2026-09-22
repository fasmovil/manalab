import assert from 'node:assert/strict'; import test from 'node:test';
import { importCommanderDeck } from '../../../src/application/import-commander-deck.js';
import { LocalCatalogCardReferenceProvider } from '../../../src/adapters/card-reference/local-catalog-card-reference-provider.js';
import { loadCatalog } from '../../../src/adapters/card-reference/local-catalog-loader.js';
test('is repeatable for identical input and catalog version', async () => { const provider = new LocalCatalogCardReferenceProvider(loadCatalog({ cards: [{ name: 'Sol Ring' }], provenance: { provider: 'fixture', datasetKind: 'oracle_cards', providerDatasetId: 'v1', providerUpdatedAt: 'now', sourceDownloadUri: 'fixture', declaredSize: 1, acquiredAt: 'now' } })); const a = await importCommanderDeck('1 Sol Ring', provider); const b = await importCommanderDeck('1 Sol Ring', provider); assert.deepEqual(a, b); });
