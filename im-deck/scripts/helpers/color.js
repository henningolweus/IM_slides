// helpers/color.js — colour parsing, alpha blending, gradient sampling.
// Pure functions; no DOM access.

export function parseCssColor(input) {
  if (!input || input === 'transparent' || input === 'none') return null;
  const s = input.trim();
  if (s.startsWith('rgb')) {
    const nums = s.match(/[\d.]+/g);
    if (!nums) return null;
    const [r, g, b, a] = nums.map(Number);
    const alpha = a !== undefined ? a : 1;
    if (alpha < 0.001) return null; // fully transparent
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

export function blendOver(fg, bgHex) {
  if (!fg) return bgHex;
  if (fg.alpha >= 0.999) return fg.hex;
  if (fg.alpha <= 0.001) return bgHex;
  const fR = parseInt(fg.hex.slice(0, 2), 16);
  const fG = parseInt(fg.hex.slice(2, 4), 16);
  const fB = parseInt(fg.hex.slice(4, 6), 16);
  const bR = parseInt(bgHex.slice(0, 2), 16);
  const bG = parseInt(bgHex.slice(2, 4), 16);
  const bB = parseInt(bgHex.slice(4, 6), 16);
  const a = fg.alpha;
  const r = Math.round(a * fR + (1 - a) * bR);
  const g = Math.round(a * fG + (1 - a) * bG);
  const b = Math.round(a * fB + (1 - a) * bB);
  return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

export function resolveBackdrop(ancestorChain, fallback = 'FFFFFF') {
  // ancestorChain is ordered child → outermost; find first opaque ancestor bg
  for (const a of ancestorChain) {
    if (a.bg && a.bg.alpha >= 0.999) return a.bg.hex;
  }
  return fallback;
}

export function parseGradient(input) {
  if (!input || !input.includes('gradient(')) return null;
  // Match all rgb()/rgba() segments inside the gradient
  const colorMatches = [...input.matchAll(/rgba?\([^)]+\)/g)];
  if (colorMatches.length < 2) return null;
  // Take the midpoint color (or average of first and last if only 2)
  const parseRgb = (s) => {
    const nums = s.match(/[\d.]+/g);
    return nums ? nums.slice(0, 3).map(Number) : null;
  };
  const first = parseRgb(colorMatches[0][0]);
  const last = parseRgb(colorMatches[colorMatches.length - 1][0]);
  if (!first || !last) return null;
  const mid = [
    Math.round((first[0] + last[0]) / 2),
    Math.round((first[1] + last[1]) / 2),
    Math.round((first[2] + last[2]) / 2),
  ];
  return ((1 << 24) + (mid[0] << 16) + (mid[1] << 8) + mid[2]).toString(16).slice(1).toUpperCase();
}
