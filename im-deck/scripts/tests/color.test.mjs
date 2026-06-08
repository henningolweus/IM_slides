import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { parseCssColor, blendOver, resolveBackdrop, parseGradient } from '../helpers/color.js';

test('parseCssColor: rgb() → hex', () => {
  assert.deepEqual(parseCssColor('rgb(67, 129, 127)'), { hex: '43817F', alpha: 1 });
});

test('parseCssColor: rgba() with alpha', () => {
  const out = parseCssColor('rgba(255, 255, 255, 0.05)');
  assert.equal(out.hex, 'FFFFFF');
  assert.ok(Math.abs(out.alpha - 0.05) < 0.001);
});

test('parseCssColor: transparent → null', () => {
  assert.equal(parseCssColor('rgba(0, 0, 0, 0)'), null);
  assert.equal(parseCssColor('transparent'), null);
});

test('parseCssColor: #hex passthrough', () => {
  assert.deepEqual(parseCssColor('#43817F'), { hex: '43817F', alpha: 1 });
  assert.deepEqual(parseCssColor('#abc'), { hex: 'AABBCC', alpha: 1 });
});

test('blendOver: 5% white on dark teal → dark teal', () => {
  const out = blendOver({ hex: 'FFFFFF', alpha: 0.05 }, '303B3F');
  // 0.05 * 255 + 0.95 * 48 = 12.75 + 45.6 = 58.35 → 3A
  assert.match(out, /^[34][AB]4[4-6][4-6][89A]$/i); // approximate
});

test('blendOver: full opacity returns foreground unchanged', () => {
  const out = blendOver({ hex: 'FFFFFF', alpha: 1 }, '303B3F');
  assert.equal(out, 'FFFFFF');
});

test('blendOver: zero opacity returns backdrop unchanged', () => {
  const out = blendOver({ hex: 'FFFFFF', alpha: 0 }, '303B3F');
  assert.equal(out, '303B3F');
});

test('resolveBackdrop: walks ancestors to find opaque background', () => {
  // Mock ancestor chain: child (transparent) → parent (rgba 0.5) → grandparent (solid)
  const chain = [
    { bg: { hex: '000000', alpha: 0 } },        // transparent (skip)
    { bg: { hex: 'FFFFFF', alpha: 0.5 } },      // semi (record but keep walking)
    { bg: { hex: '303B3F', alpha: 1 } },        // opaque (stop)
  ];
  // Should blend: walk back outward — opaque is the final backdrop
  const result = resolveBackdrop(chain);
  assert.equal(result, '303B3F'); // the first opaque ancestor's color
});

test('resolveBackdrop: no opaque ancestor → fallback white', () => {
  const chain = [{ bg: { hex: '000000', alpha: 0.1 } }];
  assert.equal(resolveBackdrop(chain, 'FFFFFF'), 'FFFFFF');
});

test('parseGradient: linear-gradient → midpoint color', () => {
  const out = parseGradient('linear-gradient(90deg, rgb(160,180,180) 0%, rgb(80,100,100) 100%)');
  // Midpoint approx (160+80)/2=120 hex 78, (180+100)/2=140 hex 8C, (180+100)/2=140 hex 8C
  assert.equal(out, '788C8C');
});

test('parseGradient: not a gradient → null', () => {
  assert.equal(parseGradient('none'), null);
  assert.equal(parseGradient('url(...)'), null);
});
