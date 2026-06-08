// helpers/shapes.js — CSS clip-path detection → pptxgenjs ShapeType,
// SVG fill detection, border-radius mapping.

export function detectClipPathChevron(clipPath) {
  if (!clipPath || clipPath === 'none') return null;
  if (!clipPath.startsWith('polygon(')) return null;
  // Right-pointing chevron: 0 0, w-N 0, 100 50, w-N 100, 0 100  (5 points)
  // Left-pointing: N 0, 100 0, 100 100, N 100, 0 50 (5 points)
  // Triangle: 3 points
  const pts = [...clipPath.matchAll(/calc\([^)]+\)|-?\d+(?:\.\d+)?%?(?:px)?/g)].map(m => m[0]);
  const pairCount = Math.floor(pts.length / 2);
  if (pairCount === 3) return { shape: 'triangle', rotation: 0 };
  if (pairCount === 5) {
    // Heuristic on first x: if "0" → points right; if "calc" or larger value → points left
    const firstX = pts[0];
    if (firstX === '0%' || firstX === '0' || firstX === '0px') {
      return { shape: 'chevron', rotation: 0 };
    } else {
      return { shape: 'chevron', rotation: 180 };
    }
  }
  return null;
}

export function mapBorderRadius(value, width, height) {
  if (!value) return 0;
  const s = value.trim();
  if (s.endsWith('%')) {
    const pct = parseFloat(s) / 100;
    return Math.min(width, height) * pct;
  }
  return parseFloat(s) || 0;
}

export function detectSvgStrokeOnly(attrs) {
  if (!attrs) return false;
  const fill = (attrs.fill || '').toLowerCase();
  if (fill === 'none' || fill === 'transparent') return true;
  return false;
}
