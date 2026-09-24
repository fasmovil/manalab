import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzeDeckStructure } from '../../../src/domain/deck-structural-analysis/analyze-deck-structure.js';
import { characteristics, importResult, resolved } from './test-fixtures.js';

test('uses normalized canonical characteristics for special card forms and overlapping types', () => {
  const analysis = analyzeDeckStructure(importResult([
    resolved('Split Spell', 1, false, characteristics({ canonicalManaValue: 4, normalTopLevelTypes: ['Instant'] })),
    resolved('Adventure Creature', 1, false, characteristics({ canonicalManaValue: 5, normalTopLevelTypes: ['Creature'] })),
    resolved('Variable Cost Spell', 1, false, characteristics({ canonicalManaValue: 1, normalTopLevelTypes: ['Sorcery'] })),
    resolved('Hybrid Cost Enchantment', 1, false, characteristics({ canonicalManaValue: 2, normalTopLevelTypes: ['Enchantment'] })),
    resolved('Spell // Land', 1, false, characteristics({ canonicalManaValue: 3, normalTopLevelTypes: ['Sorcery'], hasAlternativeLandFace: true })),
    resolved('Artifact Creature', 2, false, characteristics({ canonicalManaValue: 4, normalTopLevelTypes: ['Artifact', 'Creature'] })),
    resolved('Basic Land', 1, false, characteristics({ canonicalManaValue: 0, normalTopLevelTypes: ['Land'] })),
  ]));

  assert.equal(analysis.resolvedLandQuantity, 1);
  assert.equal(analysis.resolvedNonlandQuantity, 7);
  assert.deepEqual(analysis.typeComposition, [
    { topLevelType: 'Artifact', quantity: 2 },
    { topLevelType: 'Creature', quantity: 3 },
    { topLevelType: 'Enchantment', quantity: 1 },
    { topLevelType: 'Instant', quantity: 1 },
    { topLevelType: 'Land', quantity: 1 },
    { topLevelType: 'Sorcery', quantity: 2 },
  ]);
  assert.deepEqual(analysis.alternativeLandFaceCards.map(entry => ({ name: entry.identity.canonicalName, quantity: entry.quantity })), [{ name: 'Spell // Land', quantity: 1 }]);
  assert.deepEqual(analysis.manaValue, {
    totalManaValue: 23,
    averageManaValue: { status: 'available', value: 23 / 7 },
    distribution: [
      { manaValue: 1, quantity: 1 }, { manaValue: 2, quantity: 1 }, { manaValue: 3, quantity: 1 },
      { manaValue: 4, quantity: 3 }, { manaValue: 5, quantity: 1 },
    ],
  });
});
