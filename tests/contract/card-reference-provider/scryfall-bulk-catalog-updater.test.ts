import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { LocalCatalogCardReferenceProvider } from '../../../src/adapters/card-reference/local-catalog-card-reference-provider.js';
import { loadCatalog } from '../../../src/adapters/card-reference/local-catalog-loader.js';
import { LocalCatalogStore } from '../../../src/adapters/card-reference/local-catalog-store.js';
import { ScryfallBulkCatalogUpdater } from '../../../src/adapters/card-reference/scryfall-bulk-catalog-updater.js';

const manifest = { id: 'v2', type: 'oracle_cards', updated_at: '2026-02-01T00:00:00Z', jsonl_download_uri: 'https://fixture/data', compressed_size: 10 };
const fixtureCards = [
  { name: 'Ordinary Creature', cmc: 2, type_line: 'Creature — Human Wizard', color_identity: ['U'] },
  { name: 'Legend', cmc: 3, type_line: 'Legendary Artifact Creature — Human', color_identity: ['W'] },
  { name: 'Enchantment Creature', cmc: 4, type_line: 'Enchantment Creature — Nymph', color_identity: ['G'] },
  { name: 'Basic Land', cmc: 0, type_line: 'Basic Land — Forest', color_identity: [] },
  { name: 'Artifact Land', cmc: 0, type_line: 'Artifact Land — Island', color_identity: ['U'] },
  { name: 'Split Spell', cmc: 3, type_line: 'Instant // Sorcery', color_identity: ['R'], card_faces: [{ type_line: 'Instant' }, { type_line: 'Sorcery' }] },
  { name: 'Adventure Creature', cmc: 5, type_line: 'Creature — Human // Instant — Adventure', color_identity: ['W'], card_faces: [{ type_line: 'Creature — Human' }, { type_line: 'Instant — Adventure' }] },
  { name: 'Spell // Land', cmc: 3, type_line: 'Sorcery // Land', color_identity: ['G'], card_faces: [{ type_line: 'Sorcery' }, { type_line: 'Land' }] },
  { name: 'Land // Land', cmc: 0, type_line: 'Land // Land', color_identity: [], card_faces: [{ type_line: 'Land' }, { type_line: 'Land' }] },
  { name: 'Kindred', cmc: 2, type_line: 'Kindred — Goblin', color_identity: [] },
];

const fixtureFetcher = (cards = fixtureCards): typeof fetch => async url => String(url).includes('bulk-data')
  ? new Response(JSON.stringify({ data: [manifest] }))
  : new Response(gzipSync(cards.map(value => JSON.stringify(value)).join('\n') + '\n'));

const storedCard = (name: string) => ({ name, characteristics: { canonicalManaValue: 1, normalTopLevelTypes: ['Artifact'], colorIdentity: [], hasAlternativeLandFace: false } });
const storedProvenance = { provider: 'fixture', datasetKind: 'oracle_cards', providerDatasetId: 'v1', providerUpdatedAt: 'old', sourceDownloadUri: 'fixture', declaredSize: 1, acquiredAt: 'now' };

