import type { ColorIdentitySymbol } from '../cards/card-characteristics.js';
import { importCoverage, type ImportCoverage } from '../deck-import/import-coverage.js';
import type { ImportResult, ResolvedDeckContent } from '../deck-import/import-result.js';

export type AverageManaValue = { status: 'available'; value: number } | { status: 'unavailable' };
export interface StructuralAnalysis {
  coverage: ImportCoverage;
  declaredDeckCardQuantity: number;
  commanders: { identity: ResolvedDeckContent['identity']; quantity: number }[];
  resolvedCommanderQuantity: number;
  resolvedLibraryQuantity: number;
  commanderColorIdentity: { status: 'complete' | 'incomplete' | 'unavailable'; colors: ColorIdentitySymbol[] };
  resolvedLandQuantity: number;
  resolvedNonlandQuantity: number;
  typeComposition: { topLevelType: string; quantity: number }[];
  alternativeLandFaceCards: { identity: ResolvedDeckContent['identity']; quantity: number }[];
  manaValue: { totalManaValue: number; averageManaValue: AverageManaValue; distribution: { manaValue: number; quantity: number }[] };
  cardDataVersionsUsed: string[];
}
const colorOrder: ColorIdentitySymbol[] = ['W', 'U', 'B', 'R', 'G'];
export function analyzeDeckStructure(result: ImportResult): StructuralAnalysis {
  const coverage = importCoverage(result); let commanderQuantity = 0, libraryQuantity = 0, lands = 0, nonlands = 0, totalManaValue = 0;
  const types = new Map<string, number>(), curve = new Map<number, number>(), colors = new Set<ColorIdentitySymbol>(), versions = new Set<string>();
  const commanders: StructuralAnalysis['commanders'] = [], alternativeLandFaceCards: StructuralAnalysis['alternativeLandFaceCards'] = [];
  for (const entry of result.resolvedContent) {
    if (entry.commanderDesignated) { commanderQuantity += entry.quantity; commanders.push({ identity: entry.identity, quantity: entry.quantity }); entry.characteristics.colorIdentity.forEach(color => colors.add(color)); } else libraryQuantity += entry.quantity;
    if (entry.resolutionEvidence.cardDataVersion) versions.add(entry.resolutionEvidence.cardDataVersion);
    for (const type of entry.characteristics.normalTopLevelTypes) types.set(type, (types.get(type) ?? 0) + entry.quantity);
    const land = entry.characteristics.normalTopLevelTypes.includes('Land');
    if (land) lands += entry.quantity; else { nonlands += entry.quantity; totalManaValue += entry.characteristics.canonicalManaValue * entry.quantity; curve.set(entry.characteristics.canonicalManaValue, (curve.get(entry.characteristics.canonicalManaValue) ?? 0) + entry.quantity); if (entry.characteristics.hasAlternativeLandFace) alternativeLandFaceCards.push({ identity: entry.identity, quantity: entry.quantity }); }
  }
  const colorStatus = coverage.hasUnresolvedCommander ? 'incomplete' : commanders.length ? 'complete' : 'unavailable';
  return { coverage, declaredDeckCardQuantity: coverage.importedCardQuantity, commanders, resolvedCommanderQuantity: commanderQuantity, resolvedLibraryQuantity: libraryQuantity, commanderColorIdentity: { status: colorStatus, colors: colorOrder.filter(color => colors.has(color)) }, resolvedLandQuantity: lands, resolvedNonlandQuantity: nonlands, typeComposition: [...types].map(([topLevelType, quantity]) => ({ topLevelType, quantity })).sort((a, b) => a.topLevelType.localeCompare(b.topLevelType)), alternativeLandFaceCards, manaValue: { totalManaValue, averageManaValue: nonlands ? { status: 'available', value: totalManaValue / nonlands } : { status: 'unavailable' }, distribution: [...curve].map(([manaValue, quantity]) => ({ manaValue, quantity })).sort((a, b) => a.manaValue - b.manaValue) }, cardDataVersionsUsed: [...versions].sort() };
}
