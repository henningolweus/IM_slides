// helpers/text-frame.js — text-frame placement edge cases.

export function letterSpacingToCharSpacing(letterSpacing, fontSize) {
  if (!letterSpacing || letterSpacing === 'normal' || letterSpacing === '0px') return 0;
  const px = parseFloat(letterSpacing);
  if (!isFinite(px)) return 0;
  // CSS letter-spacing is in px (after computation). pptxgenjs `charSpacing` is in POINTS;
  // pptxgenjs internally multiplies by 100 to produce the OOXML `spc` attribute (1/100 pt).
  // So we convert px → pt only: pt = px * 0.75. The previous helper returned px * 75
  // (i.e. 100x too large), causing pptxgenjs to write spc values of ~15,000 (=150 pt
  // extra per character), forcing every character to wrap onto its own line.
  return +(px * 0.75).toFixed(2);
}

export function smallCapsRuns(text, baseSize) {
  if (!text) return [];
  const smallSize = +(baseSize * 0.7).toFixed(1);
  const runs = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    // Whitespace and non-letter chars at base size
    if (!/[a-zA-Z]/.test(ch)) {
      let j = i;
      while (j < text.length && !/[a-zA-Z]/.test(text[j])) j++;
      runs.push({ text: text.slice(i, j), size: baseSize });
      i = j;
      continue;
    }
    // Letter word: first char at base, rest uppercased at smallSize
    if (ch === ch.toUpperCase()) {
      runs.push({ text: ch, size: baseSize });
      i++;
      let j = i;
      while (j < text.length && /[a-z]/.test(text[j])) j++;
      if (j > i) {
        runs.push({ text: text.slice(i, j).toUpperCase(), size: smallSize });
        i = j;
      }
    } else {
      // Lowercase-leading word: all uppercase small-caps
      let j = i;
      while (j < text.length && /[a-z]/.test(text[j])) j++;
      runs.push({ text: text.slice(i, j).toUpperCase(), size: smallSize });
      i = j;
    }
  }
  return runs;
}

export function brToBreakLine(childNodes) {
  const out = [];
  let pendingBreak = false;
  for (const c of childNodes) {
    if (c.type === 'br') { pendingBreak = true; continue; }
    if (c.type === 'text') {
      const r = { text: c.text };
      if (pendingBreak) { r.breakLine = true; pendingBreak = false; }
      out.push(r);
    }
  }
  return out;
}

export function marginTopToParaSpaceBefore(marginTop) {
  if (!marginTop) return 0;
  const px = parseFloat(marginTop);
  if (!isFinite(px)) return 0;
  // px → pt
  return +(px * 0.75).toFixed(1);
}
