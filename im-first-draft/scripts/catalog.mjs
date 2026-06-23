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
  const excludeBase = excludeLayout ? excludeLayout.split(':')[0] : null;
  return cat.filter(entry => {
    if (entry.layout === excludeBase) return false;
    return entry.tags.some(t => tagSet.has(t));
  });
}

export function normaliseLayoutHint(raw, catalog) {
  if (!raw) return null;
  // Strip variant suffix before matching, then re-attach
  const colonIdx = raw.lastIndexOf(':');
  const cleanedHead = colonIdx > 0 ? raw.slice(0, colonIdx) : raw;
  const variantSuffix = colonIdx > 0 ? raw.slice(colonIdx) : '';

  const layoutNames = catalog.map(e => e.layout);
  const cleaned = cleanedHead.toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[/]/g, ' ')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const tryMatch = (s) => {
    if (layoutNames.includes(s)) return s;
    const kebab = s.replace(/\s+/g, '-');
    if (layoutNames.includes(kebab)) return kebab;
    return null;
  };
  let match = tryMatch(cleaned);
  if (match) return match + variantSuffix;

  const SYNONYMS = {
    'photo-left': 'purpose-photo-left',
    'purpose-right': 'purpose-photo-left',
    'photo-left purpose-right': 'purpose-photo-left',
    'two-panel framework': 'two-panel',
    'pull quote': 'pull-quote',
    'section divider': 'segment-divider',
    'section-divider': 'segment-divider',
    'segment divider': 'segment-divider',
    'full-width body': 'full-width-body',
    'full-width body text': 'full-width-body',
    'full width body': 'full-width-body',
    'iconic 3-column': 'iconic-3-column',
    'iconic 3 column': 'iconic-3-column',
    'kpi dashboard': 'kpi-dashboard',
    'comparison table': 'comparison-table',
    'bleed-right panel': 'bleed-right',
    'moves grid': 'moves-grid',
    'thank you letter': 'photo-left-content:letter',
    'letter': 'photo-left-content:letter',
    'contents': 'photo-left-content:contents',
    'agenda': 'photo-left-content:contents',
    'team and investment': 'team-and-investment:compact',
    'person bio': 'person-bio',
    'cv': 'person-bio',
    'gantt': 'gantt-process',
    'process plan': 'gantt-process',
    'project plan': 'gantt-process',
    'vertical numbered list': 'vertical-numbered-list:dark-labels',
    'success criteria': 'vertical-numbered-list:dark-labels',
    'considerations': 'vertical-numbered-list:lettered',
    'quantified summary': 'quantified-summary',
    'photo card grid': 'photo-card-grid',
    'references': 'photo-card-grid',
    'credentials': 'photo-card-grid',
    'ring diagram': 'ring-diagram',
    'collaboration model': 'ring-diagram',
    'co-creation': 'ring-diagram'
  };
  if (SYNONYMS[cleaned]) return SYNONYMS[cleaned] + variantSuffix;

  for (const name of layoutNames) {
    const spaced = name.replace(/-/g, ' ');
    if (cleaned === name || cleaned === spaced) return name + variantSuffix;
    if (cleaned.startsWith(name + ' ') || cleaned.startsWith(spaced + ' ')) return name + variantSuffix;
    if (cleaned.startsWith(name) || cleaned.startsWith(spaced)) return name + variantSuffix;
  }
  return null;
}

// Layout hints may carry a :variant suffix (e.g. "two-panel:scr"). Split into [base, variant].
export function splitLayoutVariant(hint) {
  if (!hint) return { layout: null, variant: null };
  const idx = hint.indexOf(':');
  if (idx < 0) return { layout: hint, variant: null };
  return { layout: hint.slice(0, idx), variant: hint.slice(idx + 1) };
}
