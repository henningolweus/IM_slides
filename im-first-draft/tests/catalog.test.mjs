import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalog, layoutsForTags, normaliseLayoutHint } from '../scripts/catalog.mjs';

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

test('normaliseLayoutHint handles canonical names', async () => {
  const cat = await loadCatalog();
  assert.equal(normaliseLayoutHint('two-panel', cat), 'two-panel');
  assert.equal(normaliseLayoutHint('cover', cat), 'cover');
});

test('normaliseLayoutHint handles descriptive hints from real story files', async () => {
  const cat = await loadCatalog();
  assert.equal(normaliseLayoutHint('Full-width body text (exercise brief)', cat), 'full-width-body');
  assert.equal(normaliseLayoutHint('Section divider', cat), 'section-divider');
  assert.equal(normaliseLayoutHint('Pull quote', cat), 'pull-quote');
  assert.equal(normaliseLayoutHint('photo-left / purpose-right', cat), 'purpose-photo-left');
  assert.equal(normaliseLayoutHint('Two-panel framework', cat), 'two-panel');
  assert.equal(normaliseLayoutHint('Two-panel', cat), 'two-panel');
});

test('normaliseLayoutHint returns null for unrecognised hints', async () => {
  const cat = await loadCatalog();
  assert.equal(normaliseLayoutHint('totally made up layout', cat), null);
});
