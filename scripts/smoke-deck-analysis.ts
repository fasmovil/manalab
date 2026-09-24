import { LocalCatalogCardReferenceProvider, analyzeDeckStructure, importCommanderDeck } from '../src/index.js';
import { loadCatalog } from '../src/adapters/card-reference/local-catalog-loader.js';
import { LocalCatalogStore } from '../src/adapters/card-reference/local-catalog-store.js';
import { importCoverage } from '../src/domain/deck-import/import-coverage.js';
import { catalogDirectory } from './smoke-catalog-config.js';

const decklist = `Commander
1 Aesi, Tyrant of Gyre Strait
Deck
34 Forest
30 Island
1 Command Tower
1 Sol Ring
1 Arcane Signet
1 Simic Signet
1 Talisman of Curiosity
1 Cultivate
1 Kodama's Reach
1 Rampant Growth
1 Farseek
1 Nature's Lore
1 Three Visits
1 Growth Spiral
1 Explore
1 Harrow
1 Sakura-Tribe Elder
1 Coiling Oracle
1 Lotus Cobra
1 Dryad of the Ilysian Grove
1 Oracle of Mul Daya
1 Azusa, Lost but Seeking
1 Wayward Swordtooth
1 Tatyova, Benthic Druid
1 Tireless Provisioner
1 Beast Within
1 Pongify
1 Rapid Hybridization
1 Counterspell
1 Swan Song
1 Cyclonic Rift
1 Rhystic Study
1 Mystic Remora
1 Guardian Project
1 Return of the Wildspeaker
1 Finale of Devastation
1 Worldly Tutor`;

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Smoke assertion failed: ${message}`);
  console.log(`[PASS] ${message}`);
}

function printItems<T>(label: string, items: readonly T[]): void {
  console.log(`- ${label}: ${items.length ? JSON.stringify(items) : '(none)'}`);
}

async function main(): Promise<void> {
  const store = new LocalCatalogStore(catalogDirectory);
  const catalog = await store.load();
  if (!catalog) throw new Error(`No usable catalog at ${catalogDirectory}. Run npm run smoke:catalog first.`);
  const provider = new LocalCatalogCardReferenceProvider(loadCatalog(catalog));
  const imported = await importCommanderDeck(decklist, provider);
  const importSummary = importCoverage(imported);
  const commanders = imported.resolvedContent.filter(entry => entry.commanderDesignated).map(entry => ({ name: entry.identity.canonicalName, quantity: entry.quantity }));
  const evidenceVersions = [...new Set(imported.resolvedContent.flatMap(entry => entry.resolutionEvidence.cardDataVersion ? [entry.resolutionEvidence.cardDataVersion] : []))].sort();

  console.log('=== Scryfall / Catalog ===');
  console.log(`- catalog directory: ${catalogDirectory}`);
  console.log(`- catalog cards: ${catalog.cards.length}`);
  console.log(`- card-data version: ${catalog.provenance.providerDatasetId}:${catalog.provenance.providerUpdatedAt}`);

  console.log('\n=== Feature 001: Commander Deck Import ===');
  console.log(`- declared/imported card quantity: ${importSummary.importedCardQuantity}`);
  console.log(`- resolved quantity: ${importSummary.resolvedCardQuantity}`);
  console.log(`- unresolved quantity: ${importSummary.unresolvedCardQuantity}`);
  printItems('resolved commander(s)', commanders);
  printItems('resolution problems', imported.problems.map(problem => ({ category: problem.category, line: problem.sourceEntry.lineNumber, name: problem.sourceEntry.suppliedName, explanation: problem.explanation })));
  printItems('card-data evidence/version information', evidenceVersions);

  const analysis = analyzeDeckStructure(imported);
  console.log('\n=== Feature 002: Deck Structural Analysis ===');
  console.log(`- coverage status: ${analysis.coverage.status}`);
  console.log(`- imported quantity: ${analysis.coverage.importedCardQuantity}`);
  console.log(`- resolved quantity: ${analysis.coverage.resolvedCardQuantity}`);
  console.log(`- unresolved quantity: ${analysis.coverage.unresolvedCardQuantity}`);
  console.log(`- resolved commander quantity: ${analysis.resolvedCommanderQuantity}`);
  console.log(`- resolved library quantity: ${analysis.resolvedLibraryQuantity}`);
  printItems('commander list', analysis.commanders.map(entry => ({ name: entry.identity.canonicalName, quantity: entry.quantity })));
  console.log(`- Commander color identity: ${analysis.commanderColorIdentity.status} ${JSON.stringify(analysis.commanderColorIdentity.colors)}`);
  console.log(`- resolved land quantity: ${analysis.resolvedLandQuantity}`);
  console.log(`- resolved nonland quantity: ${analysis.resolvedNonlandQuantity}`);
  printItems('top-level type composition', analysis.typeComposition);
  printItems('cards with alternative land faces', analysis.alternativeLandFaceCards.map(entry => ({ name: entry.identity.canonicalName, quantity: entry.quantity })));
  console.log(`- total mana value: ${analysis.manaValue.totalManaValue}`);
  console.log(`- average mana value: ${analysis.manaValue.averageManaValue.status === 'available' ? analysis.manaValue.averageManaValue.value : 'unavailable'}`);
  printItems('exact mana-value distribution', analysis.manaValue.distribution);
  printItems('card-data versions used', analysis.cardDataVersionsUsed);

  console.log('\n=== Smoke Assertions ===');
  invariant(importSummary.importedCardQuantity > 0, 'imported quantity is greater than zero');
  invariant(importSummary.resolvedCardQuantity > 0, 'at least one card resolved');
  invariant(commanders.length > 0, 'at least one commander resolved');
  invariant(analysis.resolvedLandQuantity + analysis.resolvedNonlandQuantity === analysis.coverage.resolvedCardQuantity, 'resolved land plus nonland quantity equals resolved quantity');
  if (analysis.resolvedNonlandQuantity > 0) {
    invariant(analysis.manaValue.distribution.length > 0, 'nonland cards produce a mana-value distribution');
    invariant(analysis.manaValue.averageManaValue.status === 'available', 'nonland cards produce an available average mana value');
  }
}

main().catch(error => {
  console.error('=== ManaLab Deck Smoke: FAILED ===');
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
