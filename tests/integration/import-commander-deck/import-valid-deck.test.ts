import assert from 'node:assert/strict'; import test from 'node:test';
import { importCommanderDeck } from '../../../src/application/import-commander-deck.js';
import { LocalCatalogCardReferenceProvider } from '../../../src/adapters/card-reference/local-catalog-card-reference-provider.js';
import { loadCatalog } from '../../../src/adapters/card-reference/local-catalog-loader.js';
const catalog = loadCatalog({ cards: [{ name: 'Sol Ring' }, { name: 'Winota, Joiner of Forces' }], provenance: { provider: 'fixture', datasetKind: 'oracle_cards', providerDatasetId: 'v1', providerUpdatedAt: '2026-01-01T00:00:00Z', sourceDownloadUri: 'fixture', declaredSize: 1, acquiredAt: '2026-01-01T00:00:00Z' } });
test('normalizes valid lines, annotations, and duplicates', async () => { const result = await importCommanderDeck(' 1 Sol Ring\nSol Ring (CMM) 396\n1x Winota, Joiner of Forces [Commander{top}]', new LocalCatalogCardReferenceProvider(catalog)); assert.equal(result.problems.length, 0); assert.equal(result.resolvedContent[0].quantity, 2); assert.equal(result.commanderOutcome, 'designated-and-resolved'); });