test('uses an identifying User-Agent and avoids unchanged downloads', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'manalab-'));
  let calls = 0;
  const fetcher: typeof fetch = async (url, init) => {
    calls++;
    assert.equal(new Headers(init?.headers).get('user-agent'), 'ManaLab/0.1 (local catalog updater)');
    return String(url).includes('bulk-data') ? new Response(JSON.stringify({ data: [manifest] })) : new Response(gzipSync(fixtureCards.map(value => JSON.stringify(value)).join('\n') + '\n'));
  };
  try {
    const updater = new ScryfallBulkCatalogUpdater(new LocalCatalogStore(dir), fetcher);
    assert.equal(await updater.updateIfNewer(), 'updated');
    assert.equal(await updater.updateIfNewer(), 'already-current');
    assert.equal(calls, 3);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('retains usable catalog after manifest failure', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'manalab-'));
  try {
    const store = new LocalCatalogStore(dir);
    await store.replace([storedCard('Sol Ring')], storedProvenance);
    assert.equal(await new ScryfallBulkCatalogUpdater(store, async () => new Response('', { status: 503 })).updateIfNewer(), 'update-unavailable-local-usable');
    assert.ok(await store.load());
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('reports no usable catalog when acquisition fails without local data', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'manalab-'));
  try {
    assert.equal(await new ScryfallBulkCatalogUpdater(new LocalCatalogStore(dir), async () => new Response('', { status: 503 })).updateIfNewer(), 'no-usable-catalog');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('refreshes when consistency fields change', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'manalab-'));
  const changed = { ...manifest, jsonl_download_uri: 'https://fixture/new', compressed_size: 11 };
  const fetcher: typeof fetch = async url => String(url).includes('bulk-data')
    ? new Response(JSON.stringify({ data: [changed] }))
    : new Response(gzipSync(fixtureCards.map(value => JSON.stringify(value)).join('\n') + '\n'));
  try {
    const store = new LocalCatalogStore(dir);
    await store.replace([storedCard('Old Card')], { ...storedProvenance, provider: 'Scryfall', providerDatasetId: 'v2', providerUpdatedAt: manifest.updated_at, sourceDownloadUri: manifest.jsonl_download_uri, declaredSize: 10 });
    assert.equal(await new ScryfallBulkCatalogUpdater(store, fetcher).updateIfNewer(), 'updated');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('retains the active catalog when a streamed record is malformed', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'manalab-'));
  const fetcher: typeof fetch = async url => String(url).includes('bulk-data')
    ? new Response(JSON.stringify({ data: [manifest] }))
    : new Response(gzipSync(`${JSON.stringify(fixtureCards[0])}\n{"name":42}\n`));
  try {
    const store = new LocalCatalogStore(dir);
    const oldCard = storedCard('Old Card');
    await store.replace([oldCard], storedProvenance);
    assert.equal(await new ScryfallBulkCatalogUpdater(store, fetcher).updateIfNewer(), 'update-unavailable-local-usable');
    assert.deepEqual((await store.load())?.cards, [oldCard]);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('normalizes representative types and layouts without leaking provider fields', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'manalab-'));
  try {
    const store = new LocalCatalogStore(dir);
    assert.equal(await new ScryfallBulkCatalogUpdater(store, fixtureFetcher()).updateIfNewer(), 'updated');
    const stored = await store.load();
    const byName = new Map(stored?.cards.map(card => [card.name, card.characteristics]));

    assert.deepEqual(byName.get('Ordinary Creature')?.normalTopLevelTypes, ['Creature']);
    assert.deepEqual(byName.get('Legend')?.normalTopLevelTypes, ['Artifact', 'Creature']);
    assert.deepEqual(byName.get('Enchantment Creature')?.normalTopLevelTypes, ['Enchantment', 'Creature']);
    assert.deepEqual(byName.get('Basic Land')?.normalTopLevelTypes, ['Land']);
    assert.deepEqual(byName.get('Artifact Land')?.normalTopLevelTypes, ['Artifact', 'Land']);
    assert.deepEqual(byName.get('Split Spell')?.normalTopLevelTypes, ['Instant']);
    assert.deepEqual(byName.get('Adventure Creature')?.normalTopLevelTypes, ['Creature']);
    assert.deepEqual(byName.get('Kindred')?.normalTopLevelTypes, ['Kindred']);
    assert.equal(byName.get('Spell // Land')?.hasAlternativeLandFace, true);
    assert.equal(byName.get('Land // Land')?.hasAlternativeLandFace, false);
    assert.deepEqual(Object.keys(byName.get('Spell // Land') ?? {}).sort(), ['canonicalManaValue', 'colorIdentity', 'hasAlternativeLandFace', 'normalTopLevelTypes']);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('rebuilds an invalid active legacy catalog with characteristic-bearing records', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'manalab-'));
  try {
    const legacyGeneration = join(dir, 'generations', 'legacy');
    await mkdir(legacyGeneration, { recursive: true });
    await Promise.all([
      writeFile(join(legacyGeneration, 'catalog.jsonl'), '{"name":"Ordinary Creature"}\n'),
      writeFile(join(legacyGeneration, 'catalog.meta.json'), JSON.stringify({ provider: 'fixture', datasetKind: 'oracle_cards', providerDatasetId: 'legacy', providerUpdatedAt: '2026-01-01T00:00:00Z', sourceDownloadUri: 'fixture', declaredSize: 1, acquiredAt: '2026-01-01T00:00:00Z' })),
      writeFile(join(dir, 'active.json'), JSON.stringify({ generation: 'legacy' })),
    ]);

    const store = new LocalCatalogStore(dir);
    assert.equal(await store.load(), undefined);
    const beforeRebuild = await new LocalCatalogCardReferenceProvider().resolveExactNames(['ordinary creature']);
    assert.notEqual(beforeRebuild.get('ordinary creature')?.kind, 'exact-match');

    assert.equal(await new ScryfallBulkCatalogUpdater(store, fixtureFetcher()).updateIfNewer(), 'updated');
    const rebuilt = await store.load();
    assert.ok(rebuilt);
    assert.deepEqual(rebuilt.cards[0].characteristics.normalTopLevelTypes, ['Creature']);
    const resolved = await new LocalCatalogCardReferenceProvider(loadCatalog(rebuilt)).resolveExactNames(['ordinary creature']);
    assert.equal(resolved.get('ordinary creature')?.kind, 'exact-match');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
