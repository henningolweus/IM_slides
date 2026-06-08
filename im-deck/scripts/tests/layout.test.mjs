import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { mapFlexAlign, computePillWidth, expandForText, computeRotatedAnchor } from '../helpers/layout.js';

test('mapFlexAlign: center → middle valign', () => {
  assert.equal(mapFlexAlign({ alignItems: 'center', justifyContent: 'flex-start' }, 'column').valign, 'middle');
  assert.equal(mapFlexAlign({ alignItems: 'center', justifyContent: 'flex-start' }, 'row').align, 'center');
});

test('mapFlexAlign: flex-end → bottom valign', () => {
  assert.equal(mapFlexAlign({ alignItems: 'flex-end', justifyContent: 'flex-start' }, 'column').valign, 'bottom');
});

test('mapFlexAlign: justify-content center on row → center align', () => {
  assert.equal(mapFlexAlign({ alignItems: 'flex-start', justifyContent: 'center' }, 'row').align, 'center');
});

test('computePillWidth: text width + horizontal padding', () => {
  // 8 chars * 8px/char + 16px padding = 80px; allows ±10% tolerance
  const w = computePillWidth({ text: 'Selective', fontSize: 12, paddingLeft: 8, paddingRight: 8 });
  assert.ok(w > 50 && w < 110, `got ${w}`);
});

test('expandForText: increase shape height if estimated lines exceed shape height', () => {
  // Shape height 40px, text would wrap to 3 lines @ 18px line-height = 54px → expand to 54
  const out = expandForText({ shapeHeight: 40, textHeight: 54 });
  assert.ok(out >= 54);
});

test('expandForText: no expansion needed', () => {
  const out = expandForText({ shapeHeight: 40, textHeight: 30 });
  assert.equal(out, 40);
});

test('computeRotatedAnchor: vertical-rl text centered in parent', () => {
  // Parent 200x40, text 100x12 rotated 90deg → centered vertically and horizontally
  const out = computeRotatedAnchor({ parentW: 200, parentH: 40, textW: 100, textH: 12, rotation: 90 });
  // After rotation, the text occupies a vertical strip of width=textH=12, height=textW=100
  // x = (parentW - rotatedW) / 2 = (200 - 12) / 2 = 94
  // y = (parentH - rotatedH) / 2 = (40 - 100) / 2 = -30
  assert.equal(out.x, 94);
  assert.equal(out.y, -30);
});
