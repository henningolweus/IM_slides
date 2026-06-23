#!/usr/bin/env node
import { readFile, writeFile, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import * as cheerio from 'cheerio';

// Rewrite **Layout hint:** lines in a story.md for a given { index → layout } map.
// Writes a backup of the original to <storyPath>.before-apply.md.
export async function applyPicksToStory(picksByIndex, storyPath) {
  const storyMd = await readFile(storyPath, 'utf8');
  await copyFile(storyPath, `${storyPath}.before-apply.md`);

  const lines = storyMd.split(/\r?\n/);
  const slideHeader = /^###\s+(\d+)\.\s+(.+?)\s*$/;
  const layoutHintLine = /^\*\*Layout hint:\*\*\s*\S+/;

  let applied = 0;
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
    if (picksByIndex[currentSlide] && layoutHintLine.test(lines[i])) {
      lines[i] = `**Layout hint:** ${picksByIndex[currentSlide]}`;
      hintReplacedForCurrent = true;
      applied++;
      continue;
    }
    if (picksByIndex[currentSlide] && !hintReplacedForCurrent && lines[i].trim() === '' && i + 1 < lines.length && !lines[i+1].match(slideHeader) && !layoutHintLine.test(lines[i+1])) {
      lines.splice(i + 1, 0, `**Layout hint:** ${picksByIndex[currentSlide]}`);
      hintReplacedForCurrent = true;
      applied++;
    }
  }

  await writeFile(storyPath, lines.join('\n'), 'utf8');
  return { applied, backup: `${storyPath}.before-apply.md` };
}

// Apply picks from a firstdraft.html (the HTML embeds the state JSON).
export async function applyFirstdraft(draftPath, storyPath) {
  const draftHtml = await readFile(draftPath, 'utf8');
  const $ = cheerio.load(draftHtml);
  const stateJson = $('#im-first-draft-state').text();
  if (!stateJson) throw new Error(`No #im-first-draft-state in ${draftPath}`);
  const state = JSON.parse(stateJson);
  const picksByIndex = Object.fromEntries(
    state.slides.filter(s => s.user_pick).map(s => [s.index, s.user_pick])
  );
  return applyPicksToStory(picksByIndex, storyPath);
}

// Apply picks from a JSON payload (the shape produced by the "Copy picks" button).
// payload: { story_file?, picks: [{ index, layout }, ...] }
export async function applyPicksJson(payload, storyPath) {
  if (!payload || !Array.isArray(payload.picks)) {
    throw new Error('applyPicksJson: payload must have a .picks array');
  }
  const picksByIndex = Object.fromEntries(payload.picks.map(p => [p.index, p.layout]));
  return applyPicksToStory(picksByIndex, storyPath);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const picksJsonIdx = args.indexOf('--picks-json');
  if (picksJsonIdx >= 0) {
    const story = args[0];
    const json = args[picksJsonIdx + 1];
    if (!story || !json) {
      console.error('Usage: node apply-firstdraft.mjs <story.md> --picks-json \'{"picks":[...]}\'');
      process.exit(1);
    }
    const payload = JSON.parse(json);
    const r = await applyPicksJson(payload, resolve(story));
    console.log(`Applied ${r.applied} layout pick(s) from JSON; backup at ${r.backup}`);
  } else {
    const draft = args[0];
    const story = args[1] || (draft ? draft.replace(/-firstdraft\.html$/, '-story.md') : null);
    if (!draft) {
      console.error('Usage:');
      console.error('  node apply-firstdraft.mjs <firstdraft.html> [story.md]');
      console.error('  node apply-firstdraft.mjs <story.md> --picks-json \'<json>\'');
      process.exit(1);
    }
    const r = await applyFirstdraft(resolve(draft), resolve(story));
    console.log(`Applied ${r.applied} layout pick(s); backup at ${r.backup}`);
  }
}
