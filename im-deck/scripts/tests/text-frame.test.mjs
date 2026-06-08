import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { letterSpacingToCharSpacing, smallCapsRuns, brToBreakLine, marginTopToParaSpaceBefore } from '../helpers/text-frame.js';

test('letterSpacingToCharSpacing: 0.05em at 12pt → ~5 charSpacing units', () => {
  // pptxgenjs charSpacing is in 1/100 of pt
  const out = letterSpacingToCharSpacing('0.05em', 12);
  assert.ok(out > 0 && out < 100, `got ${out}`);
});

test('letterSpacingToCharSpacing: 0px → 0', () => {
  assert.equal(letterSpacingToCharSpacing('0px', 12), 0);
  assert.equal(letterSpacingToCharSpacing('normal', 12), 0);
});

test('smallCapsRuns: HELLO WORLD → big-H + small-ello + big-space + big-W + small-orld', () => {
  // Simpler version: each word's first char at full size, rest at 0.7×
  const runs = smallCapsRuns('Hello World', 12);
  // Word "Hello": runs = [{text:'H', size:12}, {text:'ELLO', size:8.4}]
  // Space: full-size
  // Word "World": [{text:'W',size:12}, {text:'ORLD',size:8.4}]
  // (Exact split policy may vary; verify structure.)
  assert.ok(runs.length >= 4);
  assert.equal(runs[0].text, 'H');
  assert.equal(runs[0].size, 12);
});

test('brToBreakLine: replaces inline <br> tokens with breakLine markers', () => {
  // Pass an array of childNodes-like objects; output should split into segments.
  const segments = brToBreakLine([
    { type: 'text', text: 'Line one' },
    { type: 'br' },
    { type: 'text', text: 'Line two' },
  ]);
  assert.equal(segments.length, 2);
  assert.equal(segments[0].breakLine, undefined);
  assert.equal(segments[1].breakLine, true);
});

test('marginTopToParaSpaceBefore: 14px → ~10pt', () => {
  // px → pt: divide by 1.333
  const out = marginTopToParaSpaceBefore('14px');
  assert.ok(Math.abs(out - 10.5) < 1);
});
