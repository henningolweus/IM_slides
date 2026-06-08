import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { detectClipPathChevron, mapBorderRadius, detectSvgStrokeOnly } from '../helpers/shapes.js';

test('detectClipPathChevron: right-pointing chevron → chevron + 0deg', () => {
  const cp = 'polygon(0% 0%, calc(100% - 12px) 0%, 100% 50%, calc(100% - 12px) 100%, 0% 100%)';
  const out = detectClipPathChevron(cp);
  assert.equal(out.shape, 'chevron');
  assert.equal(out.rotation, 0);
});

test('detectClipPathChevron: left-pointing → chevron + 180deg', () => {
  const cp = 'polygon(12px 0%, 100% 0%, 100% 100%, 12px 100%, 0% 50%)';
  const out = detectClipPathChevron(cp);
  assert.equal(out.shape, 'chevron');
  assert.equal(out.rotation, 180);
});

test('detectClipPathChevron: triangle clip → triangle', () => {
  const cp = 'polygon(50% 0%, 0% 100%, 100% 100%)';
  const out = detectClipPathChevron(cp);
  assert.equal(out.shape, 'triangle');
});

test('detectClipPathChevron: not a chevron pattern → null', () => {
  assert.equal(detectClipPathChevron('none'), null);
  assert.equal(detectClipPathChevron('inset(10px)'), null);
});

test('mapBorderRadius: small → keep small', () => {
  assert.equal(mapBorderRadius('4px', 100, 50), 4);
  assert.equal(mapBorderRadius('0px', 100, 50), 0);
});

test('mapBorderRadius: percentage → ratio of min dimension', () => {
  assert.equal(mapBorderRadius('50%', 100, 50), 25);
});

test('detectSvgStrokeOnly: fill="none" stroke="#000" → strokeOnly true', () => {
  assert.equal(detectSvgStrokeOnly({ fill: 'none', stroke: '#000' }), true);
  assert.equal(detectSvgStrokeOnly({ fill: 'none' }), true); // stroke implicit from currentColor
});

test('detectSvgStrokeOnly: fill="#000" → false', () => {
  assert.equal(detectSvgStrokeOnly({ fill: '#000', stroke: '#000' }), false);
});
