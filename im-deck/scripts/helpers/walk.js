// helpers/walk.js — DOM walking primitives that are safe to evaluate either
// inside the Playwright page context or as Node functions on serialised input.

// Used inside page.evaluate() — must be self-contained (no closures over Node imports).
export const PAGE_HELPERS = `
  function hasFlowingText(el) {
    if (!el || !el.childNodes) return false;
    for (const child of el.childNodes) {
      if (child.nodeType === 3 && child.textContent.trim()) return true;
    }
    return false;
  }
  // True if any inline-formatting descendant is present
  function hasInlineFormatting(el) {
    return !!el.querySelector && !!el.querySelector('strong, b, em, i, u, span[style*="color"]');
  }
`;

// Node-side mirror of hasFlowingText for unit testing
export function hasFlowingText(el) {
  if (!el || !el.childNodes) return false;
  for (const child of el.childNodes) {
    if (child.nodeType === 3 && child.textContent.trim()) return true;
  }
  return false;
}

// Apply im-edit style overrides into the per-slide HTML before screenshot.
// state.overrides is a map from data-imedit-id → { css-property: value }
// Fallback: deck's #im-edit-state uses state.styles in the same shape.
export function applyStyleOverrides(html, state) {
  if (!state) return html;
  const overrides = state.overrides || state.styles;
  if (!overrides) return html;
  let out = html;
  for (const [id, props] of Object.entries(overrides)) {
    if (!props || Object.keys(props).length === 0) continue;
    const cssAdditions = Object.entries(props).map(([k, v]) => `${k}: ${v};`).join(' ');
    // Find tag with data-imedit-id="<id>" and append/inject style.
    const re = new RegExp(
      `(<[a-z][a-z0-9-]*\\b[^>]*?\\bdata-imedit-id=["']${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*?)(\\s+style=(["'])([^"']*)\\3)?([^>]*>)`,
      'gi'
    );
    out = out.replace(re, (m, pre, _styleAttr, _quote, existingStyle, post) => {
      const combined = (existingStyle && existingStyle.trim())
        ? existingStyle.replace(/;?\s*$/, '; ') + cssAdditions
        : cssAdditions;
      return `${pre} style="${combined}"${post}`;
    });
  }
  return out;
}
