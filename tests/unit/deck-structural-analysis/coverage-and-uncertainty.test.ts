import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzeDeckStructure } from '../../../src/domain/deck-structural-analysis/analyze-deck-structure.js';
import { characteristics, importResult, resolved, unresolvedProblem } from './test-fixtures.js';

test('reports partial coverage and unavailable mana averages from normalized import data', () => {
  const analysis = analyzeDeckStructure(importResult([
    resolved('Forest', 1, false, characteristics({ canonicalManaValue: 0, normalTopLevelTypes: ['Land'] })),
  ], [unresolvedProblem(1, true)]));

  assert.deepEqual(analysis.coverage, { importedCardQuantity: 2, resolvedCardQuantity: 1, unresolvedCardQuantity: 1, hasUnresolvedCommander: true, status: 'partial' });
  assert.deepEqual(analysis.commanderColorIdentity, { status: 'incomplete', colors: [] });
  assert.deepEqual(analysis.manaValue, { totalManaValue: 0, averageManaValue: { status: 'unavailable' }, distribution: [] });
});

test('returns a complete, empty structural analysis without inventing commander facts', () => {
  const analysis = analyzeDeckStructure(importResult([]));

  assert.deepEqual(analysis.coverage, { importedCardQuantity: 0, resolvedCardQuantity: 0, unresolvedCardQuantity: 0, hasUnresolvedCommander: false, status: 'complete' });
  assert.equal(analysis.declaredDeckCardQuantity, 0);
  assert.deepEqual(analysis.commanders, []);
  assert.equal(analysis.resolvedCommanderQuantity, 0);
  assert.equal(analysis.resolvedLibraryQuantity, 0);
  assert.deepEqual(analysis.commanderColorIdentity, { status: 'unavailable', colors: [] });
  assert.equal(analysis.resolvedLandQuantity, 0);
  assert.equal(analysis.resolvedNonlandQuantity, 0);
  assert.deepEqual(analysis.typeComposition, []);
  assert.deepEqual(analysis.alternativeLandFaceCards, []);
  assert.deepEqual(analysis.manaValue, { totalManaValue: 0, averageManaValue: { status: 'unavailable' }, distribution: [] });
});
