import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { extractLiRuns, mapBulletGlyph, flattenNestedUL } from '../helpers/list.js';

test('extractLiRuns: preserves inline strong as bold run', () => {
  // Simulated DOM-light: pass an object with childNodes
  const li = {
    childNodes: [
      { nodeType: 1, tagName: 'STRONG', textContent: 'Differentiating:', childNodes: [{nodeType:3, textContent: 'Differentiating:'}] },
      { nodeType: 3, textContent: ' Segments must differ.' },
    ],
  };
  const runs = extractLiRuns(li);
  assert.equal(runs.length, 2);
  assert.equal(runs[0].text, 'Differentiating:');
  assert.equal(runs[0].bold, true);
  assert.equal(runs[1].text, ' Segments must differ.');
  assert.equal(runs[1].bold, undefined);
});

test('extractLiRuns: nested em inside strong → both flags', () => {
  const li = {
    childNodes: [
      { nodeType: 1, tagName: 'STRONG', textContent: 'bold-em', childNodes: [
        { nodeType: 1, tagName: 'EM', textContent: 'bold-em', childNodes: [{nodeType:3, textContent:'bold-em'}] }
      ]},
    ],
  };
  const runs = extractLiRuns(li);
  assert.equal(runs[0].bold, true);
  assert.equal(runs[0].italic, true);
});

test('extractLiRuns: <br> → breakLine on the next run', () => {
  const li = {
    childNodes: [
      { nodeType: 3, textContent: 'Line one' },
      { nodeType: 1, tagName: 'BR', textContent: '', childNodes: [] },
      { nodeType: 3, textContent: 'Line two' },
    ],
  };
  const runs = extractLiRuns(li);
  assert.equal(runs.length, 2);
  assert.equal(runs[0].text, 'Line one');
  assert.equal(runs[1].text, 'Line two');
  assert.equal(runs[1].breakLine, true);
});

test('mapBulletGlyph: em-dash list-style → code 2014', () => {
  assert.deepEqual(mapBulletGlyph('"\\2014"'), { code: '2014' });
  assert.deepEqual(mapBulletGlyph('"—"'), { code: '2014' });
});

test('mapBulletGlyph: square → code 25A0', () => {
  assert.deepEqual(mapBulletGlyph('square'), { code: '25A0' });
  assert.deepEqual(mapBulletGlyph('"▪"'), { code: '25AA' });
});

test('mapBulletGlyph: default disc → none (use pptxgenjs default)', () => {
  assert.deepEqual(mapBulletGlyph('disc'), { code: '2022' });
  assert.deepEqual(mapBulletGlyph(''), { code: '2022' });
});

test('flattenNestedUL: top-level + nested → separate run groups with level', () => {
  // ul → li (text + nested ul → li, li)
  const ul = {
    children: [
      {
        tagName: 'LI',
        childNodes: [
          { nodeType: 3, textContent: 'top item' },
          { nodeType: 1, tagName: 'UL', children: [
            { tagName: 'LI', childNodes: [{ nodeType: 3, textContent: 'sub a' }] },
            { tagName: 'LI', childNodes: [{ nodeType: 3, textContent: 'sub b' }] },
          ]},
        ],
      },
    ],
  };
  const items = flattenNestedUL(ul);
  assert.equal(items.length, 3);
  assert.equal(items[0].level, 0);
  assert.equal(items[0].runs[0].text, 'top item');
  assert.equal(items[1].level, 1);
  assert.equal(items[1].runs[0].text, 'sub a');
  assert.equal(items[2].level, 1);
});
