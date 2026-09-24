import type { StoredCatalogCard } from '../../src/adapters/card-reference/local-catalog-store.js';

export const card = (name: string, overrides: Partial<StoredCatalogCard['characteristics']> = {}): StoredCatalogCard => ({ name, characteristics: { canonicalManaValue: 2, normalTopLevelTypes: ['Artifact'], colorIdentity: [], hasAlternativeLandFace: false, ...overrides } });
export const provenance = { provider: 'fixture', datasetKind: 'oracle_cards', providerDatasetId: 'v1', providerUpdatedAt: '2026-01-01T00:00:00Z', sourceDownloadUri: 'fixture', declaredSize: 1, acquiredAt: '2026-01-01T00:00:00Z' };
