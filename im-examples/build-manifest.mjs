#!/usr/bin/env node
// Indexes example PPTX files into manifest.json so the IM_ skills can
// reference real examples as inspiration. Config in manifest.config.json.
//
// Output schema (manifest.json):
// {
//   version: 1,
//   generated_at: ISO,
//   examples_root: "...",
//   examples: [
//     {
//       section: "intro-scq",
//       section_label: "...",
//       source_file: "...",          // absolute path
//       default_layout: "two-panel:scr",
//       scaffold_slot: "slide 5",
//       slide_count: 12,
//       slides: [
//         {
//           index: 1,                  // 1-based
//           title: "...",              // first text run on the slide (best effort)
//           text: "...",               // all text runs joined with newlines
//           notes: "...",              // speaker notes if any
//           image_count: 3,
//           shape_count: 17,
//           has_table: false,
//           candidate_layout: "two-panel:scr"   // best guess per slide
//         }
//       ]
//     }
//   ]
// }

import { readFile, writeFile, stat } from 'node:fs/promises';
import { dirname, join, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';

const __dirname = dirname(fileURLToPath(import.meta.url));

function unescapeXml(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&amp;/g, '&'); // last to avoid double-decoding
}

// Extract <a:t>...</a:t> text-run contents from a slide XML.
function extractTextRuns(xml) {
  const runs = [];
  const re = /<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g;
  let m;
  while ((m = re.exec(xml)) !== null) runs.push(unescapeXml(m[1]).trim());
  return runs.filter((r) => r.length > 0);
}

// Group runs into paragraphs by splitting at <a:p> boundaries first.
function extractParagraphs(xml) {
  const paragraphs = [];
  const pRe = /<a:p(?:\s[^>]*)?>([\s\S]*?)<\/a:p>/g;
  let pm;
  while ((pm = pRe.exec(xml)) !== null) {
    const para = extractTextRuns(pm[1]).join('');
    if (para) paragraphs.push(para);
  }
  return paragraphs;
}

function countMatches(xml, re) {
  return (xml.match(re) || []).length;
}

// Numerically sort slide filenames so slide2.xml < slide10.xml.
function slideOrder(name) {
  const m = /slide(\d+)\.xml$/i.exec(name);
  return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER;
}

// Lightweight heuristic. Most of the signal will come from the section's
// default_layout (humans organised the files); these per-slide bumps catch
// the obvious outliers (e.g. a gantt example inside the team-investment file).
function guessLayout(slide, sectionDefault) {
  const text = (slide.title + ' ' + slide.text).toLowerCase();
  const hasTable = slide.has_table;
  const images = slide.image_count;
  const shapes = slide.shape_count;

  if (hasTable && /week|phase|milestone|gantt|timeline|plan/.test(text)) return 'gantt-process';
  if (hasTable && /option|criteria|comparison|score|rating/.test(text)) return 'comparison-table';
  if (/situation|complication|key question|objective/.test(text) && shapes > 6) return 'two-panel:scr';
  if (/why implement|differentiat|distinctive/.test(text)) return 'iconic-3-column:sidebar';
  if (/team|cv|biograph/.test(text) && images >= 3) return 'team-and-investment';
  if (/collaboration|co-creat|one team|partnership/.test(text) && shapes > 4) return 'ring-diagram';
  if (/thank you|best regards|sincerely|look forward/i.test(text)) return 'photo-left-content:letter';
  if (/contents|agenda|table of contents/.test(text) && shapes < 20) return 'photo-left-content:contents';
  if (/about implement|implement is|principles|we are/i.test(text)) return 'two-panel:about-firm';
  if (images >= 4 && shapes < 20) return 'photo-card-grid';
  return sectionDefault;
}

async function parsePptx(absPath) {
  const buf = await readFile(absPath);
  const zip = await JSZip.loadAsync(buf);

  const slideFiles = Object.keys(zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => slideOrder(a) - slideOrder(b));

  const noteFiles = Object.fromEntries(
    Object.keys(zip.files)
      .filter((n) => /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(n))
      .map((n) => [n.replace(/^ppt\/notesSlides\/notesSlide(\d+)\.xml$/, '$1'), n])
  );

  const slides = [];
  for (let i = 0; i < slideFiles.length; i++) {
    const name = slideFiles[i];
    const xml = await zip.files[name].async('string');
    const paragraphs = extractParagraphs(xml);
    const title = paragraphs[0] || '';
    const text = paragraphs.join('\n');

    // Note: PPTX embeds images as ppt/media/image*.png referenced via rels.
    // For a quick image count we look at <p:pic> tags inside the slide XML.
    const image_count = countMatches(xml, /<p:pic[\s>]/g);
    const shape_count = countMatches(xml, /<p:sp[\s>]/g);
    const has_table = /<a:tbl[\s>]/.test(xml);

    let notes = '';
    const oneBased = String(i + 1);
    if (noteFiles[oneBased]) {
      const notesXml = await zip.files[noteFiles[oneBased]].async('string');
      notes = extractParagraphs(notesXml).join('\n');
    }

    const slide = {
      index: i + 1,
      title,
      text,
      notes,
      image_count,
      shape_count,
      has_table,
    };
    slides.push(slide);
  }

  return slides;
}

async function main() {
  const configPath = resolve(__dirname, 'manifest.config.json');
  const cfg = JSON.parse(await readFile(configPath, 'utf8'));
  const examplesRoot = cfg.examples_root;

  const examples = [];
  for (const src of cfg.sources) {
    const absPath = resolve(examplesRoot, src.file);
    try {
      await stat(absPath);
    } catch {
      console.warn(`  [skip] ${src.file} (not found at ${absPath})`);
      continue;
    }
    process.stdout.write(`  Parsing ${src.file} ... `);
    const slides = await parsePptx(absPath);
    for (const s of slides) s.candidate_layout = guessLayout(s, src.default_layout);
    examples.push({
      section: src.section,
      section_label: src.section_label,
      source_file: absPath,
      default_layout: src.default_layout,
      scaffold_slot: src.scaffold_slot,
      slide_count: slides.length,
      slides,
    });
    console.log(`${slides.length} slides`);
  }

  const manifest = {
    version: 1,
    generated_at: new Date().toISOString(),
    examples_root: examplesRoot,
    examples,
  };

  const outPath = resolve(__dirname, 'manifest.json');
  await writeFile(outPath, JSON.stringify(manifest, null, 2), 'utf8');

  const totalSlides = examples.reduce((a, e) => a + e.slide_count, 0);
  console.log(`\nWrote ${basename(outPath)}: ${examples.length} sections, ${totalSlides} slides`);
}

main().catch((err) => {
  console.error('build-manifest failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
