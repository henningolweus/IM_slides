#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

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
  const out = { deck: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--deck') out.deck = args[++i];
  }
  if (!out.deck) {
    console.error('Usage: node inject-chrome.mjs --deck <deck.html>');
    process.exit(1);
  }
  return out;
}

async function main() {
  const { deck } = parseArgs();
  const deckPath = resolve(deck);

  let html;
  try { html = await readFile(deckPath, 'utf8'); }
  catch (e) { console.error(`Cannot read deck: ${deckPath}: ${e.message}`); process.exit(1); }
  // Strip any leading UTF-8 BOM to keep downstream parsers stable
  if (html.charCodeAt(0) === 0xFEFF) html = html.slice(1);
  if (!/<meta\s+charset=["']?utf-8/i.test(html)) {
    console.warn('[inject-chrome] Deck HTML is missing <meta charset="UTF-8"> — injecting one.');
    html = html.replace(/<head([^>]*)>/i, '<head$1>\n<meta charset="UTF-8">');
  }

  const $ = cheerio.load(html, { decodeEntities: false });

  if ($('div.deck#deck').length === 0) {
    console.error('Not an im-deck output: missing <div class="deck" id="deck">');
    process.exit(1);
  }
  if ($('section.slide').length === 0) {
    console.error('Not an im-deck output: no <section class="slide"> elements');
    process.exit(1);
  }

  if ($('#im-edit-state').length > 0 || $('#ime-toolbar').length > 0) {
    console.log('Chrome already present; nothing to do. (To re-inject, run strip-chrome first.)');
    process.exit(0);
  }

  const cssPath = join(__dirname, '..', 'assets', 'chrome.css');
  const jsPath = join(__dirname, '..', 'assets', 'chrome.js');
  const catPath = join(__dirname, '..', 'assets', 'style-catalogue.json');

  const chromeCss = await readFile(cssPath, 'utf8');
  const chromeJs = await readFile(jsPath, 'utf8');
  const catalogueJson = await readFile(catPath, 'utf8');

  const initialState = {
    version: 1,
    created_at: new Date().toISOString(),
    styles: {},
    comments: [],
    edits: []
  };

  const injection = `
<!-- im-edit chrome (injected by inject-chrome.mjs) -->
<style id="ime-chrome-css">${chromeCss}</style>
<script id="im-edit-catalogue" type="application/json">${catalogueJson}</script>
<script id="im-edit-state" type="application/json">${JSON.stringify(initialState, null, 2)}</script>
<script id="ime-chrome-js">${chromeJs}</script>
<!-- end im-edit chrome -->
`;

  const body = $('body');
  if (body.length === 0) {
    console.error('No <body> tag found');
    process.exit(1);
  }
  body.append(injection);

  await writeFile(deckPath, '<!DOCTYPE html>\n' + $.html(), 'utf8');
  console.log(`Chrome injected into ${deckPath}`);
}

main().catch(err => {
  console.error('inject-chrome failed:', err.message);
  process.exit(1);
});
