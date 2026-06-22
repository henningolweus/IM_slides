#!/usr/bin/env node
import { readFile, writeFile, access } from 'node:fs/promises';
import { resolve, basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseStory } from './story-parser.mjs';
import { loadCatalog, layoutsForTags, normaliseLayoutHint } from './catalog.mjs';
import { renderThumbnail } from './thumbnail-renderer.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, '..', 'assets');
const EXAMPLES_DIR = join(__dirname, '..', '..', 'im-examples');

async function readIfExists(path, fallback = '') {
  try { return await readFile(path, 'utf8'); }
  catch (e) { if (e.code === 'ENOENT') return fallback; throw e; }
}

async function hasExamplesCorpus() {
  try { await access(join(EXAMPLES_DIR, 'manifest.json')); return true; }
  catch { return false; }
}

export async function generateFirstdraft(storyMd, storyFilename) {
  const slides = parseStory(storyMd);
  const catalog = await loadCatalog();
  const catalogByLayout = Object.fromEntries(catalog.map(e => [e.layout, e]));

  const slideState = [];
  const cardHtml = [];

  for (const slide of slides) {
    const normalised = normaliseLayoutHint(slide.layoutHint, catalog);
    const layout = normalised || 'full-width-body';
    const entry = catalogByLayout[layout] || { tags: [] };
    const candidates = (await layoutsForTags(entry.tags, layout)).map(e => e.layout);
    candidates.unshift(layout);

    slideState.push({
      index: slide.index,
      title: slide.title,
      current_layout: layout,
      candidates
    });

    const thumb = await renderThumbnail(layout);
    cardHtml.push(`
<div class="ifd-slide-card" data-slide="${slide.index}" data-layout="${layout}">
  <div class="ifd-slide-meta">
    <span class="ifd-slide-num">${String(slide.index).padStart(2, '0')}</span>
    <span class="ifd-slide-layout-badge">${layout}</span>
  </div>
  <div class="ifd-slide-title" title="${escapeHtml(slide.title)}">${escapeHtml(truncate(slide.title, 90))}</div>
  <div class="ifd-thumb-wrap">${thumb}</div>
</div>`);
  }

  const state = {
    version: 1,
    story_file: storyFilename,
    generated_at: new Date().toISOString(),
    examples_corpus_present: await hasExamplesCorpus(),
    slides: slideState
  };

  const css = await readIfExists(join(ASSETS_DIR, 'sorter.css'));
  const js  = await readIfExists(join(ASSETS_DIR, 'sorter.js'));

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(storyFilename)} — first draft</title>
<style>${css}</style>
</head>
<body>
<header class="ifd-header">
  <div class="ifd-header-title">${escapeHtml(storyFilename.replace(/-story\.md$/, ''))} — first draft</div>
  <div class="ifd-header-meta">
    <span>${slides.length} slides</span>
    <button id="ifd-copy-changes-btn" class="ifd-copy-changes-btn" type="button" title="Copy your changes as JSON to paste in chat">Copy changes <span id="ifd-changes-count" class="ifd-changes-count">0</span></button>
  </div>
</header>
<div class="ifd-toast" id="ifd-toast" hidden></div>
<main class="ifd-grid" id="ifd-grid">
${cardHtml.join('\n')}
</main>

<div class="ifd-modal" id="ifd-modal" hidden>
  <div class="ifd-modal-content">
    <button class="ifd-modal-close" id="ifd-modal-close" aria-label="Close">&times;</button>
    <div class="ifd-modal-header" id="ifd-modal-header">Alternative layouts</div>
    <div class="ifd-modal-candidates" id="ifd-modal-candidates"></div>
    <div class="ifd-real-examples" data-slot></div>
    <div class="ifd-modal-actions">
      <button class="ifd-suggest-more" id="ifd-suggest-more">Suggest something else</button>
    </div>
  </div>
</div>

<script id="im-first-draft-state" type="application/json">${JSON.stringify(state, null, 2)}</script>
<script id="im-first-draft-thumbnails" type="application/json">${JSON.stringify(await loadAllThumbnails(catalog))}</script>
<script>${js}</script>
</body>
</html>`;
}

async function loadAllThumbnails(catalog) {
  const out = {};
  for (const entry of catalog) out[entry.layout] = await renderThumbnail(entry.layout);
  return out;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
function truncate(s, max) { return s.length > max ? s.slice(0, max - 1) + '…' : s; }

if (import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  const storyPath = process.argv[2];
  if (!storyPath) { console.error('Usage: node generate-firstdraft.mjs <path-to-story.md>'); process.exit(1); }
  const storyMd = await readFile(resolve(storyPath), 'utf8');
  const html = await generateFirstdraft(storyMd, basename(storyPath));
  const outPath = resolve(storyPath).replace(/-story\.md$/, '-firstdraft.html');
  await writeFile(outPath, html, 'utf8');
  console.log(`Wrote ${outPath}`);
}
