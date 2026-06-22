import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const THUMB_DIR = join(__dirname, '..', 'assets', 'thumbnails');

const cache = new Map();

export async function renderThumbnail(layoutName) {
  if (cache.has(layoutName)) return cache.get(layoutName);
  try {
    const html = await readFile(join(THUMB_DIR, `${layoutName}.html`), 'utf8');
    cache.set(layoutName, html);
    return html;
  } catch (e) {
    if (e.code === 'ENOENT') {
      const fallback = `<div class="ifd-thumb" style="background:#F2F2F1;display:flex;align-items:center;justify-content:center;color:#888;font-size:9px;">no recipe: ${layoutName}</div>`;
      cache.set(layoutName, fallback);
      return fallback;
    }
    throw e;
  }
}
