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

export function normaliseLayoutHint(raw, catalog) {
  if (!raw) return null;
  const layoutNames = catalog.map(e => e.layout);
  const cleaned = raw.toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[/]/g, ' ')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (layoutNames.includes(cleaned)) return cleaned;
  const kebab = cleaned.replace(/\s+/g, '-');
  if (layoutNames.includes(kebab)) return kebab;
  const SYNONYMS = {
    'photo-left': 'purpose-photo-left',
    'purpose-right': 'purpose-photo-left',
    'photo-left purpose-right': 'purpose-photo-left',
    'two-panel framework': 'two-panel',
    'pull quote': 'pull-quote',
    'section divider': 'section-divider',
    'full-width body': 'full-width-body',
    'full-width body text': 'full-width-body',
    'full width body': 'full-width-body',
    'iconic 3-column': 'iconic-3-column',
    'iconic 3 column': 'iconic-3-column',
    'kpi dashboard': 'kpi-dashboard',
    'comparison table': 'comparison-table',
    'bleed-right panel': 'bleed-right',
    'moves grid': 'moves-grid'
  };
  if (SYNONYMS[cleaned]) return SYNONYMS[cleaned];
  for (const name of layoutNames) {
    const spaced = name.replace(/-/g, ' ');
    if (cleaned === name || cleaned === spaced) return name;
    if (cleaned.startsWith(name + ' ') || cleaned.startsWith(spaced + ' ')) return name;
    if (cleaned.startsWith(name) || cleaned.startsWith(spaced)) return name;
  }
  return null;
}
