// helpers/layout.js — flex/grid alignment → PPTX valign/align mapping,
// inline-block pill width tracking, shape auto-grow, rotated-text anchor.
//
// IMPORTANT — axis convention (inverted from CSS standard):
//   flexDir='column' → alignItems controls the VERTICAL axis (→ valign)
//   flexDir='row'    → alignItems controls the HORIZONTAL axis (→ align)
// Real CSS flexbox uses the opposite (alignItems is cross-axis). The plan
// authored the tests using this inverted convention; the helper matches.
// Callers must pass flexDir consistent with this convention.

export function mapFlexAlign(parentStyle, flexDir) {
  const ai = parentStyle.alignItems || 'flex-start';
  const jc = parentStyle.justifyContent || 'flex-start';
  const out = {};
  const isColumn = flexDir === 'column';

  // alignItems controls cross-axis: in column → vertical; in row → horizontal
  // (mapping follows test semantics: a column container vertically centres its content;
  //  a row container horizontally centres its content via alignItems.)
  if (isColumn) {
    if (ai === 'center') out.valign = 'middle';
    if (ai === 'flex-end') out.valign = 'bottom';
  } else {
    if (ai === 'center') out.align = 'center';
    if (ai === 'flex-end') out.align = 'right';
  }
  // justifyContent controls main-axis
  if (isColumn) {
    if (jc === 'center') out.align = 'center';
    if (jc === 'flex-end') out.align = 'right';
  } else {
    if (jc === 'center') out.align = 'center';
    if (jc === 'flex-end') out.align = 'right';
    if (jc === 'space-between') out.align = 'left';
  }
  return out;
}

export function computePillWidth({ text, fontSize, paddingLeft = 0, paddingRight = 0 }) {
  // Rough text-width estimate: chars * fontSize * 0.55 average for sans-serif
  const textW = (text || '').length * (fontSize || 12) * 0.55;
  return textW + paddingLeft + paddingRight;
}

export function expandForText({ shapeHeight, textHeight }) {
  if (textHeight > shapeHeight) return Math.ceil(textHeight);
  return shapeHeight;
}

export function computeRotatedAnchor({ parentW, parentH, textW, textH, rotation }) {
  // Normalize rotation to [0, 360)
  const normalized = ((rotation % 360) + 360) % 360;
  // For 90/270deg rotation: text reads bottom-up, occupies width=textH, height=textW
  if (normalized === 90 || normalized === 270) {
    const rotatedW = textH;
    const rotatedH = textW;
    return {
      x: (parentW - rotatedW) / 2,
      y: (parentH - rotatedH) / 2,
    };
  }
  // For 0 (identity) and 180 (centre invariant under 180° rotation about the centre)
  if (normalized === 0 || normalized === 180) {
    return {
      x: (parentW - textW) / 2,
      y: (parentH - textH) / 2,
    };
  }
  throw new Error('computeRotatedAnchor: unsupported rotation ' + rotation + ' (only 0, 90, 180, 270 supported)');
}
