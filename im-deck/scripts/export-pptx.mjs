#!/usr/bin/env node
import { readdir } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { html2pptx } from './html2pptx.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

function checkDeps() {
  const required = ['pptxgenjs', 'playwright'];
  const missing = required.filter(pkg => !existsSync(join(__dirname, 'node_modules', pkg)));
  if (missing.length) {
    console.error('Missing dependencies:', missing.join(', '));
    console.error(`Run: cd "${__dirname}" && npm install && npx playwright install chromium`);
    process.exit(1);
  }
}

checkDeps();

const pptxgen = require('pptxgenjs');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { slides: null, out: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--slides') out.slides = args[++i];
    else if (args[i] === '--out') out.out = args[++i];
  }
  if (!out.slides || !out.out) {
    console.error('Usage: node export-pptx.mjs --slides <slides-dir> --out <out.pptx>');
    process.exit(1);
  }
  return out;
}

async function main() {
  const { slides: slidesDir, out: outFile } = parseArgs();
  const slidesPath = resolve(slidesDir);
  const outPath = resolve(outFile);

  let files;
  try {
    files = (await readdir(slidesPath))
      .filter(f => f.endsWith('.html'))
      .sort();
  } catch (e) {
    console.error(`Cannot read slides directory: ${slidesPath}`);
    console.error(e.message);
    process.exit(1);
  }

  if (files.length === 0) {
    console.error(`No .html files in ${slidesPath}`);
    process.exit(1);
  }

  console.log(`Found ${files.length} slide files. Converting…`);

  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';

  const errors = [];
  const allWarnings = [];

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const fullPath = join(slidesPath, f);
    try {
      const { warnings } = await html2pptx(fullPath, pres);
      console.log(`  [${i + 1}/${files.length}] ${f} ✓`);
      for (const w of warnings) allWarnings.push(`${f}: ${w}`);
    } catch (e) {
      console.error(`  [${i + 1}/${files.length}] ${f} ✗ ${e.message}`);
      errors.push({ file: f, error: e.message });
    }
  }

  await pres.writeFile({ fileName: outPath });

  const successCount = files.length - errors.length;
  console.log(`\n✓ Wrote ${outPath}`);
  console.log(`  ${successCount}/${files.length} slides converted`);
  if (allWarnings.length) {
    console.log(`  ${allWarnings.length} warning(s):`);
    for (const w of allWarnings) console.log(`    - ${w}`);
  }
  if (errors.length) {
    console.log(`  ${errors.length} error(s):`);
    for (const e of errors) console.log(`    - ${e.file}: ${e.error}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('export-pptx failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
