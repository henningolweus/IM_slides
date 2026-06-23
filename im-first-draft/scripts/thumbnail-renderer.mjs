import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const THUMB_DIR = join(__dirname, '..', 'assets', 'thumbnails');

const cache = new Map();

export async function renderThumbnail(layoutName) {
  // Variants (layout:variant) prefer a variant-specific recipe file (layout-variant.html);
  // fall back to the base layout file if none exists. Cache by the resolved key.
  const hasVariant = layoutName.includes(':');
  const baseName = hasVariant ? layoutName.split(':')[0] : layoutName;
  const variantName = hasVariant ? layoutName.replace(':', '-') : null;

  if (cache.has(layoutName)) return cache.get(layoutName);

  if (variantName) {
    try {
      const html = await readFile(join(THUMB_DIR, `${variantName}.html`), 'utf8');
      cache.set(layoutName, html);
      return html;
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
      // fall through to base
    }
  }

  try {
    const html = await readFile(join(THUMB_DIR, `${baseName}.html`), 'utf8');
    cache.set(layoutName, html);
    return html;
  } catch (e) {
    if (e.code === 'ENOENT') {
      const fallback = `<div class="ifd-thumb" style="background:#F2F2F1;display:flex;align-items:center;justify-content:center;color:#888;font-size:9px;">no recipe: ${baseName}</div>`;
      cache.set(layoutName, fallback);
      return fallback;
    }
    throw e;
  }
}
