import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalog, layoutsForTags } from '../scripts/catalog.mjs';

test('loadCatalog returns all 12 layouts with non-empty tag lists', async () => {
  const cat = await loadCatalog();
  assert.equal(cat.length, 12);
  for (const entry of cat) {
    assert.ok(entry.layout, `entry missing layout name: ${JSON.stringify(entry)}`);
    assert.ok(Array.isArray(entry.tags) && entry.tags.length > 0, `entry ${entry.layout} has no tags`);
  }
});

test('layoutsForTags returns multiple layouts for the comparison tag', async () => {
  const matches = await layoutsForTags(['comparison']);
  const names = matches.map(e => e.layout);
  assert.ok(names.includes('two-panel'));
  assert.ok(names.includes('comparison-table'));
});

test('layoutsForTags excludes a given currentLayout', async () => {
  const matches = await layoutsForTags(['comparison'], 'two-panel');
  assert.ok(!matches.some(e => e.layout === 'two-panel'));
  // Should still include comparison-table
  assert.ok(matches.some(e => e.layout === 'comparison-table'));
});
