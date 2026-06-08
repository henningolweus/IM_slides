import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { stableSortByZ } from '../helpers/z-order.js';

test('stableSortByZ: z=0 stable in DOM order', () => {
  const xs = [
    { domIndex: 0, z: 0, label: 'a' },
    { domIndex: 1, z: 0, label: 'b' },
    { domIndex: 2, z: 0, label: 'c' },
  ];
  const sorted = stableSortByZ(xs);
  assert.deepEqual(sorted.map(x => x.label), ['a', 'b', 'c']);
});

test('stableSortByZ: higher z paints last', () => {
  const xs = [
    { domIndex: 0, z: 5, label: 'top' },
    { domIndex: 1, z: 0, label: 'bottom' },
  ];
  const sorted = stableSortByZ(xs);
  assert.deepEqual(sorted.map(x => x.label), ['bottom', 'top']);
});

test('stableSortByZ: tie-break by DOM order', () => {
  const xs = [
    { domIndex: 2, z: 1, label: 'c' },
    { domIndex: 0, z: 1, label: 'a' },
    { domIndex: 1, z: 1, label: 'b' },
  ];
  const sorted = stableSortByZ(xs);
  assert.deepEqual(sorted.map(x => x.label), ['a', 'b', 'c']);
});

test('stableSortByZ: negative z renders first', () => {
  const xs = [
    { domIndex: 0, z: 0, label: 'a' },
    { domIndex: 1, z: -1, label: 'behind' },
    { domIndex: 2, z: 0, label: 'c' },
  ];
  const sorted = stableSortByZ(xs);
  assert.deepEqual(sorted.map(x => x.label), ['behind', 'a', 'c']);
});
