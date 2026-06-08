import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { parsePseudoContent, isTriangleBorder, parseBorderStyle } from '../helpers/pseudo.js';

test('parsePseudoContent: literal string', () => {
  assert.equal(parsePseudoContent('"—"'), '—');
  assert.equal(parsePseudoContent("'Hello'"), 'Hello');
});

test('parsePseudoContent: counter(item, upper-alpha) → null (handled by caller)', () => {
  // We return a marker so caller can substitute the counter value
  const out = parsePseudoContent('counter(item, upper-alpha)');
  assert.deepEqual(out, { counter: 'item', style: 'upper-alpha' });
});

test('parsePseudoContent: none → null', () => {
  assert.equal(parsePseudoContent('none'), null);
  assert.equal(parsePseudoContent(''), null);
});

test('isTriangleBorder: detects classic CSS border-triangle pattern', () => {
  // border-left: 8px solid black; border-top: 8px solid transparent; border-bottom: 8px solid transparent
  // Width zero AND height zero AND adjacent sides transparent → triangle
  const style = {
    borderTopWidth: '8px', borderTopColor: 'transparent',
    borderRightWidth: '0px', borderRightColor: 'transparent',
    borderBottomWidth: '8px', borderBottomColor: 'transparent',
    borderLeftWidth: '8px', borderLeftColor: '#43817F',
    width: '0px', height: '0px',
  };
  const out = isTriangleBorder(style);
  assert.equal(out.isTriangle, true);
  assert.equal(out.pointsTo, 'right'); // border-left filled → triangle points right
});

test('isTriangleBorder: solid box → false', () => {
  const style = {
    borderTopWidth: '1px', borderRightWidth: '1px', borderBottomWidth: '1px', borderLeftWidth: '1px',
    borderTopColor: '#000', borderRightColor: '#000', borderBottomColor: '#000', borderLeftColor: '#000',
    width: '100px', height: '50px',
  };
  assert.equal(isTriangleBorder(style).isTriangle, false);
});

test('parseBorderStyle: dashed → dash', () => {
  assert.equal(parseBorderStyle('dashed'), 'dash');
  assert.equal(parseBorderStyle('dotted'), 'dash');
  assert.equal(parseBorderStyle('solid'), 'solid');
  assert.equal(parseBorderStyle('none'), null);
});
