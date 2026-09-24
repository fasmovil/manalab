import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzeDeckStructure } from '../../../src/domain/deck-structural-analysis/analyze-deck-structure.js';
import { characteristics, importResult, resolved } from './test-fixtures.js';

test('summarizes multiple resolved commanders deterministically', () => {
  const result = importResult([
    resolved('Azorius Commander', 1, true, characteristics({ canonicalManaValue: 4, normalTopLevelTypes: ['Creature'], colorIdentity: ['W', 'U'] })),
    resolved('Rakdos Commander', 2, true, characteristics({ canonicalManaValue: 3, normalTopLevelTypes: ['Creature'], colorIdentity: ['B', 'R'] })),
    resolved('Library Spell', 3, false, characteristics({ canonicalManaValue: 2, normalTopLevelTypes: ['Instant'] })),
  ]);

  const analysis = analyzeDeckStructure(result);
  assert.deepEqual(analysis.commanders.map(entry => ({ name: entry.identity.canonicalName, quantity: entry.quantity })), [
    { name: 'Azorius Commander', quantity: 1 },
    { name: 'Rakdos Commander', quantity: 2 },
  ]);
  assert.equal(analysis.resolvedCommanderQuantity, 3);
  assert.equal(analysis.resolvedLibraryQuantity, 3);
  assert.deepEqual(analysis.commanderColorIdentity, { status: 'complete', colors: ['W', 'U', 'B', 'R'] });
  assert.deepEqual(analyzeDeckStructure(result), analysis);
});
