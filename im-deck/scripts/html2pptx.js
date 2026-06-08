import { chromium } from 'playwright';
import { parseCssColor, blendOver, resolveBackdrop, parseGradient } from './helpers/color.js';
import { hasFlowingText, PAGE_HELPERS as WALK_HELPERS } from './helpers/walk.js';
import { extractLiRuns, mapBulletGlyph, flattenNestedUL } from './helpers/list.js';
import { parsePseudoContent, isTriangleBorder, parseBorderStyle, PAGE_HELPERS as PSEUDO_HELPERS } from './helpers/pseudo.js';
import { stableSortByZ } from './helpers/z-order.js';
import { mapFlexAlign, computePillWidth, expandForText, computeRotatedAnchor } from './helpers/layout.js';
import { detectClipPathChevron, mapBorderRadius, detectSvgStrokeOnly } from './helpers/shapes.js';
import { letterSpacingToCharSpacing, smallCapsRuns, brToBreakLine, marginTopToParaSpaceBefore } from './helpers/text-frame.js';

const PX_TO_IN = (px) => px / 96;
const SLIDE_W_PX = 1280;
const SLIDE_H_PX = 720;

export async function html2pptx(htmlPath, pres) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: SLIDE_W_PX, height: SLIDE_H_PX },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });

  // Inject helpers (hasFlowingText, hasInlineFormatting, readPseudo) into page context
  await page.addScriptTag({ content: WALK_HELPERS + '\n' + PSEUDO_HELPERS });

  const result = await page.evaluate(() => {
    function cssColor(c) {
      if (!c) return null;
      if (c.startsWith('rgb')) {
        const m = c.match(/[\d.]+/g);
        if (!m) return null;
        const [r, g, b, a] = m.map(Number);
        if (a !== undefined && a < 0.05) return null;
        return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
      }
      return c.replace('#', '').toUpperCase();
    }

    // Serialise an rgba/rgb/#hex string into {hex, alpha} or null.
    function parseColorPx(c) {
      if (!c || c === 'transparent' || c === 'none') return null;
      const s = c.trim();
      if (s.startsWith('rgb')) {
        const nums = s.match(/[\d.]+/g);
        if (!nums) return null;
        const [r, g, b, a] = nums.map(Number);
        const alpha = a !== undefined ? a : 1;
        if (alpha < 0.001) return null;
        const hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
        return { hex, alpha };
      }
      if (s.startsWith('#')) {
        let hex = s.slice(1);
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        return { hex: hex.toUpperCase(), alpha: 1 };
      }
      return null;
    }

    // Walk ancestor chain and capture each background colour as {hex,alpha}|null.
    function buildBgChain(el) {
      const chain = [];
      let cur = el;
      while (cur && cur !== document.body) {
        const bg = getComputedStyle(cur).backgroundColor;
        chain.push({ bg: parseColorPx(bg) });
        cur = cur.parentElement;
      }
      return chain;
    }

    function visible(el) {
      const s = getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) < 0.05) return false;
      const r = el.getBoundingClientRect();
      if (r.width < 0.5 || r.height < 0.5) return false;
      if (el.closest && el.closest('.ime-toolbar, .ime-comments-panel, .ime-comment-popover, .ime-comment-pin, .ime-selection-halo, nav.nav, .print-modal')) return false;
      return true;
    }

    const TEXT_TAGS = new Set(['P','H1','H2','H3','H4','H5','H6','SPAN','TH','TD']);
    const LIST_TAGS = new Set(['UL','OL']);
    const INLINE_FORMATTING_TAGS = new Set(['STRONG','B','EM','I','U']);

    // Patched to use the injected helper (Step 4).
    function hasDirectText(el) {
      // hasFlowingText is injected via addScriptTag from helpers/walk.js
      return hasFlowingText(el);
    }

    function ancestorWouldCaptureText(el) {
      let p = el.parentElement;
      while (p) {
        const ptag = p.tagName;
        if (TEXT_TAGS.has(ptag)) return true;
        if (LIST_TAGS.has(ptag)) return true;
        p = p.parentElement;
      }
      return false;
    }

    // For elements without their own z-index, walk up to find the nearest
    // positioned ancestor that has one (CSS stacking context). Returns the
    // effective z so that children of an absolutely/relatively-positioned
    // element with z-index paint together with their parent, not behind it.
    function effectiveZ(el, s) {
      const own = parseInt(s.zIndex);
      if (!isNaN(own)) return own;
      let cur = el.parentElement;
      while (cur && cur !== document.body) {
        const cs = getComputedStyle(cur);
        const pos = cs.position;
        if (pos === 'absolute' || pos === 'relative' || pos === 'fixed' || pos === 'sticky') {
          const aZ = parseInt(cs.zIndex);
          if (!isNaN(aZ)) return aZ;
        }
        cur = cur.parentElement;
      }
      return 0;
    }

    function detectRotationDeg(el, s) {
      const wm = s.writingMode || '';
      if (wm === 'vertical-rl' || wm === 'sideways-rl') return 90;
      if (wm === 'vertical-lr' || wm === 'sideways-lr') return -90;
      const t = s.transform || '';
      if (t && t !== 'none') {
        const m = t.match(/matrix\(([^)]+)\)/);
        if (m) {
          const vals = m[1].split(',').map(parseFloat);
          if (vals.length >= 4) {
            const a = vals[0], b = vals[1];
            if (Math.abs(a) < 0.02 && b > 0.95) return 90;
            if (Math.abs(a) < 0.02 && b < -0.95) return -90;
            if (a < -0.95) return 180;
          }
        }
      }
      return 0;
    }

    function extractRuns(el) {
      const hasInlineStyle = el.querySelector('em, i, strong, b');
      if (!hasInlineStyle) return null;
      const raw = [];
      for (const child of el.childNodes) {
        if (child.nodeType === 3) {
          const t = child.textContent;
          if (t) raw.push({ text: t });
        } else if (child.nodeType === 1) {
          const tag = child.tagName;
          const t = child.textContent;
          if (!t) continue;
          const isItalic = tag === 'EM' || tag === 'I';
          const isBold = tag === 'STRONG' || tag === 'B';
          raw.push({ text: t, italic: isItalic || undefined, bold: isBold || undefined });
        }
      }
      let cleaned = raw.map(r => ({ ...r, text: r.text.replace(/[\s\n\r\t]+/g, ' ') }));
      while (cleaned.length && /^\s*$/.test(cleaned[0].text)) cleaned.shift();
      while (cleaned.length && /^\s*$/.test(cleaned[cleaned.length - 1].text)) cleaned.pop();
      if (cleaned.length > 0) {
        cleaned[0].text = cleaned[0].text.replace(/^\s+/, '');
        cleaned[cleaned.length - 1].text = cleaned[cleaned.length - 1].text.replace(/\s+$/, '');
      }
      return cleaned.length > 1 ? cleaned : null;
    }

    // ---- List inline-run extraction (mirrors helpers/list.js for page context) ----
    const BOLD_TAGS = new Set(['STRONG', 'B']);
    const ITAL_TAGS = new Set(['EM', 'I']);
    const UL_TAGS_PAGE = new Set(['UL', 'OL']);

    function extractLiRunsPage(li, inheritedState) {
      const runs = [];
      let pendingBreak = false;
      function walk(node, state) {
        if (!node) return;
        if (node.nodeType === 3) {
          const t = node.textContent;
          if (t && t.length > 0) {
            const r = { text: t };
            if (state.bold) r.bold = true;
            if (state.italic) r.italic = true;
            if (state.color) r.color = state.color;
            if (pendingBreak) { r.breakLine = true; pendingBreak = false; }
            runs.push(r);
          }
          return;
        }
        if (node.nodeType === 1) {
          const tag = node.tagName;
          if (tag === 'BR') { pendingBreak = true; return; }
          if (UL_TAGS_PAGE.has(tag)) return;
          const childState = {
            bold: state.bold || BOLD_TAGS.has(tag),
            italic: state.italic || ITAL_TAGS.has(tag),
            color: state.color,
          };
          const cn = node.childNodes || [];
          for (const c of cn) walk(c, childState);
        }
      }
      const initial = inheritedState || {};
      for (const c of (li.childNodes || [])) walk(c, initial);
      // Normalise whitespace
      return runs.map(r => ({ ...r, text: r.text.replace(/[\s\n\r\t]+/g, ' ') }))
                 .filter(r => r.text.length > 0);
    }

    function flattenNestedULPage(ul, level) {
      const out = [];
      const lvl = level || 0;
      for (const li of (ul.children || [])) {
        if (li.tagName !== 'LI') continue;
        const directRuns = extractLiRunsPage(li);
        if (directRuns.length > 0) {
          out.push({ level: lvl, runs: directRuns });
        }
        const childUls = Array.from(li.children || []).filter(c => UL_TAGS_PAGE.has(c.tagName));
        for (const childUl of childUls) {
          out.push.apply(out, flattenNestedULPage(childUl, lvl + 1));
        }
      }
      return out;
    }

    function buildTextFrame(el, s, r, domIndex, bgChain) {
      const text = el.textContent.trim();
      if (!text) return null;
      // Capture parent's flex info for layout helper
      let parentFlex = null;
      const pe = el.parentElement;
      if (pe) {
        const ps = getComputedStyle(pe);
        if (ps.display === 'flex' || ps.display === 'inline-flex') {
          parentFlex = {
            flexDirection: ps.flexDirection,
            justifyContent: ps.justifyContent,
            alignItems: ps.alignItems,
          };
        }
      }
      const item = {
        kind: 'text-frame',
        domIndex,
        x: r.x, y: r.y, w: r.width, h: r.height,
        z: effectiveZ(el, s),
        imeditId: el.getAttribute('data-imedit-id') || null,
        text,
        fontFamily: s.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
        fontSize: parseFloat(s.fontSize),
        fontWeight: s.fontWeight,
        color: cssColor(s.color),
        italic: s.fontStyle === 'italic',
        align: s.textAlign,
        letterSpacing: s.letterSpacing,
        textTransform: s.textTransform,
        rotateDeg: detectRotationDeg(el, s),
        padding: {
          top:    parseFloat(s.paddingTop)    || 0,
          right:  parseFloat(s.paddingRight)  || 0,
          bottom: parseFloat(s.paddingBottom) || 0,
          left:   parseFloat(s.paddingLeft)   || 0,
        },
        parentFlex,
      };
      const runs = extractRuns(el);
      if (runs) item.runs = runs;
      return item;
    }

    function buildShape(el, s, r, domIndex, bgChain) {
      // Background: capture own bg + ancestor chain so Node can alpha-blend.
      const ownBg = parseColorPx(s.backgroundColor);
      // Gradient (linear-gradient) → carry the bg-image string for Node parsing
      const bgImage = s.backgroundImage || '';
      return {
        kind: 'shape',
        domIndex,
        x: r.x, y: r.y, w: r.width, h: r.height,
        z: effectiveZ(el, s),
        imeditId: el.getAttribute('data-imedit-id') || null,
        // Legacy field for the simple emit path:
        fill: cssColor(s.backgroundColor),
        // New fields for alpha-blend + gradient (Step 6):
        ownBg,
        bgImage,
        bgChain,
        // Geometry detection (Step 9):
        clipPath: s.clipPath || 'none',
        radius: parseFloat(s.borderTopLeftRadius),
        radiusRaw: s.borderTopLeftRadius || '0px',
        borders: {
          top:    { w: parseFloat(s.borderTopWidth)    || 0, c: cssColor(s.borderTopColor), style: s.borderTopStyle },
          right:  { w: parseFloat(s.borderRightWidth)  || 0, c: cssColor(s.borderRightColor), style: s.borderRightStyle },
          bottom: { w: parseFloat(s.borderBottomWidth) || 0, c: cssColor(s.borderBottomColor), style: s.borderBottomStyle },
          left:   { w: parseFloat(s.borderLeftWidth)   || 0, c: cssColor(s.borderLeftColor), style: s.borderLeftStyle },
        },
        borderColor: cssColor(s.borderTopColor),
        borderWidth: parseFloat(s.borderTopWidth) || 0,
        borderStyle: s.borderTopStyle || 'none',
      };
    }

    function buildList(el, s, r, domIndex, bgChain) {
      // Use flattenNestedULPage for proper inline-run preservation + nested handling.
      const flat = flattenNestedULPage(el);
      if (flat.length === 0) return null;
      // Also capture list-style-type so Node can map bullet glyphs.
      const listStyleType = s.listStyleType || 'disc';
      return {
        kind: 'list',
        domIndex,
        x: r.x, y: r.y, w: r.width, h: r.height,
        z: effectiveZ(el, s),
        imeditId: el.getAttribute('data-imedit-id') || null,
        items: flat, // [{level, runs:[{text,bold?,italic?,breakLine?}]}]
        listStyleType,
        fontFamily: s.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
        fontSize: parseFloat(s.fontSize),
        color: cssColor(s.color),
        padding: {
          top:    parseFloat(s.paddingTop)    || 0,
          right:  parseFloat(s.paddingRight)  || 0,
          bottom: parseFloat(s.paddingBottom) || 0,
          left:   parseFloat(s.paddingLeft)   || 0,
        },
      };
    }

    function buildImage(el, r, domIndex) {
      return {
        kind: 'image',
        domIndex,
        x: r.x, y: r.y, w: r.width, h: r.height,
        z: 0,
        imeditId: el.getAttribute('data-imedit-id') || null,
        src: el.src,
        alt: el.alt,
      };
    }

    const out = [];
    const all = document.querySelectorAll('section.slide *');
    let domIndex = 0;
    for (const el of all) {
      if (!visible(el)) continue;
      const tag = el.tagName;
      if (tag === 'svg' || tag === 'SVG') continue;
      if (el.closest && el.closest('svg')) continue;

      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const bgChain = buildBgChain(el);

      // Feature 1: shape (background or border)
      const hasFill = s.backgroundColor && s.backgroundColor !== 'rgba(0, 0, 0, 0)' && s.backgroundColor !== 'transparent';
      const hasBgImage = s.backgroundImage && s.backgroundImage !== 'none';
      const hasBorder = parseFloat(s.borderTopWidth) > 0 || parseFloat(s.borderRightWidth) > 0 ||
                        parseFloat(s.borderBottomWidth) > 0 || parseFloat(s.borderLeftWidth) > 0;
      if (hasFill || hasBgImage || hasBorder) {
        domIndex++;
        out.push(buildShape(el, s, r, domIndex, bgChain));
      }

      // Feature 2: image
      if (tag === 'IMG') {
        domIndex++;
        const img = buildImage(el, r, domIndex);
        if (img.src) out.push(img);
        continue;
      }

      // Feature 3: list
      if (LIST_TAGS.has(tag)) {
        // Skip if any ancestor UL/OL — parent's flattenNestedULPage already covers it.
        let ancUL = el.parentElement;
        let underUL = false;
        while (ancUL) {
          if (LIST_TAGS.has(ancUL.tagName)) { underUL = true; break; }
          ancUL = ancUL.parentElement;
        }
        if (underUL) continue;
        domIndex++;
        const list = buildList(el, s, r, domIndex, bgChain);
        if (list) out.push(list);
        continue;
      }

      // Feature 4: text frame
      const isTextTag = TEXT_TAGS.has(tag);
      const isInlineFormatting = INLINE_FORMATTING_TAGS.has(tag);
      const isLi = tag === 'LI';
      const ancestorOwnsText = ancestorWouldCaptureText(el);
      const isBareTextDiv = !isTextTag && !isInlineFormatting && !isLi && hasDirectText(el) && !ancestorOwnsText;
      if ((isTextTag && !ancestorOwnsText) || isBareTextDiv) {
        domIndex++;
        const tf = buildTextFrame(el, s, r, domIndex, bgChain);
        if (tf) out.push(tf);
      }
    }

    // Capture slide-level background
    const slideEl = document.querySelector('section.slide');
    let slideBg = null;
    if (slideEl) {
      const sBg = getComputedStyle(slideEl).backgroundColor;
      if (sBg && sBg !== 'rgba(0, 0, 0, 0)' && sBg !== 'transparent') {
        slideBg = cssColor(sBg);
      }
    }

    // Capture SVG bounding boxes
    const svgBoxes = [];
    document.querySelectorAll('section.slide svg').forEach((svg, idx) => {
      const r = svg.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return;
      const id = `__ime_svg_${idx}`;
      svg.setAttribute('data-ime-svg-id', id);
      svgBoxes.push({ id, x: r.x, y: r.y, w: r.width, h: r.height });
    });

    return { elements: out, slideBg, svgBoxes };
  });

  // ---- Node-side post-processing ----

  // Step 6: Resolve effective backgrounds via alpha-blending using helpers.
  for (const el of result.elements) {
    if (el.kind !== 'shape') continue;
    // First, try gradient (Step 6 / C36) — only if no solid colour set.
    if (!el.ownBg && el.bgImage && el.bgImage !== 'none' && el.bgImage.includes('gradient(')) {
      const gradHex = parseGradient(el.bgImage);
      if (gradHex) {
        el.fill = gradHex;
        continue;
      }
    }
    if (!el.ownBg) continue;
    // Find the backdrop colour for blending (first opaque ancestor) — drop the
    // current element's own bg from the chain so the resolver looks past it.
    const ancestorChain = (el.bgChain || []).slice(1);
    const backdrop = resolveBackdrop(ancestorChain, 'FFFFFF');
    el.fill = blendOver(el.ownBg, backdrop);
  }

  // Step 7: Stable z-order sort by (z asc, domIndex asc).
  const elements = stableSortByZ(result.elements);
  const slideBg = result.slideBg;
  const svgBoxes = result.svgBoxes || [];

  // Screenshot SVG icons as PNGs (kept in memory as data URIs)
  const svgImages = [];
  for (const box of svgBoxes) {
    try {
      const handle = await page.$(`[data-ime-svg-id="${box.id}"]`);
      if (!handle) continue;
      const buf = await handle.screenshot({ type: 'png', omitBackground: true });
      const dataUri = 'data:image/png;base64,' + buf.toString('base64');
      svgImages.push({ box, dataUri });
    } catch (e) { /* skip */ }
  }

  await browser.close();

  const slide = pres.addSlide();

  function pickShapeType(el) {
    const radius = el.radius || 0;
    const minDim = Math.min(el.w, el.h);
    if (radius >= minDim * 0.45) return pres.ShapeType.ellipse;
    if (radius > 1) return pres.ShapeType.roundRect;
    return pres.ShapeType.rect;
  }

  function paddedFrame(el) {
    const p = el.padding || { top: 0, right: 0, bottom: 0, left: 0 };
    return {
      x: PX_TO_IN(el.x + p.left),
      y: PX_TO_IN(el.y + p.top),
      w: PX_TO_IN(Math.max(1, el.w - p.left - p.right)),
      h: PX_TO_IN(Math.max(1, el.h - p.top - p.bottom)),
    };
  }

  if (slideBg) {
    slide.background = { color: slideBg };
  }
  const warnings = [];

  for (const el of elements) {
    const x = PX_TO_IN(el.x);
    const y = PX_TO_IN(el.y);
    const w = PX_TO_IN(el.w);
    const h = PX_TO_IN(el.h);

    if (el.kind === 'shape') {
      const thinH = el.h < 4;
      const thinW = el.w < 4;

      if (thinH && !thinW) {
        const b = el.borders || {};
        const lineColor = el.fill || (b.top && b.top.c) || (b.bottom && b.bottom.c) || '67817F';
        slide.addShape(pres.ShapeType.rect, {
          x, y, w, h: Math.max(0.01, h),
          fill: { color: lineColor },
          line: { type: 'none' },
        });
        continue;
      }
      if (thinW && !thinH) {
        const b = el.borders || {};
        const lineColor = el.fill || (b.left && b.left.c) || (b.right && b.right.c) || '67817F';
        slide.addShape(pres.ShapeType.rect, {
          x, y, w: Math.max(0.01, w), h,
          fill: { color: lineColor },
          line: { type: 'none' },
        });
        continue;
      }
      if (thinH && thinW) continue;

      // Step 9: chevron / triangle detection from clip-path
      const chev = detectClipPathChevron(el.clipPath);
      if (chev) {
        const stype = chev.shape === 'triangle' ? pres.ShapeType.triangle : pres.ShapeType.chevron;
        const sopts = { x, y, w, h };
        if (el.fill) sopts.fill = { color: el.fill };
        else sopts.fill = { type: 'none' };
        sopts.line = { type: 'none' };
        if (chev.rotation) sopts.rotate = chev.rotation;
        slide.addShape(stype, sopts);
        continue;
      }

      // Standard rectangle — handle borders per-side
      const opts = { x, y, w, h };
      if (el.fill) opts.fill = { color: el.fill };
      const b = el.borders || { top:{w:0}, right:{w:0}, bottom:{w:0}, left:{w:0} };
      const sides = ['top', 'right', 'bottom', 'left'].filter(s => b[s] && b[s].w > 0);
      const allFour = sides.length === 4;
      const sameWidth = allFour && new Set(sides.map(s => b[s].w)).size === 1;
      const sameColor = allFour && new Set(sides.map(s => b[s].c)).size === 1;

      // Determine border dash style (C24)
      const borderDash = parseBorderStyle(el.borderStyle);

      if (allFour && sameWidth && sameColor) {
        const line = { color: b.top.c, width: b.top.w };
        if (borderDash === 'dash') line.dashType = 'dash';
        opts.line = line;
        slide.addShape(pickShapeType(el), opts);
      } else {
        opts.line = { type: 'none' };
        slide.addShape(pickShapeType(el), opts);
        const PX_TO_IN_LOCAL = (p) => p / 96;
        for (const side of sides) {
          const bw = b[side].w;
          const bc = b[side].c || '67817F';
          const bs = b[side].style;
          const dash = parseBorderStyle(bs);
          const bwIn = PX_TO_IN_LOCAL(bw);
          let sx = x, sy = y, sw = w, sh = h;
          if (side === 'top')    { sh = bwIn; }
          if (side === 'bottom') { sy = y + h - bwIn; sh = bwIn; }
          if (side === 'left')   { sw = bwIn; }
          if (side === 'right')  { sx = x + w - bwIn; sw = bwIn; }
          // Render dashed sides via a no-fill rect with a dashed border
          if (dash === 'dash' && bw > 0) {
            slide.addShape(pres.ShapeType.line, {
              x: sx, y: sy, w: sw, h: sh,
              line: { color: bc, width: bw, dashType: 'dash' },
            });
          } else {
            slide.addShape(pres.ShapeType.rect, {
              x: sx, y: sy, w: sw, h: sh,
              fill: { color: bc },
              line: { type: 'none' },
            });
          }
        }
      }
      continue;
    }

    if (el.kind === 'text-frame') {
      const inner = paddedFrame(el);
      let fx = inner.x, fy = inner.y, fw = inner.w + 0.02, fh = inner.h + 0.06;
      const rot = el.rotateDeg || 0;
      if (rot === 90 || rot === -90) {
        const cx = inner.x + inner.w / 2;
        const cy = inner.y + inner.h / 2;
        const newW = inner.h;
        const newH = inner.w;
        fx = cx - newW / 2;
        fy = cy - newH / 2;
        fw = newW + 0.06;
        fh = newH + 0.04;
      }
      const opts = {
        x: fx,
        y: fy,
        w: fw,
        h: fh,
        fontFace: el.fontFamily,
        fontSize: el.fontSize * 0.75,
        color: el.color || '000000',
        bold: parseInt(el.fontWeight) >= 600 || el.fontWeight === 'bold',
        italic: el.italic,
        align: el.align === 'center' ? 'center' : el.align === 'right' ? 'right' : 'left',
        valign: 'top',
        margin: 0,
      };
      if (rot !== 0) opts.rotate = rot;

      // Step 10: letter-spacing → charSpacing (C21)
      if (el.letterSpacing && el.letterSpacing !== '0px' && el.letterSpacing !== 'normal') {
        const cs = letterSpacingToCharSpacing(el.letterSpacing, el.fontSize);
        if (cs) opts.charSpacing = cs;
      }

      // Step 11: flex/grid alignment (C10, C11)
      if (el.parentFlex) {
        const fa = mapFlexAlign(el.parentFlex, el.parentFlex.flexDirection || 'row');
        if (fa.valign) opts.valign = fa.valign;
        if (fa.align) opts.align = fa.align;
      }

      const upper = el.textTransform === 'uppercase';
      if (el.runs && el.runs.length > 0) {
        const styledRuns = el.runs.map(r => ({
          text: upper ? r.text.toUpperCase() : r.text,
          options: { italic: r.italic, bold: r.bold },
        }));
        slide.addText(styledRuns, opts);
      } else {
        let text = el.text;
        if (upper) text = text.toUpperCase();
        slide.addText(text, opts);
      }
      continue;
    }

    if (el.kind === 'list') {
      const inner = paddedFrame(el);
      const opts = {
        x: inner.x,
        y: inner.y,
        w: inner.w + 0.02,
        h: inner.h + 0.06,
        fontFace: el.fontFamily,
        fontSize: el.fontSize * 0.75,
        color: el.color || '000000',
        valign: 'top',
        margin: 0,
        paraSpaceAfter: 6,
      };
      // Step 8: bullets with per-level indent + inline-run preservation
      const bulletGlyph = mapBulletGlyph(el.listStyleType);
      const items = el.items || [];
      const paragraphs = [];
      items.forEach((item, idx) => {
        const level = item.level || 0;
        const runs = (item.runs && item.runs.length) ? item.runs : [{ text: '' }];
        // Each run carries its own breakLine flag from helpers/list.js;
        // we still need a breakLine between paragraphs (except last).
        runs.forEach((r, ri) => {
          const text = r.text || '';
          const isLastRunOfItem = ri === runs.length - 1;
          const isLastItem = idx === items.length - 1;
          const runOpts = {};
          if (r.bold) runOpts.bold = true;
          if (r.italic) runOpts.italic = true;
          if (r.color) runOpts.color = r.color;
          // Bullet attaches to the first run of each paragraph
          if (ri === 0) {
            runOpts.bullet = bulletGlyph
              ? { type: 'bullet', code: bulletGlyph.code, indent: 6 + 12 * level }
              : { type: 'bullet', indent: 6 + 12 * level };
          }
          // breakLine: between runs if r.breakLine, between paragraphs at end of item
          if (r.breakLine) runOpts.breakLine = true;
          if (isLastRunOfItem && !isLastItem) runOpts.breakLine = true;
          paragraphs.push({ text, options: runOpts });
        });
      });
      if (paragraphs.length) slide.addText(paragraphs, opts);
      continue;
    }

    if (el.kind === 'image') {
      const opts = { x, y, w, h };
      if (el.src.startsWith('data:')) {
        opts.data = el.src;
      } else {
        opts.path = el.src.replace(/^file:\/\/\//, '');
      }
      slide.addImage(opts);
      continue;
    }
  }

  // Emit SVG icon images LAST so they paint on top of the shape circles that contain them
  for (const { box, dataUri } of svgImages) {
    slide.addImage({
      data: dataUri,
      x: PX_TO_IN(box.x),
      y: PX_TO_IN(box.y),
      w: PX_TO_IN(box.w),
      h: PX_TO_IN(box.h),
    });
  }

  return { warnings };
}
