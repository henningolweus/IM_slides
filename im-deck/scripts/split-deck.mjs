#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, basename } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as cheerio from 'cheerio';
import { applyStyleOverrides } from './helpers/walk.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function checkDeps() {
  if (!existsSync(join(__dirname, 'node_modules', 'cheerio'))) {
    console.error('Missing dependency: cheerio');
    console.error(`Run: cd "${__dirname}" && npm install`);
    process.exit(1);
  }
}

checkDeps();

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { deck: null, outDir: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--deck') out.deck = args[++i];
    else if (args[i] === '--out') out.outDir = args[++i];
  }
  if (!out.deck || !out.outDir) {
    console.error('Usage: node split-deck.mjs --deck <deck.html> --out <slides-dir>');
    process.exit(1);
  }
  return out;
}

function slugify(text, maxLen = 30) {
  return (text || 'slide')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, maxLen) || 'slide';
}

async function main() {
  const { deck, outDir } = parseArgs();
  const deckPath = resolve(deck);
  const outPath = resolve(outDir);

  const html = await readFile(deckPath, 'utf8');

  // Extract im-edit state JSON if present and apply overrides
  const stateMatch = /<script id="im-edit-state"[^>]*>([\s\S]*?)<\/script>/.exec(html);
  let appliedHtml = html;
  if (stateMatch) {
    try {
      const state = JSON.parse(stateMatch[1]);
      appliedHtml = applyStyleOverrides(html, state);
    } catch (e) {
      console.warn(`im-edit state JSON malformed, skipping overrides: ${e.message}`);
    }
  }
  const $ = cheerio.load(appliedHtml, { decodeEntities: false });

  const styleEl = $('style').first();
  if (!styleEl.length) {
    console.error('No <style> block found in deck HTML.');
    process.exit(1);
  }
  const styleContent = styleEl.html();

  const slides = $('section.slide');
  if (slides.length === 0) {
    console.error('No <section class="slide"> elements found in deck HTML.');
    process.exit(1);
  }

  await mkdir(outPath, { recursive: true });

  // Collect outputs first (cheerio's .each() doesn't support async)
  const outputs = [];
  slides.each((i, el) => {
    const $slide = $(el);
    $slide.removeClass('active').addClass('active');

    const titleText = $slide.find('h2.action-title, h1, .div-title, .purpose-heading')
      .first()
      .text()
      .trim();
    const slug = slugify(titleText.split('|').pop().trim() || $slide.attr('class'));
    const num = String(i + 1).padStart(3, '0');
    const filename = `${num}-${slug}.html`;

    const slideHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${slug}</title>
<style>${styleContent}</style>
<style>
  /* per-slide canvas overrides for PPTX export */
  html, body { margin: 0; padding: 0; width: 1280px; height: 720px; overflow: hidden; background: white; }
  .deck { width: 1280px; height: 720px; position: relative; transform: none !important; margin: 0 !important; }
  section.slide { width: 1280px !important; height: 720px !important; position: absolute !important; top: 0 !important; left: 0 !important; transform: none !important; display: flex !important; flex-direction: column !important; }
  section.slide > .content-wrap { flex: 1 1 auto !important; display: flex !important; flex-direction: column !important; min-height: 0 !important; }
  section.slide .pull-quote-slide { flex: 1 1 auto !important; }
  section.slide.slide-cover { display: grid !important; grid-template-columns: 47% 53%; }
  section.slide.slide-cover .cover-left,
  section.slide.slide-cover .cover-right { position: relative !important; width: auto !important; height: 100% !important; }
  /* Keep thin separator <div>s from collapsing inside flex containers */
  .table-label-underline, .panel-sub-underline { flex-shrink: 0 !important; min-height: 1px !important; }
  /* Top-align children inside iconic-cards; restore vertical breathing room with explicit gap */
  section.slide .iconic-card { justify-content: flex-start !important; gap: 14px !important; }
  /* iconic-bullets should size to content (no flex-grow), so its bbox equals natural content height */
  section.slide .iconic-bullets { flex: 0 0 auto !important; }
  /* hide nav chrome, modals, im-edit chrome in the per-slide file */
  nav.nav, .print-modal, .ime-toolbar, .ime-comments-panel, .ime-comment-pin, .ime-selection-halo, .ime-comment-popover { display: none !important; }
</style>
</head>
<body>
<div class="deck">
${$.html($slide)}
</div>
</body>
</html>`;

    outputs.push({ filename, content: slideHtml });
  });

  for (const { filename, content } of outputs) {
    const normalized = content.replace(/^﻿/, '');
    await writeFile(resolve(outPath, filename), normalized, 'utf8');
  }

  console.log(`Split ${outputs.length} slides into ${outPath}`);
}

main().catch(err => {
  console.error('split-deck failed:', err.message);
  process.exit(1);
});
