import assert from 'node:assert/strict'; import test from 'node:test'; import { parseDeckList } from '../../../src/domain/deck-import/parse-deck-list.js';
test('marks unsupported numeric quantity as invalid', () => { const result = parseDeckList('-1 Sol Ring'); assert.equal(result.problems[0].category, 'invalid-quantity'); });
test('reports comments as unsupported syntax before resolution', () => { const result = parseDeckList('# deck note'); assert.equal(result.problems[0].category, 'unsupported-syntax'); });
