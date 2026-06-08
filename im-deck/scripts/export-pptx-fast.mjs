#!/usr/bin/env node
// export-pptx-fast.mjs — reuses one Chromium across all slides.
// Same CLI as export-pptx.mjs:  --slides DIR --out FILE

import { readdir } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { html2pptxFast } from './html2pptx-fast.js';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const pptxgen = require('pptxgenjs');

const SLIDE_W_PX = 1280;
const SLIDE_H_PX = 720;

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { slides: null, out: null, restartEvery: 30 };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--slides') out.slides = args[++i];
    else if (args[i] === '--out') out.out = args[++i];
    else if (args[i] === '--restart-every') out.restartEvery = parseInt(args[++i], 10);
  }
  if (!out.slides || !out.out) {
    console.error('Usage: node export-pptx-fast.mjs --slides <dir> --out <out.pptx> [--restart-every N]');
    process.exit(1);
  }
  return out;
}

async function newCtx(browser) {
  return await browser.newContext({
    viewport: { width: SLIDE_W_PX, height: SLIDE_H_PX },
    deviceScaleFactor: 2,
  });
}

async function main() {
  const { slides: slidesDir, out: outFile, restartEvery } = parseArgs();
  const slidesPath = resolve(slidesDir);
  const outPath = resolve(outFile);

  const files = (await readdir(slidesPath))
    .filter(f => f.endsWith('.html')).sort();
  if (files.length === 0) { console.error('No .html files'); process.exit(1); }

  console.log(`Found ${files.length} slide files. Launching ONE Chromium for the whole run.`);
  console.log(`(Will restart browser context every ${restartEvery} slides to keep memory bounded.)`);

  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';

  let browser = await chromium.launch();
  let ctx = await newCtx(browser);

  const t0 = Date.now();
  const errors = [];

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const fullPath = join(slidesPath, f);
    try {
      await html2pptxFast(fullPath, pres, { ctx });
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      console.log(`  [${i + 1}/${files.length}] ${f} ok  (t=${elapsed}s)`);
    } catch (e) {
      console.error(`  [${i + 1}/${files.length}] ${f} FAIL  ${e.message}`);
      errors.push({ file: f, error: e.message });
    }

    // Periodically restart the BROWSER (not just context) to release memory.
    if ((i + 1) % restartEvery === 0 && i + 1 < files.length) {
      console.log(`  -- restarting browser to release memory --`);
      await ctx.close();
      await browser.close();
      browser = await chromium.launch();
      ctx = await newCtx(browser);
    }
  }

  await ctx.close();
  await browser.close();

  await pres.writeFile({ fileName: outPath });

  const successCount = files.length - errors.length;
  console.log(`\nWrote ${outPath}`);
  console.log(`  ${successCount}/${files.length} slides converted`);
  console.log(`  total elapsed: ${((Date.now() - t0) / 1000 / 60).toFixed(1)} min`);
  if (errors.length) {
    console.log(`  ${errors.length} error(s):`);
    for (const e of errors) console.log(`    - ${e.file}: ${e.error}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('export-pptx-fast failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
