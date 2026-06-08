// helpers/pseudo.js — pseudo-element content parsing, CSS-border triangle
// detection, and border-style mapping. Pure functions.

export function parsePseudoContent(content) {
  if (!content || content === 'none' || content === 'normal') return null;
  const trimmed = content.trim();
  // Literal string in single or double quotes
  const literal = trimmed.match(/^["'](.*)["']$/);
  if (literal) return literal[1];
  // counter(name [, style])
  const counter = trimmed.match(/counter\(\s*([a-zA-Z_-]+)(?:\s*,\s*([a-zA-Z-]+))?\s*\)/);
  if (counter) return { counter: counter[1], style: counter[2] || 'decimal' };
  // Unsupported (attr(), url(), etc.) → return raw string for best-effort
  return trimmed;
}

export function isTriangleBorder(style) {
  const w = parseFloat(style.width) || 0;
  const h = parseFloat(style.height) || 0;
  if (w > 4 || h > 4) return { isTriangle: false };
  const bw = ['Top', 'Right', 'Bottom', 'Left'].map(s => parseFloat(style[`border${s}Width`]) || 0);
  const bc = ['Top', 'Right', 'Bottom', 'Left'].map(s => style[`border${s}Color`] || 'transparent');
  // Triangle pattern: exactly one side has a non-transparent color, opposing sides match its width
  const opaqueSides = bc.map((c, i) => (c !== 'transparent' && bw[i] > 0) ? i : -1).filter(i => i >= 0);
  if (opaqueSides.length !== 1) return { isTriangle: false };
  const i = opaqueSides[0];
  const pointsTo = ['bottom', 'left', 'top', 'right'][i]; // border-top filled → triangle points down? Actually points toward opposite. Standard CSS: filled side is the BASE, points toward opposite. border-left filled → points right.
  return { isTriangle: true, pointsTo, color: bc[i], size: bw[i] };
}

export function parseBorderStyle(s) {
  if (!s || s === 'none' || s === 'hidden') return null;
  if (s === 'dashed' || s === 'dotted') return 'dash';
  if (s === 'solid' || s === 'double' || s === 'groove' || s === 'ridge') return 'solid';
  return 'solid';
}

// Browser-context helpers used inside page.evaluate()
export const PAGE_HELPERS = `
  function readPseudo(el, which) {
    const s = getComputedStyle(el, which);
    if (!s || s.content === 'none' || s.content === '' || s.content === 'normal') return null;
    return {
      content: s.content,
      bg: s.backgroundColor,
      color: s.color,
      width: s.width,
      height: s.height,
      borderTopWidth: s.borderTopWidth, borderTopColor: s.borderTopColor,
      borderRightWidth: s.borderRightWidth, borderRightColor: s.borderRightColor,
      borderBottomWidth: s.borderBottomWidth, borderBottomColor: s.borderBottomColor,
      borderLeftWidth: s.borderLeftWidth, borderLeftColor: s.borderLeftColor,
      fontFamily: s.fontFamily,
      fontSize: s.fontSize,
      letterSpacing: s.letterSpacing,
    };
  }
`;
