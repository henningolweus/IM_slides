#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname, basename, join, extname } from 'node:path';
import { existsSync } from 'node:fs';
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
  const out = { deck: null, out: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--deck') out.deck = args[++i];
    else if (args[i] === '--out') out.out = args[++i];
  }
  if (!out.deck) {
    console.error('Usage: node strip-chrome.mjs --deck <deck.html> [--out <clean.html>]');
    process.exit(1);
  }
  if (!out.out) {
    const dir = dirname(resolve(out.deck));
    const base = basename(out.deck, extname(out.deck));
    out.out = join(dir, base + '.clean' + extname(out.deck));
  }
  return out;
}

async function main() {
  const { deck, out } = parseArgs();
  const deckPath = resolve(deck);
  const outPath = resolve(out);

  let html = await readFile(deckPath, 'utf8');
  if (html.charCodeAt(0) === 0xFEFF) html = html.slice(1);
  if (!/<meta\s+charset=["']?utf-8/i.test(html)) {
    html = html.replace(/<head([^>]*)>/i, '<head$1>\n<meta charset="UTF-8">');
  }
  const $ = cheerio.load(html, { decodeEntities: false });

  const stateRaw = $('#im-edit-state').html();
  const catalogueRaw = $('#im-edit-catalogue').html();
  if (!stateRaw) {
    console.error('No im-edit state found — is this a chrome-augmented deck?');
    process.exit(1);
  }

  const state = JSON.parse(stateRaw);
  const catalogue = catalogueRaw ? JSON.parse(catalogueRaw) : { styles: {}, color_palette: {} };

  let baked = 0;
  for (const [imeditId, override] of Object.entries(state.styles || {})) {
    const el = $(`[data-imedit-id="${imeditId}"]`);
    if (el.length === 0) continue;
    const recipe = resolveRecipe(override, catalogue);
    const inline = el.attr('style') || '';
    const newInline = inline + (inline && !inline.endsWith(';') ? ';' : '') +
      Object.entries(recipe).map(([k, v]) => `${k}: ${v}`).join('; ') + ';';
    el.attr('style', newInline);
    baked++;
  }

  $('#ime-chrome-css').remove();
  $('#im-edit-catalogue').remove();
  $('#im-edit-state').remove();
  $('#ime-chrome-js').remove();
  $('#ime-toolbar').remove();
  $('#ime-comments-panel').remove();
  $('.ime-comment-pin').remove();
  $('.ime-selection-halo').remove();
  $('.ime-comment-popover').remove();

  $('[data-imedit-style]').each((i, el) => {
    const $el = $(el);
    const cls = ($el.attr('class') || '').split(/\s+/).filter(c => !c.startsWith('ime-style-') && c !== '').join(' ');
    if (cls) $el.attr('class', cls); else $el.removeAttr('class');
    $el.removeAttr('data-imedit-style');
  });
  $('[data-imedit-selected]').removeAttr('data-imedit-selected');

  $('body').removeClass('ime-active ime-panel-open');

  await writeFile(outPath, '<!DOCTYPE html>\n' + $.html(), 'utf8');
  console.log(`Clean copy written to ${outPath} (baked ${baked} style overrides)`);
}

function resolveRecipe(override, catalogue) {
  let recipe = {};
  if (typeof override === 'string') {
    recipe = { ...((catalogue.styles || {})[override] || {}) };
  } else if (typeof override === 'object') {
    if (override.style) recipe = { ...((catalogue.styles || {})[override.style] || {}) };
    for (const [k, v] of Object.entries(override)) {
      if (k === 'style') continue;
      recipe[k] = v;
    }
  }
  return recipe;
}

main().catch(err => {
  console.error('strip-chrome failed:', err.message);
  process.exit(1);
});
