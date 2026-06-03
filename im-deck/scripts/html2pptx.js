import { chromium } from 'playwright';

const PX_TO_IN = (px) => px / 96;
const SLIDE_W_PX = 1280;
const SLIDE_H_PX = 720;

export async function html2pptx(htmlPath, pres) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: SLIDE_W_PX, height: SLIDE_H_PX } });
  const page = await ctx.newPage();

  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });

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

    function visible(el) {
      const s = getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) < 0.05) return false;
      const r = el.getBoundingClientRect();
      // Allow very thin elements (1-2px underlines) — only filter zero/sub-pixel
      if (r.width < 0.5 || r.height < 0.5) return false;
      // Skip im-edit chrome and deck nav chrome
      if (el.closest && el.closest('.ime-toolbar, .ime-comments-panel, .ime-comment-popover, .ime-comment-pin, .ime-selection-halo, nav.nav, .print-modal')) return false;
      return true;
    }

    const TEXT_TAGS = new Set(['P','H1','H2','H3','H4','H5','H6','SPAN','TH','TD']);
    const LIST_TAGS = new Set(['UL','OL']);

    const INLINE_FORMATTING_TAGS = new Set(['STRONG','B','EM','I','U']);

    function hasDirectText(el) {
      if (el.children.length > 0) return false;
      const t = (el.textContent || '').trim();
      return t.length > 0;
    }

    function ancestorWouldCaptureText(el) {
      // Walk up; if any ancestor is a text tag or list tag, this element's text
      // is already in that ancestor's textContent / items array — don't double-emit.
      let p = el.parentElement;
      while (p) {
        const ptag = p.tagName;
        if (TEXT_TAGS.has(ptag)) return true;
        if (LIST_TAGS.has(ptag)) return true;
        p = p.parentElement;
      }
      return false;
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

    function buildTextFrame(el, s, r) {
      const text = el.textContent.trim();
      if (!text) return null;
      const item = {
        kind: 'text-frame',
        x: r.x, y: r.y, w: r.width, h: r.height,
        z: parseInt(s.zIndex) || 0,
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
      };
      const runs = extractRuns(el);
      if (runs) item.runs = runs;
      return item;
    }

    function buildShape(el, s, r) {
      return {
        kind: 'shape',
        x: r.x, y: r.y, w: r.width, h: r.height,
        z: parseInt(s.zIndex) || 0,
        imeditId: el.getAttribute('data-imedit-id') || null,
        fill: cssColor(s.backgroundColor),
        radius: parseFloat(s.borderTopLeftRadius),
        borders: {
          top:    { w: parseFloat(s.borderTopWidth)    || 0, c: cssColor(s.borderTopColor) },
          right:  { w: parseFloat(s.borderRightWidth)  || 0, c: cssColor(s.borderRightColor) },
          bottom: { w: parseFloat(s.borderBottomWidth) || 0, c: cssColor(s.borderBottomColor) },
          left:   { w: parseFloat(s.borderLeftWidth)   || 0, c: cssColor(s.borderLeftColor) },
        },
        borderColor: cssColor(s.borderTopColor),
        borderWidth: parseFloat(s.borderTopWidth) || 0,
      };
    }

    function buildList(el, s, r) {
      const items = Array.from(el.children).map(li => li.textContent.trim()).filter(t => t);
      if (items.length === 0) return null;
      return {
        kind: 'list',
        x: r.x, y: r.y, w: r.width, h: r.height,
        z: parseInt(s.zIndex) || 0,
        imeditId: el.getAttribute('data-imedit-id') || null,
        items,
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

    function buildImage(el, r) {
      return {
        kind: 'image',
        x: r.x, y: r.y, w: r.width, h: r.height,
        imeditId: el.getAttribute('data-imedit-id') || null,
        src: el.src,
        alt: el.alt,
      };
    }

    const out = [];
    const all = document.querySelectorAll('section.slide *');
    for (const el of all) {
      if (!visible(el)) continue;
      const tag = el.tagName;
      if (tag === 'svg' || tag === 'SVG') continue;
      if (el.closest && el.closest('svg')) continue;

      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();

      // Feature 1: shape (background or border)
      const hasFill = s.backgroundColor && s.backgroundColor !== 'rgba(0, 0, 0, 0)' && s.backgroundColor !== 'transparent';
      const hasBorder = parseFloat(s.borderTopWidth) > 0 || parseFloat(s.borderRightWidth) > 0 ||
                        parseFloat(s.borderBottomWidth) > 0 || parseFloat(s.borderLeftWidth) > 0;
      if (hasFill || hasBorder) {
        out.push(buildShape(el, s, r));
      }

      // Feature 2: image
      if (tag === 'IMG') {
        const img = buildImage(el, r);
        if (img.src) out.push(img);
        continue;
      }

      // Feature 3: list
      if (LIST_TAGS.has(tag)) {
        const list = buildList(el, s, r);
        if (list) out.push(list);
        continue;
      }

      // Feature 4: text frame (text tag OR bare-text-in-div)
      const isTextTag = TEXT_TAGS.has(tag);
      const isInlineFormatting = INLINE_FORMATTING_TAGS.has(tag);
      const isLi = tag === 'LI';
      const ancestorOwnsText = ancestorWouldCaptureText(el);
      const isBareTextDiv = !isTextTag && !isInlineFormatting && !isLi && hasDirectText(el) && !ancestorOwnsText;
      if ((isTextTag && !ancestorOwnsText) || isBareTextDiv) {
        const tf = buildTextFrame(el, s, r);
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

    // Capture SVG bounding boxes; tag them so Node can screenshot
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

  const elements = result.elements;
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
    } catch (e) {
      // Non-fatal: skip this icon
    }
  }

  await browser.close();

  const slide = pres.addSlide();

  function pickShapeType(el) {
    // border-radius >= 45% of min dimension → ellipse (circle if square, oval otherwise)
    // border-radius > 1px → roundRect
    // otherwise → rect
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

      // Thin elements (CSS underlines, hairlines) — render as filled rects with no border
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

      // Standard rectangle — handle borders per-side
      const opts = { x, y, w, h };
      if (el.fill) opts.fill = { color: el.fill };
      const b = el.borders || { top:{w:0}, right:{w:0}, bottom:{w:0}, left:{w:0} };
      const sides = ['top', 'right', 'bottom', 'left'].filter(s => b[s] && b[s].w > 0);
      const allFour = sides.length === 4;
      const sameWidth = allFour && new Set(sides.map(s => b[s].w)).size === 1;
      const sameColor = allFour && new Set(sides.map(s => b[s].c)).size === 1;

      if (allFour && sameWidth && sameColor) {
        opts.line = { color: b.top.c, width: b.top.w };
        slide.addShape(pickShapeType(el), opts);
      } else {
        opts.line = { type: 'none' };
        slide.addShape(pickShapeType(el), opts);
        const PX_TO_IN_LOCAL = (p) => p / 96;
        for (const side of sides) {
          const bw = b[side].w;
          const bc = b[side].c || '67817F';
          const bwIn = PX_TO_IN_LOCAL(bw);
          let sx = x, sy = y, sw = w, sh = h;
          if (side === 'top')    { sh = bwIn; }
          if (side === 'bottom') { sy = y + h - bwIn; sh = bwIn; }
          if (side === 'left')   { sw = bwIn; }
          if (side === 'right')  { sx = x + w - bwIn; sw = bwIn; }
          slide.addShape(pres.ShapeType.rect, {
            x: sx, y: sy, w: sw, h: sh,
            fill: { color: bc },
            line: { type: 'none' },
          });
        }
      }
      continue;
    }

    if (el.kind === 'text-frame') {
      // Compute the inner content rectangle (subtracts CSS padding from the border-box bbox)
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
      // Each item as its own bulleted paragraph
      const runs = el.items.map((t, idx) => ({
        text: t,
        options: { bullet: true, breakLine: idx < el.items.length - 1 },
      }));
      slide.addText(runs, opts);
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
