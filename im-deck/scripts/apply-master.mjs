#!/usr/bin/env node
// apply-master.mjs — Brand a generated .pptx with a corporate slide master.
//
// Strategy: load the TEMPLATE as the output base (it's already a complete,
// valid .pptx with all master/layout/theme/font/customXml relationships
// intact). Remove the template's example slides, inject the deck's slides
// + media, rewire each slide to reference an appropriate template layout.
//
// This is the inverse of "swap master into deck". By starting from the
// template, we never disturb its internal graph — only slides change.
// PowerPoint sees the file as "a template-based deck", which is what
// happens when you use New Slide → From Template in PowerPoint itself.
//
// What it does NOT do:
//   - Re-skin the deck's body shapes to the template's theme colours/fonts.
//     Our shapes carry hardcoded hex/font values from the HTML CSS. A
//     separate CSS-side colour sweep is needed for full theme inheritance.
//
// Usage:
//   node apply-master.mjs --deck <deck.pptx> --template <brand.pptx-or-potx> --out <branded.pptx> [options]

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import JSZip from 'jszip';

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {
    deck: null, template: null, out: null, verbose: false,
    contentLayout: null, coverLayout: null,
    listLayouts: false,
    resetTitles: true,
  };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--deck')                out.deck = args[++i];
    else if (args[i] === '--template')       out.template = args[++i];
    else if (args[i] === '--out')            out.out = args[++i];
    else if (args[i] === '--content-layout') out.contentLayout = args[++i];
    else if (args[i] === '--cover-layout')   out.coverLayout = args[++i];
    else if (args[i] === '--list-layouts')   out.listLayouts = true;
    else if (args[i] === '--no-reset-titles') out.resetTitles = false;
    else if (args[i] === '--verbose' || args[i] === '-v') out.verbose = true;
    else if (args[i] === '-h' || args[i] === '--help') { printHelp(); process.exit(0); }
  }
  if (out.listLayouts) {
    if (!out.template) { printHelp(); process.exit(2); }
    return out;
  }
  if (!out.deck || !out.template || !out.out) {
    printHelp();
    process.exit(2);
  }
  return out;
}

function printHelp() {
  console.error(`Usage: node apply-master.mjs --deck <deck.pptx> --template <brand.pptx-or-potx> --out <branded.pptx> [options]

Options:
  --content-layout <name>   Layout name to use for content slides (default: auto-detect Blank/blank)
  --cover-layout <name>     Layout name to use for slide 1 (default: auto-detect Cover/title)
  --no-reset-titles         Keep the deck's title position/font/colour instead of inheriting
                            from the layout's title placeholder (default: reset to layout)
  --list-layouts            Just list the template's layouts and exit (use with --template only)
  -v, --verbose             Print step-by-step progress

Brand a generated .pptx with a corporate slide master.
Starts from <template>, removes its example slides, injects <deck>'s slides.
Body content (shapes, text frames, lists) is preserved untouched, EXCEPT
IM_TITLE-named shapes which get reset to the layout's title placeholder
defaults (position, font, size, colour, alignment) for proper alignment
and on-brand styling.
`);
}

async function loadZip(path) {
  return JSZip.loadAsync(await readFile(path));
}

function listParts(zip, prefix, ext) {
  const out = [];
  zip.forEach((p, file) => {
    if (file.dir) return;
    if (!p.startsWith(prefix)) return;
    if (ext && !p.endsWith(ext)) return;
    out.push(p);
  });
  return out.sort();
}

// Resolve a rels Target (relative to its parent part) → absolute zip path.
function resolveTarget(fromPart, target) {
  if (target.startsWith('/')) return target.slice(1);
  if (/^https?:\/\//i.test(target)) return null;
  const dir = fromPart.replace(/[^/]+$/, '');
  const segs = (dir + target).split('/');
  const out = [];
  for (const s of segs) {
    if (s === '..') out.pop();
    else if (s !== '.' && s !== '') out.push(s);
  }
  return out.join('/');
}

function relsPathFor(partPath) {
  return partPath.replace(/(^|\/)([^/]+)$/, '$1_rels/$2') + '.rels';
}

function layoutName(xml) {
  const m = xml.match(/<p:cSld[^>]*name="([^"]+)"/);
  return m ? m[1] : '';
}
function layoutType(xml) {
  const m = xml.match(/<p:sldLayout[^>]*type="([^"]+)"/);
  return m ? m[1] : '';
}

