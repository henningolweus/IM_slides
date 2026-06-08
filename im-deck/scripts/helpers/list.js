// helpers/list.js — list extraction with proper inline-run preservation,
// nested-list handling, and bullet-glyph mapping.

const BOLD_TAGS = new Set(['STRONG', 'B']);
const ITAL_TAGS = new Set(['EM', 'I']);
const BR_TAG = 'BR';
const UL_TAGS = new Set(['UL', 'OL']);

// Returns an array of { text, bold?, italic?, breakLine?, color? }
export function extractLiRuns(li, inheritedState = {}) {
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
      if (tag === BR_TAG) { pendingBreak = true; return; }
      if (UL_TAGS.has(tag)) return; // nested UL handled by flattenNestedUL
      const childState = {
        bold: state.bold || BOLD_TAGS.has(tag),
        italic: state.italic || ITAL_TAGS.has(tag),
        color: state.color, // span color extraction handled by walker on serialised DOM
      };
      const cn = node.childNodes || [];
      for (const c of cn) walk(c, childState);
    }
  }

  for (const c of (li.childNodes || [])) walk(c, inheritedState);
  return runs;
}

export function mapBulletGlyph(listStyleType) {
  if (!listStyleType) return { code: '2022' };
  const s = listStyleType.replace(/['"\\]/g, '').trim();
  // Direct unicode char
  if (s.length === 1) {
    const cp = s.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
    return { code: cp };
  }
  // Escape sequence \2014
  const esc = listStyleType.match(/\\([0-9A-Fa-f]{2,5})/);
  if (esc) return { code: esc[1].toUpperCase().padStart(4, '0') };
  // CSS keyword
  const map = {
    'disc': '2022',
    'circle': '25CB',
    'square': '25A0',
    'none': null,
  };
  if (s.toLowerCase() in map) {
    return map[s.toLowerCase()] ? { code: map[s.toLowerCase()] } : { code: '2022' };
  }
  return { code: '2022' };
}

export function flattenNestedUL(ul, level = 0) {
  const items = [];
  for (const li of (ul.children || [])) {
    if (li.tagName !== 'LI') continue;
    // Direct runs (excluding any nested UL/OL inside this li)
    const directRuns = extractLiRuns(li);
    if (directRuns.length > 0) {
      items.push({ level, runs: directRuns });
    }
    // Find nested UL/OL children
    const childUls = (li.childNodes || []).filter(c => c.nodeType === 1 && UL_TAGS.has(c.tagName));
    for (const childUl of childUls) {
      items.push(...flattenNestedUL(childUl, level + 1));
    }
  }
  return items;
}
