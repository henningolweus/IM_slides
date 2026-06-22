#!/usr/bin/env node
import { readFile, writeFile, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import * as cheerio from 'cheerio';

export async function applyFirstdraft(draftPath, storyPath) {
  const draftHtml = await readFile(draftPath, 'utf8');
  const $ = cheerio.load(draftHtml);
  const stateJson = $('#im-first-draft-state').text();
  if (!stateJson) throw new Error(`No #im-first-draft-state in ${draftPath}`);
  const state = JSON.parse(stateJson);

  const storyMd = await readFile(storyPath, 'utf8');
  await copyFile(storyPath, `${storyPath}.before-apply.md`);

  const lines = storyMd.split(/\r?\n/);
  const slideHeader = /^###\s+(\d+)\.\s+(.+?)\s*$/;
  const layoutHintLine = /^\*\*Layout hint:\*\*\s*\S+/;

  let applied = 0, skipped = 0;
  const picksBySlide = Object.fromEntries(state.slides.filter(s => s.user_pick).map(s => [s.index, s.user_pick]));

  let currentSlide = null;
  let hintReplacedForCurrent = false;
  for (let i = 0; i < lines.length; i++) {
    const h = lines[i].match(slideHeader);
    if (h) {
      currentSlide = parseInt(h[1], 10);
      hintReplacedForCurrent = false;
      continue;
    }
    if (currentSlide == null) continue;
    if (picksBySlide[currentSlide] && layoutHintLine.test(lines[i])) {
      lines[i] = `**Layout hint:** ${picksBySlide[currentSlide]}`;
      hintReplacedForCurrent = true;
      applied++;
      continue;
    }
    if (picksBySlide[currentSlide] && !hintReplacedForCurrent && lines[i].trim() === '' && i + 1 < lines.length && !lines[i+1].match(slideHeader) && !layoutHintLine.test(lines[i+1])) {
      lines.splice(i + 1, 0, `**Layout hint:** ${picksBySlide[currentSlide]}`);
      hintReplacedForCurrent = true;
      applied++;
    }
  }

  await writeFile(storyPath, lines.join('\n'), 'utf8');
  return { applied, skipped, backup: `${storyPath}.before-apply.md` };
}

if (import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  const draft = process.argv[2];
  const story = process.argv[3] || draft.replace(/-firstdraft\.html$/, '-story.md');
  if (!draft) { console.error('Usage: node apply-firstdraft.mjs <firstdraft.html> [story.md]'); process.exit(1); }
  const r = await applyFirstdraft(resolve(draft), resolve(story));
  console.log(`Applied ${r.applied} layout pick(s); backup at ${r.backup}`);
}