function pickContentLayout(layoutXmls, override) {
  if (override) {
    const i = layoutXmls.findIndex(x => layoutName(x).toLowerCase() === override.toLowerCase());
    if (i >= 0) return i;
    console.warn(`(content-layout '${override}' not found — falling back to auto-detect)`);
  }
  for (let i = 0; i < layoutXmls.length; i++) if (layoutType(layoutXmls[i]).toLowerCase() === 'blank') return i;
  for (let i = 0; i < layoutXmls.length; i++) if (layoutName(layoutXmls[i]).toLowerCase() === 'blank') return i;
  for (let i = 0; i < layoutXmls.length; i++) if (/blank/i.test(layoutName(layoutXmls[i]))) return i;
  for (let i = 0; i < layoutXmls.length; i++) if (/^title and content$/i.test(layoutName(layoutXmls[i]))) return i;
  for (let i = 0; i < layoutXmls.length; i++) {
    const n = layoutName(layoutXmls[i]);
    if (!/^(cover|divider|section|outro|thank)/i.test(n)) return i;
  }
  return 0;
}
function pickCoverLayout(layoutXmls, override) {
  if (override) {
    const i = layoutXmls.findIndex(x => layoutName(x).toLowerCase() === override.toLowerCase());
    if (i >= 0) return i;
    console.warn(`(cover-layout '${override}' not found — falling back to auto-detect)`);
  }
  for (let i = 0; i < layoutXmls.length; i++) if (layoutType(layoutXmls[i]).toLowerCase() === 'title') return i;
  for (let i = 0; i < layoutXmls.length; i++) if (/^cover\b/i.test(layoutName(layoutXmls[i]))) return i;
  return 0;
}


