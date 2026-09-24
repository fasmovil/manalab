import { Readable } from 'node:stream';
import { createGunzip } from 'node:zlib';
import { createInterface } from 'node:readline';
import type { CardCharacteristics, ColorIdentitySymbol } from '../../domain/cards/card-characteristics.js';
import { LocalCatalogStore, type CatalogProvenance, type StoredCatalogCard } from './local-catalog-store.js';

export interface BulkManifest { id: string; type: string; updated_at: string; jsonl_download_uri: string; compressed_size: number }
export type CatalogUpdateOutcome = 'already-current' | 'updated' | 'update-unavailable-local-usable' | 'no-usable-catalog';
const supertypes = new Set(['Basic', 'Legendary', 'Ongoing', 'Snow', 'World']);
const colors = new Set<ColorIdentitySymbol>(['W', 'U', 'B', 'R', 'G']);
const scryfallRequest = { headers: { 'User-Agent': 'ManaLab/0.1 (local catalog updater)' } };
function topLevelTypes(typeLine: string): string[] { const types = typeLine.split('—')[0].trim().split(/\s+/).filter(type => type && !supertypes.has(type)); if (!types.length) throw new Error('Invalid card type line.'); return [...new Set(types)]; }
function faceTypeLine(face: unknown): string | undefined { return face && typeof face === 'object' && typeof (face as { type_line?: unknown }).type_line === 'string' ? (face as { type_line: string }).type_line : undefined; }
function normalizeCard(value: unknown): StoredCatalogCard {
  if (!value || typeof value !== 'object') throw new Error('Invalid card record.');
  const card = value as { name?: unknown; cmc?: unknown; color_identity?: unknown; type_line?: unknown; card_faces?: unknown };
  if (typeof card.name !== 'string' || !card.name.trim() || typeof card.cmc !== 'number' || !Number.isFinite(card.cmc) || card.cmc < 0 || !Array.isArray(card.color_identity) || !card.color_identity.every(color => typeof color === 'string' && colors.has(color as ColorIdentitySymbol))) throw new Error('Invalid card record.');
  const faces = Array.isArray(card.card_faces) ? card.card_faces : [];
  const normalLine = faceTypeLine(faces[0]) ?? (typeof card.type_line === 'string' ? card.type_line.split('//')[0].trim() : undefined);
  if (!normalLine) throw new Error('Invalid card type line.');
  const normalTopLevelTypes = topLevelTypes(normalLine);
  const characteristics: CardCharacteristics = { canonicalManaValue: card.cmc, normalTopLevelTypes, colorIdentity: [...new Set(card.color_identity as ColorIdentitySymbol[])], hasAlternativeLandFace: !normalTopLevelTypes.includes('Land') && faces.slice(1).some(face => { const line = faceTypeLine(face); return line !== undefined && topLevelTypes(line).includes('Land'); }) };
  return { name: card.name, characteristics };
}
async function streamCards(body: ReadableStream<Uint8Array>): Promise<StoredCatalogCard[]> { const lines = createInterface({ input: Readable.fromWeb(body as never).pipe(createGunzip()), crlfDelay: Infinity }); const cards: StoredCatalogCard[] = []; for await (const line of lines) cards.push(normalizeCard(JSON.parse(line))); return cards; }
export class ScryfallBulkCatalogUpdater {
  constructor(private readonly store: LocalCatalogStore, private readonly fetcher: typeof fetch = fetch) {}
  async updateIfNewer(): Promise<CatalogUpdateOutcome> { const existing = await this.store.load(); try { const response = await this.fetcher('https://api.scryfall.com/bulk-data', scryfallRequest); if (!response.ok) throw new Error('manifest unavailable'); const payload = await response.json() as { data: BulkManifest[] }; const manifest = payload.data.find(d => d.type === 'oracle_cards'); if (!manifest?.jsonl_download_uri || !manifest.compressed_size) throw new Error('unsupported manifest'); const old = existing?.provenance; if (old && old.providerDatasetId === manifest.id && old.providerUpdatedAt === manifest.updated_at && old.sourceDownloadUri === manifest.jsonl_download_uri && old.declaredSize === manifest.compressed_size) return 'already-current'; const data = await this.fetcher(manifest.jsonl_download_uri, scryfallRequest); if (!data.ok || !data.body) throw new Error('dataset unavailable'); const cards = await streamCards(data.body); if (!cards.length) throw new Error('invalid dataset'); const provenance: CatalogProvenance = { provider: 'Scryfall', datasetKind: manifest.type, providerDatasetId: manifest.id, providerUpdatedAt: manifest.updated_at, sourceDownloadUri: manifest.jsonl_download_uri, declaredSize: manifest.compressed_size, acquiredAt: new Date().toISOString() }; await this.store.replace(cards, provenance); return 'updated'; } catch { return existing ? 'update-unavailable-local-usable' : 'no-usable-catalog'; } }
}
