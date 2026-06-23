import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { applyFirstdraft, applyPicksJson } from '../scripts/apply-firstdraft.mjs';

test('applyFirstdraft updates the layout hint for picked slides', async () => {
  const tmp = join(tmpdir(), `ifd-apply-${Date.now()}`);
  const storyPath = `${tmp}-story.md`;
  const draftPath = `${tmp}-firstdraft.html`;

  await writeFile(storyPath, [
    '### 1. Cover',
    '- Title: x',
    '',
    '### 2. **Two-panel slide** | text',
    '**Layout hint:** two-panel',
    '- left',
    '- right',
    ''
  ].join('\n'), 'utf8');

  const state = {
    version: 1,
    story_file: `${tmp}-story.md`,
    generated_at: '2026-06-22T00:00:00Z',
    slides: [
      { index: 1, title: 'Cover', current_layout: 'cover', candidates: ['cover'] },
      { index: 2, title: 'Two-panel slide | text', current_layout: 'comparison-table', candidates: ['two-panel','comparison-table'], user_pick: 'comparison-table' }
    ]
  };
  await writeFile(draftPath, `<html><body><script id="im-first-draft-state" type="application/json">${JSON.stringify(state)}</script></body></html>`, 'utf8');

  const summary = await applyFirstdraft(draftPath, storyPath);
  assert.equal(summary.applied, 1);

  const updated = await readFile(storyPath, 'utf8');
  assert.match(updated, /\*\*Layout hint:\*\* comparison-table/);
  assert.doesNotMatch(updated, /\*\*Layout hint:\*\* two-panel/);

  const backup = await readFile(`${storyPath}.before-apply.md`, 'utf8');
  assert.match(backup, /\*\*Layout hint:\*\* two-panel/);

  await rm(storyPath, { force: true });
  await rm(`${storyPath}.before-apply.md`, { force: true });
  await rm(draftPath, { force: true });
});

test('applyPicksJson updates layout hints from a parsed picks payload', async () => {
  const tmp = join(tmpdir(), `ifd-picks-${Date.now()}`);
  const storyPath = `${tmp}-story.md`;

  await writeFile(storyPath, [
    '### 4. Intro',
    '- Title: hello',
    '',
    '### 5. **Three icons** | iconic',
    '**Layout hint:** two-panel',
    '- a',
    '- b',
    '- c',
    ''
  ].join('\n'), 'utf8');

  const payload = { picks: [{ index: 5, layout: 'iconic-3-column' }] };
  const summary = await applyPicksJson(payload, storyPath);
  assert.equal(summary.applied, 1);

  const updated = await readFile(storyPath, 'utf8');
  assert.match(updated, /\*\*Layout hint:\*\* iconic-3-column/);
  assert.doesNotMatch(updated, /\*\*Layout hint:\*\* two-panel/);

  await rm(storyPath, { force: true });
  await rm(`${storyPath}.before-apply.md`, { force: true });
});
