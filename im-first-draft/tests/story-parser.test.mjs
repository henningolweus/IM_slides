import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseStory } from '../scripts/story-parser.mjs';
import { readFile } from 'node:fs/promises';

test('parseStory extracts 3 slides from the tiny fixture', async () => {
  const md = await readFile('tests/fixtures/tiny-story.md', 'utf8');
  const slides = parseStory(md);
  assert.equal(slides.length, 3);
});

test('parseStory captures titles, indices, and layout hints', async () => {
  const md = await readFile('tests/fixtures/tiny-story.md', 'utf8');
  const slides = parseStory(md);
  assert.equal(slides[0].index, 1);
  assert.equal(slides[0].title, 'Cover');
  assert.equal(slides[0].layoutHint, 'cover');
  assert.equal(slides[1].index, 2);
  assert.match(slides[1].title, /Three pillars/);
  assert.equal(slides[1].layoutHint, 'iconic-3-column');
  assert.equal(slides[2].layoutHint, 'two-panel');
});

test('parseStory captures the brief bullets', async () => {
  const md = await readFile('tests/fixtures/tiny-story.md', 'utf8');
  const slides = parseStory(md);
  assert.ok(slides[1].brief.includes('Pillar one'));
});
