#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, basename } from 'node:path';
import * as cheerio from 'cheerio';
import { generateFirstdraft } from './generate-firstdraft.mjs';

export async function rerenderFirstdraft(draftPath, storyPath) {
  const previousHtml = await readFile(draftPath, 'utf8').catch(() => null);
  const prevPicks = new Map();
  if (previousHtml) {
    const $ = cheerio.load(previousHtml);
    const stateJson = $('#im-first-draft-state').text();
    if (stateJson) {
      const state = JSON.parse(stateJson);
      for (const s of state.slides) {
        if (s.user_pick) prevPicks.set(normaliseTitle(s.title), s.user_pick);
      }
    }
  }
  const storyMd = await readFile(storyPath, 'utf8');
  let html = await generateFirstdraft(storyMd, basename(storyPath));
  if (prevPicks.size > 0) {
    const $ = cheerio.load(html);
    const stateEl = $('#im-first-draft-state');
    const state = JSON.parse(stateEl.text());
    for (const slide of state.slides) {
      const prev = prevPicks.get(normaliseTitle(slide.title));
      if (prev && slide.candidates.includes(prev)) {
        slide.user_pick = prev;
        slide.current_layout = prev;
      }
    }
    stateEl.text(JSON.stringify(state, null, 2));
    html = '<!DOCTYPE html>\n' + $.html();
  }
  return html;
}

function normaliseTitle(t) { return t.replace(/\s+/g, ' ').trim().toLowerCase(); }

if (import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  const story = process.argv[2];
  if (!story) { console.error('Usage: node rerender-firstdraft.mjs <story.md>'); process.exit(1); }
  const draft = resolve(story).replace(/-story\.md$/, '-firstdraft.html');
  const html = await rerenderFirstdraft(draft, resolve(story));
  await writeFile(draft, html, 'utf8');
  console.log(`Re-rendered ${draft}`);
}
