import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateFirstdraft } from '../scripts/generate-firstdraft.mjs';
import { readFile } from 'node:fs/promises';
import * as cheerio from 'cheerio';

test('generateFirstdraft produces HTML with one thumbnail per slide', async () => {
  const md = await readFile('tests/fixtures/tiny-story.md', 'utf8');
  const html = await generateFirstdraft(md, 'tiny-story.md');
  const $ = cheerio.load(html);
  assert.equal($('.ifd-slide-card').length, 3);
});

test('generateFirstdraft embeds the state JSON with candidates per slide', async () => {
  const md = await readFile('tests/fixtures/tiny-story.md', 'utf8');
  const html = await generateFirstdraft(md, 'tiny-story.md');
  const $ = cheerio.load(html);
  const stateScript = $('#im-first-draft-state').text();
  const state = JSON.parse(stateScript);
  assert.equal(state.slides.length, 3);
  assert.equal(state.slides[1].current_layout, 'iconic-3-column');
  assert.ok(state.slides[1].candidates.length > 0);
});

test('generateFirstdraft includes the real-examples DOM slot in the modal', async () => {
  const md = await readFile('tests/fixtures/tiny-story.md', 'utf8');
  const html = await generateFirstdraft(md, 'tiny-story.md');
  assert.match(html, /class="ifd-real-examples"\s+data-slot/);
});

test('generateFirstdraft inlines the correct thumbnail for each layout', async () => {
  const md = await readFile('tests/fixtures/tiny-story.md', 'utf8');
  const html = await generateFirstdraft(md, 'tiny-story.md');
  const $ = cheerio.load(html);
  const slide2 = $('.ifd-slide-card').eq(1);
  const html2 = slide2.html();
  const circles = (html2.match(/border-radius:50%/g) || []).length;
  assert.ok(circles >= 3, `expected >=3 circles, got ${circles}`);
});
