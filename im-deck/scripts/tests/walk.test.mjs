import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { hasFlowingText, applyStyleOverrides } from '../helpers/walk.js';

test('hasFlowingText: div with text + inline-formatting children → true', () => {
  // Mock: emulate the DOM api used by the function
  const el = {
    childNodes: [
      { nodeType: 3, textContent: 'Differentiating:' },  // text node
      { nodeType: 1, tagName: 'STRONG', textContent: ' Segments must differ', children: [] },
      { nodeType: 3, textContent: ' meaningfully.' },
    ],
  };
  assert.equal(hasFlowingText(el), true);
});

test('hasFlowingText: div with only element children (no text nodes) → false', () => {
  const el = {
    childNodes: [
      { nodeType: 1, tagName: 'DIV', textContent: 'child1', children: [] },
      { nodeType: 1, tagName: 'DIV', textContent: 'child2', children: [] },
    ],
  };
  assert.equal(hasFlowingText(el), false);
});

test('hasFlowingText: empty div → false', () => {
  assert.equal(hasFlowingText({ childNodes: [] }), false);
  assert.equal(hasFlowingText({ childNodes: [{ nodeType: 3, textContent: '   ' }] }), false);
});

test('applyStyleOverrides: applies font-size override', () => {
  // Builds an "HTML-like" string + state object; returns mutated HTML.
  const html = `<p data-imedit-id="s05-body-0" style="font-size: 12px;">body</p>`;
  const state = { overrides: { 's05-body-0': { 'font-size': '14pt' } } };
  const out = applyStyleOverrides(html, state);
  assert.match(out, /font-size:\s*14pt/);
});

test('applyStyleOverrides: missing data-imedit-id is unchanged', () => {
  const html = `<p>no id</p>`;
  const state = { overrides: { 's05-body-0': { 'font-size': '14pt' } } };
  assert.equal(applyStyleOverrides(html, state), html);
});

test('applyStyleOverrides: applies to all occurrences of the same id', () => {
  const html = `<p data-imedit-id="s05-body-0">first</p><p data-imedit-id="s05-body-0">second</p>`;
  const state = { overrides: { 's05-body-0': { 'font-size': '14pt' } } };
  const out = applyStyleOverrides(html, state);
  const matches = [...out.matchAll(/font-size:\s*14pt/g)];
  assert.equal(matches.length, 2);
});
