import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = join(__dirname, '..', 'references', 'layout-catalog.md');

let cached = null;

export async function loadCatalog() {
  if (cached) return cached;
  const md = await readFile(CATALOG_PATH, 'utf8');
  const match = md.match(/```json\s*\n([\s\S]*?)\n```/);
  if (!match) throw new Error('layout-catalog.md is missing the ```json fenced block');
  cached = JSON.parse(match[1]);
  return cached;
}

export async function layoutsForTags(tags, excludeLayout = null) {
  const cat = await loadCatalog();
  const tagSet = new Set(tags);
  return cat.filter(entry => {
    if (entry.layout === excludeLayout) return false;
    return entry.tags.some(t => tagSet.has(t));
  });
}
