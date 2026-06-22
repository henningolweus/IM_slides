import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const THUMB_DIR = join(__dirname, '..', 'assets', 'thumbnails');

const cache = new Map();

export async function renderThumbnail(layoutName) {
  // Variants (layout:variant) share the base layout's thumbnail recipe in MVP.
  // Strip the variant suffix when looking up the file.
  const baseName = layoutName.includes(':') ? layoutName.split(':')[0] : layoutName;
  if (cache.has(baseName)) return cache.get(baseName);
  try {
    const html = await readFile(join(THUMB_DIR, `${baseName}.html`), 'utf8');
    cache.set(baseName, html);
    return html;
  } catch (e) {
    if (e.code === 'ENOENT') {
      const fallback = `<div class="ifd-thumb" style="background:#F2F2F1;display:flex;align-items:center;justify-content:center;color:#888;font-size:9px;">no recipe: ${baseName}</div>`;
      cache.set(baseName, fallback);
      return fallback;
    }
    throw e;
  }
}