async function main() {
  const args = parseArgs();
  const { deck: deckPath, template: tplPath, out: outPath, verbose, listLayouts, contentLayout, coverLayout, resetTitles } = args;
  if (!existsSync(tplPath)) { console.error(`Template not found: ${tplPath}`); process.exit(1); }
  if (!listLayouts && !existsSync(deckPath)) { console.error(`Deck not found: ${deckPath}`); process.exit(1); }
  const log = (...a) => verbose && console.log('  ·', ...a);

  // --list-layouts: short-circuit
  if (listLayouts) {
    const tpl = await loadZip(tplPath);
    const tplLayouts = listParts(tpl, 'ppt/slideLayouts/', '.xml').sort((a, b) => {
      const na = +a.match(/(\d+)\.xml$/)[1]; const nb = +b.match(/(\d+)\.xml$/)[1];
      return na - nb;
    });
    console.log(`Template: ${tplPath}`);
    console.log(`Layouts (${tplLayouts.length}):`);
    console.log('  idx  file                 type           name');
    for (let i = 0; i < tplLayouts.length; i++) {
      const xml = await tpl.file(tplLayouts[i]).async('string');
      console.log(
        '  ' + String(i + 1).padStart(3),
        tplLayouts[i].replace('ppt/slideLayouts/', '').padEnd(20),
        (layoutType(xml) || '-').padEnd(14),
        layoutName(xml) || '(no name)'
      );
    }
    return;
  }

  console.log(`Loading template: ${tplPath}`);
  const out = await loadZip(tplPath);   // OUTPUT IS THE TEMPLATE, mutated in place

  console.log(`Loading deck:     ${deckPath}`);
  const deck = await loadZip(deckPath);

  // ---------- 1. Find template's existing example slides via presentation.xml.rels ----------
  const presRelsPath = 'ppt/_rels/presentation.xml.rels';
  let presRels = await out.file(presRelsPath).async('string');
  const tplSlideRels = [...presRels.matchAll(/<Relationship\s+Id="([^"]+)"[^>]*Type="[^"]*\/slide"[^>]*Target="([^"]+)"[^>]*\/>/g)]
    .map(m => ({ rId: m[1], target: m[2] }));
  console.log(`Template has ${tplSlideRels.length} existing example slide(s) — removing.`);

  // ---------- 2. Remove template slide parts ----------
  for (const sr of tplSlideRels) {
    const slidePath = 'ppt/' + sr.target;
    const slideRelsPath = relsPathFor(slidePath);
    out.remove(slidePath);
    out.remove(slideRelsPath);
    log(`removed ${slidePath} + rels`);
  }

  // ---------- 3. Pick layouts ----------
  const tplLayouts = listParts(out, 'ppt/slideLayouts/', '.xml').sort((a, b) => {
    const na = +a.match(/(\d+)\.xml$/)[1]; const nb = +b.match(/(\d+)\.xml$/)[1];
    return na - nb;
  });
  const layoutXmls = await Promise.all(tplLayouts.map(p => out.file(p).async('string')));
  const contentIdx = pickContentLayout(layoutXmls, contentLayout);
  const coverIdx   = pickCoverLayout(layoutXmls, coverLayout);
  const contentLayoutTarget = '../' + tplLayouts[contentIdx].replace(/^ppt\//, '');
  const coverLayoutTarget   = '../' + tplLayouts[coverIdx].replace(/^ppt\//, '');
  console.log(`Cover slide    → ${basename(tplLayouts[coverIdx])}  "${layoutName(layoutXmls[coverIdx]) || '?'}"`);
  console.log(`Content slides → ${basename(tplLayouts[contentIdx])}  "${layoutName(layoutXmls[contentIdx]) || '?'}"`);

  // ---------- 4. Find deck's slides (in order) ----------
  const deckSlides = [];
  deck.forEach((p, file) => {
    if (file.dir) return;
    const m = p.match(/^ppt\/slides\/slide(\d+)\.xml$/);
    if (m) deckSlides.push({ path: p, idx: +m[1] });
  });
  deckSlides.sort((a, b) => a.idx - b.idx);
  console.log(`Deck has ${deckSlides.length} slide(s) to inject.`);

  // ---------- 5. Strip slide entries from presRels, sldIdLst, [Content_Types].xml ----------
  presRels = presRels.replace(/<Relationship\s+Id="[^"]+"[^>]*Type="[^"]*\/slide"[^>]*Target="[^"]*"[^>]*\/>/g, '');

  let pres = await out.file('ppt/presentation.xml').async('string');
  // Empty out sldIdLst (we'll repopulate). Handle both populated and self-closing forms.
  if (/<p:sldIdLst>[\s\S]*?<\/p:sldIdLst>/.test(pres)) {
    pres = pres.replace(/<p:sldIdLst>[\s\S]*?<\/p:sldIdLst>/, '<p:sldIdLst></p:sldIdLst>');
  } else if (/<p:sldIdLst\s*\/>/.test(pres)) {
    pres = pres.replace(/<p:sldIdLst\s*\/>/, '<p:sldIdLst></p:sldIdLst>');
  } else {
    // Insert empty sldIdLst right after sldMasterIdLst
    pres = pres.replace(/(<\/p:sldMasterIdLst>)/, '$1<p:sldIdLst></p:sldIdLst>');
  }

  let ct = await out.file('[Content_Types].xml').async('string');
  ct = ct.replace(/<Override\s+PartName="\/ppt\/slides\/[^"]+"[^>]*\/>/g, '');

  // ---------- 6. Inject deck slides ----------
  let maxRid = 0;
  for (const m of presRels.matchAll(/Id="rId(\d+)"/g)) maxRid = Math.max(maxRid, +m[1]);

  const newSlideRels = [];
  const newSldIds = [];
  const newOverrides = [];
  let sldIdCounter = 256;
  const copiedMedia = new Set();
  let strippedRels = 0;
  let promotedTitles = 0;
  let resetTitleCount = 0;

  for (let i = 0; i < deckSlides.length; i++) {
    const ds = deckSlides[i];
    const outIdx = i + 1;
    const slideOutPath = `ppt/slides/slide${outIdx}.xml`;
    const slideOutRelsPath = `ppt/slides/_rels/slide${outIdx}.xml.rels`;

    // 6a. Copy slide body XML, promoting any IM_TITLE-named shape to a real
    //     title placeholder. html2pptx.js sets objectName='IM_TITLE' on the
    //     deck's .action-title; here we add <p:ph type="title"/> to its
    //     <p:nvPr> element, which makes the layout's "Click to add title"
    //     prompt disappear and registers the shape as the slide's title
    //     (used by PowerPoint's outline view, accessibility, etc.).
    let slideXml = await deck.file(ds.path).async('string');
    slideXml = slideXml.replace(/<p:sp>[\s\S]*?<\/p:sp>/g, (sp) => {
      if (!sp.includes('name="IM_TITLE"')) return sp;
      let modified = sp;

      // 1. Promote to a real title placeholder so the layout's "Click to add
      //    title" prompt disappears and the shape registers as the slide's
      //    title (used by PowerPoint's outline view, accessibility, etc.).
      modified = modified.replace(/<p:nvPr\s*\/>/, '<p:nvPr><p:ph type="title"/></p:nvPr>');
      if (modified === sp) {
        modified = modified.replace(/<p:nvPr>\s*<\/p:nvPr>/, '<p:nvPr><p:ph type="title"/></p:nvPr>');
      }
      if (modified !== sp) promotedTitles++;

      // 2. Reset to layout defaults — strip our hardcoded position (<a:xfrm>),
      //    paragraph properties (<a:pPr>), and run properties (<a:rPr>) so
      //    PowerPoint inherits position, font, size, colour, weight, and
      //    alignment from the layout's title placeholder. The text content
      //    inside <a:t> is kept untouched.
      //
      //    Why: the deck emits each shape with absolute positioning + hex
      //    colours from CSS, which never align with the template's brand
      //    grid and can become invisible on differently-coloured layouts.
      if (resetTitles) {
        const before = modified;
        // Replace whole <p:spPr>...</p:spPr> with self-closing — kills <a:xfrm>
        // and any of our fill/border defaults. Layout's placeholder geometry kicks in.
        modified = modified.replace(/<p:spPr>[\s\S]*?<\/p:spPr>/, '<p:spPr/>');
        // Drop <a:pPr ...> (self-closing or paired) — layout's paragraph props apply.
        modified = modified.replace(/<a:pPr\b[^/>]*\/>/g, '');
        modified = modified.replace(/<a:pPr\b[^>]*>[\s\S]*?<\/a:pPr>/g, '');
        // Reset <a:rPr> attributes to lang-only (drop size, bold, colour, font, etc.)
        const stripRPr = (m, tag, attrs) => {
          const langM = attrs.match(/\blang="[^"]+"/);
          return `<${tag}${langM ? ' ' + langM[0] : ''}/>`;
        };
        modified = modified.replace(/<(a:rPr)\b([^/>]*)\/>/g, stripRPr);
        modified = modified.replace(/<(a:rPr)\b([^>]*)>[\s\S]*?<\/a:rPr>/g, stripRPr);
        modified = modified.replace(/<(a:endParaRPr)\b([^/>]*)\/>/g, stripRPr);
        modified = modified.replace(/<(a:endParaRPr)\b([^>]*)>[\s\S]*?<\/a:endParaRPr>/g, stripRPr);
        if (modified !== before) resetTitleCount++;
      }

      return modified;
    });
    out.file(slideOutPath, slideXml);

    // 6b. Process the slide's rels (if any)
    const deckRelsPath = relsPathFor(ds.path);
    const deckRelsFile = deck.file(deckRelsPath);
    let relsXml;
    if (deckRelsFile) {
      relsXml = await deckRelsFile.async('string');
      // Walk every <Relationship>: layout → rewire; others → copy file if present, else strip
      const layoutTarget = outIdx === 1 ? coverLayoutTarget : contentLayoutTarget;
      const relsToKeep = [];
      let foundLayoutRel = false;
      const relRe = /<Relationship\s+Id="([^"]+)"[^>]*Type="([^"]+)"[^>]*Target="([^"]+)"[^>]*\/>/g;
      for (const m of relsXml.matchAll(relRe)) {
        const [whole, rId, type, target] = m;
        if (/\/slideLayout$/.test(type)) {
          relsToKeep.push(`<Relationship Id="${rId}" Type="${type}" Target="${layoutTarget}"/>`);
          foundLayoutRel = true;
          continue;
        }
        // For non-layout rels: try to copy the referenced part from deck
        const resolvedSrc = resolveTarget(ds.path, target);
        const srcFile = resolvedSrc ? deck.file(resolvedSrc) : null;
        if (srcFile) {
          // Destination path = same Target resolved from new slide path = same zip path
          const resolvedDest = resolveTarget(slideOutPath, target);
          if (!out.file(resolvedDest)) {
            out.file(resolvedDest, await srcFile.async('uint8array'));
            if (resolvedDest.startsWith('ppt/media/')) copiedMedia.add(resolvedDest);
          }
          relsToKeep.push(whole);
        } else {
          // Referenced file doesn't exist in deck — strip this rel to avoid PowerPoint repair prompt
          strippedRels++;
          log(`stripped dangling rel ${rId} ${type} → ${target} on slide ${outIdx}`);
        }
      }
      // If for some reason the deck rels had no layout rel, add one explicitly
      if (!foundLayoutRel) {
        maxRid++;
        const layoutRelId = `rId${maxRid}`;
        relsToKeep.unshift(`<Relationship Id="${layoutRelId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="${outIdx === 1 ? coverLayoutTarget : contentLayoutTarget}"/>`);
      }
      relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relsToKeep.join('')}</Relationships>`;
    } else {
      // Slide has no rels at all — create one with just the layout reference
      relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="${outIdx === 1 ? coverLayoutTarget : contentLayoutTarget}"/></Relationships>`;
    }
    out.file(slideOutRelsPath, relsXml);

    // 6c. Add presentation-level entries
    maxRid++;
    const slideRid = `rId${maxRid}`;
    newSlideRels.push(`<Relationship Id="${slideRid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${outIdx}.xml"/>`);
    newSldIds.push(`<p:sldId id="${sldIdCounter++}" r:id="${slideRid}"/>`);
    newOverrides.push(`<Override PartName="/${slideOutPath}" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`);
  }

  log(`Copied ${copiedMedia.size} media file(s) from deck`);
  if (strippedRels) log(`Stripped ${strippedRels} dangling rel(s) (referenced files not present in deck)`);
  if (promotedTitles) log(`Promoted ${promotedTitles} IM_TITLE shape(s) to title placeholder(s)`);
  if (resetTitleCount) log(`Reset ${resetTitleCount} title(s) to layout defaults (position, font, size, colour, alignment)`);

  // ---------- 7. Apply mutations to presRels, pres, [Content_Types].xml ----------
  presRels = presRels.replace('</Relationships>', newSlideRels.join('') + '</Relationships>');
  pres = pres.replace(/<p:sldIdLst><\/p:sldIdLst>/, `<p:sldIdLst>${newSldIds.join('')}</p:sldIdLst>`);
  ct = ct.replace('</Types>', newOverrides.join('') + '</Types>');

  out.file(presRelsPath, presRels);
  out.file('ppt/presentation.xml', pres);
  out.file('[Content_Types].xml', ct);

  // ---------- 8. Write ----------
  const buf = await out.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
  await writeFile(outPath, buf);
  console.log(`\n✓ Wrote ${outPath}  (${(buf.length / 1024).toFixed(1)} KB)`);
  console.log(`  ${deckSlides.length} deck slide(s) injected into template`);
  console.log(`  Slide 1 → ${basename(tplLayouts[coverIdx])} "${layoutName(layoutXmls[coverIdx]) || '?'}"`);
  console.log(`  Slides 2-${deckSlides.length} → ${basename(tplLayouts[contentIdx])} "${layoutName(layoutXmls[contentIdx]) || '?'}"`);
  console.log(`  Open in PowerPoint — the master and all layouts come from the template, body content from the deck.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error('apply-master failed:', err.message);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  });
}
