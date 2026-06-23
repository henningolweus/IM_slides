#!/usr/bin/env node
// Token-efficient slice loader for the IM_ inspiration corpus.
// The skills (im-story, im-first-draft, im-deck) call this instead of
// reading manifest.json wholesale, so agents only load the section
// they need for the slide they are currently working on.
//
// Usage:
//   node lookup.mjs --list                      # list sections + slide counts
//   node lookup.mjs --section <name>            # all slides in a section
//   node lookup.mjs --section <name> --slide N  # one slide
//   node lookup.mjs --layout <layout-tag>       # all slides matching a candidate_layout
//   node lookup.mjs --section <name> --brief    # compact view: titles only + 200-char body previews
//   node lookup.mjs --status                    # corpus present? slide count? generation timestamp?
//
// All output is JSON to stdout (status uses key=value lines).
// Errors go to stderr with non-zero exit.

import { readFile, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST = resolve(__dirname, 'manifest.json');

function parseArgs(argv) {
  const out = { list: false, status: false, brief: false, section: null, slide: null, layout: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--list') out.list = true;
    else if (a === '--status') out.status = true;
    else if (a === '--brief') out.brief = true;
    else if (a === '--section') out.section = argv[++i];
    else if (a === '--slide') out.slide = parseInt(argv[++i], 10);
    else if (a === '--layout') out.layout = argv[++i];
    else if (a === '-h' || a === '--help') {
      printHelp();
      process.exit(0);
    } else {
      console.error(`Unknown arg: ${a}`);
      process.exit(2);
    }
  }
  return out;
}

function printHelp() {
  console.error(`Usage: node lookup.mjs [options]

  --list                      List sections with slide counts and default layouts.
  --status                    Show corpus presence + generation timestamp.
  --section <name>            All slides in the named section.
  --section <name> --slide N  One specific slide (1-based) within the section.
  --section <name> --brief    Compact view (titles + 200-char previews).
  --layout <layout-tag>       All slides whose candidate_layout matches the tag.

Section names: closing-letter, intro-scq, approach-scope, project-plan,
               team-investment, collaboration, about-implement, why-implement
`);
}

async function loadManifest() {
  try {
    await stat(MANIFEST);
  } catch {
    const err = new Error('manifest.json not found — run `node build-manifest.mjs` first');
    err.code = 'NO_MANIFEST';
    throw err;
  }
  return JSON.parse(await readFile(MANIFEST, 'utf8'));
}

function briefSlide(s) {
  return {
    index: s.index,
    title: s.title.slice(0, 140),
    preview: s.text.replace(/\s+/g, ' ').slice(0, 200),
    candidate_layout: s.candidate_layout,
    shape_count: s.shape_count,
    image_count: s.image_count,
    has_table: s.has_table,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.status) {
    try {
      const m = await loadManifest();
      const totalSlides = m.examples.reduce((a, e) => a + e.slide_count, 0);
      console.log(`present=true`);
      console.log(`generated_at=${m.generated_at}`);
      console.log(`sections=${m.examples.length}`);
      console.log(`slides=${totalSlides}`);
      return;
    } catch (e) {
      if (e.code === 'NO_MANIFEST') {
        console.log(`present=false`);
        return;
      }
      throw e;
    }
  }

  const m = await loadManifest();

  if (args.list) {
    const rows = m.examples.map((e) => ({
      section: e.section,
      section_label: e.section_label,
      slide_count: e.slide_count,
      default_layout: e.default_layout,
      scaffold_slot: e.scaffold_slot,
    }));
    console.log(JSON.stringify(rows, null, 2));
    return;
  }

  if (args.layout) {
    const hits = [];
    for (const ex of m.examples) {
      for (const s of ex.slides) {
        if (s.candidate_layout === args.layout) {
          hits.push({ section: ex.section, ...(args.brief ? briefSlide(s) : s) });
        }
      }
    }
    console.log(JSON.stringify(hits, null, 2));
    return;
  }

  if (args.section) {
    const ex = m.examples.find((e) => e.section === args.section);
    if (!ex) {
      console.error(`Unknown section: ${args.section}`);
      console.error(`Known: ${m.examples.map((e) => e.section).join(', ')}`);
      process.exit(2);
    }
    if (args.slide) {
      const s = ex.slides.find((s) => s.index === args.slide);
      if (!s) {
        console.error(`Slide ${args.slide} not found in ${args.section} (${ex.slide_count} slides)`);
        process.exit(2);
      }
      console.log(JSON.stringify(args.brief ? briefSlide(s) : s, null, 2));
      return;
    }
    const slides = args.brief ? ex.slides.map(briefSlide) : ex.slides;
    console.log(
      JSON.stringify(
        {
          section: ex.section,
          section_label: ex.section_label,
          default_layout: ex.default_layout,
          scaffold_slot: ex.scaffold_slot,
          slide_count: ex.slide_count,
          slides,
        },
        null,
        2
      )
    );
    return;
  }

  printHelp();
  process.exit(2);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error('lookup failed:', err.message);
    process.exit(1);
  });
}
