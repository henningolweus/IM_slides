# IM_ skill repair plan — 2026-06-23

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Repair systemic defects in the `im-first-draft` and `im-deck` skills so they cannot produce the broken Aker BP proposal output the user just saw, and regenerate the user's deck cleanly.

**Architecture:**
- Two skill repos are involved. `im-first-draft` lives loose at `~/.claude/skills/im-first-draft` and must be **moved into the versioned `im-skills` repo** with a junction back. `im-deck`, `im-edit`, `im-story` already sit as junctions to `im-skills/<name>`.
- The user's `im-skills` repo has 2,956 lines of uncommitted WIP across 6 files. Those changes must **survive untouched** — every commit in this plan is on its own focused diff.
- Fixes break into three commits: (1) move im-first-draft into the repo, (2) add the missing sorter assets + fix the backtick bug, (3) harden im-deck templates (action-title clamp, hide-rule symmetry, skill checklist additions). A fourth commit regenerates the Aker BP deck.

**Tech Stack:** Node.js 26 (ESM), cheerio (already a dep), Windows PowerShell 5.1, vanilla CSS/HTML/JS for sorter, git/GitHub for delivery.

**Sequencing rule:** Each task ends with a commit; no work crosses commit boundaries. Repo path is `C:\Users\heol\Documents\Pogrammering\Projects\im-skills` throughout.

**Out-of-scope:** The user's existing WIP modifications in `im-deck/references/*` and `im-story/*` — leave them. If a fix in this plan touches a file the user has modified, append edits at the appropriate line and confirm `git diff` shows the union of WIP + fix.

---

## Task 1 — Bring `im-first-draft` into the versioned repo

**Files:**
- Move: `C:\Users\heol\.claude\skills\im-first-draft\` → `C:\Users\heol\Documents\Pogrammering\Projects\im-skills\im-first-draft\`
- Create: junction at `C:\Users\heol\.claude\skills\im-first-draft` → repo path
- Verify: `C:\Users\heol\.claude\skills\im-first-draft\SKILL.md` reads through the junction

- [ ] **Step 1: Snapshot current state**
```powershell
$src = "C:\Users\heol\.claude\skills\im-first-draft"
$dst = "C:\Users\heol\Documents\Pogrammering\Projects\im-skills\im-first-draft"
Write-Output "src exists: $(Test-Path $src) ; dst exists: $(Test-Path $dst)"
(Get-Item $src).LinkType  # must be blank/null (a real folder, not a junction)
```
Expected: `src exists: True ; dst exists: False`, LinkType blank.

- [ ] **Step 2: Move folder into repo, preserving node_modules**
```powershell
Move-Item -Path "C:\Users\heol\.claude\skills\im-first-draft" -Destination "C:\Users\heol\Documents\Pogrammering\Projects\im-skills\im-first-draft" -Force
```

- [ ] **Step 3: Recreate the deployed path as a junction**
```powershell
New-Item -ItemType Junction -Path "C:\Users\heol\.claude\skills\im-first-draft" -Target "C:\Users\heol\Documents\Pogrammering\Projects\im-skills\im-first-draft"
(Get-Item "C:\Users\heol\.claude\skills\im-first-draft").LinkType  # must be Junction
```
Expected: `Junction`.

- [ ] **Step 4: Confirm round-trip — script still runs**
```powershell
node "C:\Users\heol\.claude\skills\im-first-draft\scripts\generate-firstdraft.mjs" "C:\Users\heol\Documents\Pogrammering\Projects\IM workshop\aker-bp-decarbonization-proposal-story.md"
```
Expected: writes the firstdraft HTML (still unstyled — that's fixed in Task 2). No errors.

- [ ] **Step 5: Add a `.gitignore` line for node_modules and commit just the skill move**
Append `im-first-draft/node_modules/` to `C:\Users\heol\Documents\Pogrammering\Projects\im-skills\.gitignore` (if not already covered by a broader `node_modules/` pattern — check first).
```powershell
$gi = "C:\Users\heol\Documents\Pogrammering\Projects\im-skills\.gitignore"
Get-Content $gi | Select-String "node_modules"
# If no match, append:
# Add-Content -Path $gi -Value "`nim-first-draft/node_modules/"
```

- [ ] **Step 6: Commit (DO NOT bundle the WIP)**
```powershell
Push-Location "C:\Users\heol\Documents\Pogrammering\Projects\im-skills"
git add im-first-draft .gitignore
git status --short  # confirm only im-first-draft files + .gitignore are staged; the existing WIP must still show as " M ..." unstaged
git commit -m "chore(im-first-draft): import skill into versioned repo"
Pop-Location
```

---

## Task 2 — Fix `im-first-draft` so the slide-sorter renders as a styled grid

**Root causes (confirmed via diagnostic agents):**
- `assets/sorter.css` and `assets/sorter.js` do not exist; the generator silently injects empty strings (`generate-firstdraft.mjs:65–66` via `readIfExists` returning `''` on ENOENT). Result: empty `<style>` and `<script>` tags → flat unstyled list, no interactivity.
- `scripts/story-parser.mjs:27` — `current.layoutHint = hint[1].trim()` keeps surrounding backticks from markdown convention (story file writes `` `photo-left-content:letter` ``). Trailing backtick leaks into layout badge.
- `scripts/catalog.mjs:33` — when normalising a hint with a variant (`name:variant`), only the head is sanitized; `variantSuffix` keeps the trailing backtick. Compounds the first bug.

**Files:**
- Create: `im-first-draft/assets/sorter.css`
- Create: `im-first-draft/assets/sorter.js`
- Modify: `im-first-draft/scripts/story-parser.mjs:27`
- Modify: `im-first-draft/scripts/catalog.mjs:33`

- [ ] **Step 1: Fix the backtick leak in the parser**
Edit `im-first-draft/scripts/story-parser.mjs`. Line 27 currently reads:
```js
current.layoutHint = hint[1].trim();
```
Change to:
```js
current.layoutHint = hint[1].trim().replace(/^`+|`+$/g, '').trim();
```

- [ ] **Step 2: Fix the variant-suffix sanitization in the catalog**
Edit `im-first-draft/scripts/catalog.mjs`. Around line 33, replace the variantSuffix line so it strips any non-alphanumeric/dash characters before re-attaching:
Old (the line that builds `variantSuffix` from `raw.slice(colonIdx+1)`):
```js
const variantSuffix = colonIdx > 0 ? ':' + raw.slice(colonIdx + 1) : '';
```
New:
```js
const variantSuffix = colonIdx > 0
  ? ':' + raw.slice(colonIdx + 1).toLowerCase().replace(/[^a-z0-9-]/g, '')
  : '';
```
(If the existing line spans multiple statements, adapt to preserve behaviour but ensure the suffix is sanitized.)

- [ ] **Step 3: Write `im-first-draft/assets/sorter.css`**

```css
/* im-first-draft slide-sorter styles
   Renders the firstdraft HTML produced by generate-firstdraft.mjs as a dark
   header bar + responsive card grid + modal for layout swap. */
:root {
  --ifd-bg: #F2F2F1;
  --ifd-surface: #FFFFFF;
  --ifd-ink: #1F1F23;
  --ifd-ash: #30373B;
  --ifd-grey: #A8A5A1;
  --ifd-accent: #67817F;
  --ifd-accent-soft: #E1E6E5;
  --ifd-cream: #F8F5E7;
  --ifd-font-body: Arial, Helvetica, sans-serif;
  --ifd-font-display: 'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif;
}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: var(--ifd-bg); color: var(--ifd-ink); font-family: var(--ifd-font-body); }
body { min-height: 100vh; padding-bottom: 64px; }

.ifd-header {
  position: sticky; top: 0; z-index: 10;
  display: flex; align-items: center; justify-content: space-between;
  background: var(--ifd-ash); color: #fff;
  padding: 14px 28px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.18);
}
.ifd-header-title { font-family: var(--ifd-font-display); font-size: 18px; letter-spacing: 0.01em; }
.ifd-header-meta { display: flex; align-items: center; gap: 18px; font-size: 13px; color: rgba(255,255,255,0.78); }
.ifd-copy-changes-btn {
  background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.35);
  padding: 6px 14px; border-radius: 999px; cursor: pointer;
  font-family: var(--ifd-font-body); font-size: 13px; font-weight: 700;
  display: inline-flex; align-items: center; gap: 8px;
}
.ifd-copy-changes-btn:hover { border-color: var(--ifd-accent); background: rgba(103,129,127,0.16); }
.ifd-changes-count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 22px; height: 22px; padding: 0 7px; border-radius: 999px;
  background: var(--ifd-accent); color: #fff; font-size: 12px; font-weight: 700;
}
.ifd-copy-changes-btn[data-zero="true"] .ifd-changes-count { background: rgba(255,255,255,0.18); color: rgba(255,255,255,0.65); }

.ifd-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 22px;
  padding: 28px;
}

.ifd-slide-card {
  background: var(--ifd-surface);
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 6px;
  padding: 14px 14px 0;
  display: flex; flex-direction: column;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease;
}
.ifd-slide-card:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(0,0,0,0.08); border-color: var(--ifd-accent-soft); }
.ifd-slide-card.is-picked { border-color: var(--ifd-accent); box-shadow: 0 0 0 2px var(--ifd-accent); }

.ifd-slide-meta {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--ifd-grey); margin-bottom: 8px;
}
.ifd-slide-num { font-weight: 700; color: var(--ifd-ink); }
.ifd-picked-marker { color: var(--ifd-accent); font-weight: 700; letter-spacing: 0; text-transform: none; }
.ifd-slide-layout-badge {
  background: var(--ifd-cream);
  color: var(--ifd-ash);
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-family: ui-monospace, 'Consolas', monospace;
  letter-spacing: 0;
  text-transform: none;
}
.ifd-slide-title {
  font-size: 14px; line-height: 1.35; font-weight: 600;
  color: var(--ifd-ink);
  margin-bottom: 10px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  min-height: 2.7em;
}

.ifd-thumb-wrap {
  margin: 0 -14px;
  border-top: 1px solid rgba(0,0,0,0.04);
  background: var(--ifd-bg);
  padding: 10px;
}
.ifd-thumb {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 3px;
  overflow: hidden;
  box-shadow: 0 1px 0 rgba(0,0,0,0.05);
}

/* Modal */
.ifd-modal {
  position: fixed; inset: 0;
  background: rgba(31,31,35,0.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 50; padding: 24px;
}
.ifd-modal[hidden] { display: none !important; }
.ifd-modal-content {
  background: #fff; width: min(960px, 100%); max-height: 88vh; overflow: auto;
  border-radius: 8px; padding: 26px 28px 22px; position: relative;
}
.ifd-modal-close {
  position: absolute; top: 14px; right: 14px;
  background: transparent; border: none;
  width: 32px; height: 32px; font-size: 22px; line-height: 1;
  color: var(--ifd-grey); cursor: pointer;
}
.ifd-modal-close:hover { color: var(--ifd-ink); }
.ifd-modal-header { display: flex; flex-direction: column; gap: 4px; margin-bottom: 18px; padding-right: 32px; }
.ifd-modal-header-eyebrow { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ifd-grey); }
.ifd-modal-header-title { font-family: var(--ifd-font-display); font-size: 22px; color: var(--ifd-ink); }
.ifd-modal-candidates {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}
.ifd-candidate {
  border: 1px solid rgba(0,0,0,0.08); border-radius: 5px;
  padding: 10px; background: #fff; cursor: pointer;
  display: flex; flex-direction: column; gap: 8px;
  transition: border-color 0.12s ease, transform 0.12s ease;
}
.ifd-candidate:hover { border-color: var(--ifd-accent); transform: translateY(-1px); }
.ifd-candidate.is-current { border-color: var(--ifd-ink); }
.ifd-candidate.is-current .ifd-candidate-name::after { content: ' (current)'; color: var(--ifd-grey); font-weight: 400; }
.ifd-candidate-thumb { width: 100%; aspect-ratio: 16 / 9; overflow: hidden; border-radius: 3px; }
.ifd-candidate-name { font-size: 12px; font-family: ui-monospace, 'Consolas', monospace; color: var(--ifd-ash); }

.ifd-modal-actions { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.06); }
.ifd-suggest-more {
  background: transparent; color: var(--ifd-ash);
  border: 1px solid var(--ifd-grey); padding: 8px 16px; border-radius: 999px;
  font-family: var(--ifd-font-body); font-weight: 700; font-size: 13px; cursor: pointer;
}
.ifd-suggest-more:hover { border-color: var(--ifd-ink); color: var(--ifd-ink); }

/* Toast */
.ifd-toast {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  background: var(--ifd-ash); color: #fff;
  padding: 10px 18px; border-radius: 999px;
  font-size: 13px; box-shadow: 0 6px 24px rgba(0,0,0,0.25);
  z-index: 60;
}
.ifd-toast[hidden] { display: none !important; }
```

- [ ] **Step 4: Write `im-first-draft/assets/sorter.js`**

```js
/* im-first-draft sorter interactions
   Reads embedded state JSON, opens a modal of layout alternatives on card
   click, lets the user pick, tracks change count, ships a "Copy changes"
   JSON payload, supports a "Suggest more" sendPrompt fallback, and saves
   user_pick back into the in-DOM state so apply-firstdraft.mjs can read it
   after Ctrl+S. */
(function () {
  const stateEl = document.getElementById('im-first-draft-state');
  const thumbsEl = document.getElementById('im-first-draft-thumbnails');
  if (!stateEl) return;
  let state;
  try { state = JSON.parse(stateEl.textContent); } catch { return; }
  const thumbs = thumbsEl ? JSON.parse(thumbsEl.textContent || '{}') : {};

  const modal = document.getElementById('ifd-modal');
  const modalCandidates = document.getElementById('ifd-modal-candidates');
  const modalTitle = document.getElementById('ifd-modal-title');
  const modalEyebrow = document.getElementById('ifd-modal-eyebrow');
  const modalClose = document.getElementById('ifd-modal-close');
  const suggestBtn = document.getElementById('ifd-suggest-more');
  const copyBtn = document.getElementById('ifd-copy-changes-btn');
  const countEl = document.getElementById('ifd-changes-count');
  const toast = document.getElementById('ifd-toast');

  let activeSlideIdx = null;

  function persist() {
    stateEl.textContent = JSON.stringify(state, null, 2);
  }
  function pickCount() {
    return state.slides.filter(s => s.user_pick && s.user_pick !== s.current_layout).length;
  }
  function refreshCount() {
    const n = pickCount();
    if (countEl) countEl.textContent = String(n);
    if (copyBtn) copyBtn.dataset.zero = n === 0 ? 'true' : 'false';
  }
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg; toast.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => { toast.hidden = true; }, 2200);
  }

  function openModal(slideIdx) {
    const slide = state.slides.find(s => s.index === slideIdx);
    if (!slide || !modal) return;
    activeSlideIdx = slideIdx;
    modalEyebrow.textContent = `Slide ${String(slide.index).padStart(2, '0')} — pick a layout`;
    modalTitle.textContent = slide.title;
    modalCandidates.innerHTML = '';
    for (const layout of slide.candidates) {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'ifd-candidate' + (layout === slide.current_layout ? ' is-current' : '');
      tile.dataset.layout = layout;
      const thumb = thumbs[layout] || '<div style="background:#eee;width:100%;height:100%;"></div>';
      tile.innerHTML = `<div class="ifd-candidate-thumb">${thumb}</div><div class="ifd-candidate-name">${layout}</div>`;
      tile.addEventListener('click', () => pickLayout(slideIdx, layout));
      modalCandidates.appendChild(tile);
    }
    modal.hidden = false;
  }
  function closeModal() { if (modal) modal.hidden = true; activeSlideIdx = null; }

  function pickLayout(slideIdx, layout) {
    const slide = state.slides.find(s => s.index === slideIdx);
    if (!slide) return;
    if (layout === slide.current_layout) {
      delete slide.user_pick;
    } else {
      slide.user_pick = layout;
    }
    const card = document.querySelector(`.ifd-slide-card[data-slide="${slideIdx}"]`);
    if (card) {
      const effective = slide.user_pick || slide.current_layout;
      card.dataset.layout = effective;
      const badge = card.querySelector('.ifd-slide-layout-badge');
      if (badge) badge.textContent = effective;
      const thumbWrap = card.querySelector('.ifd-thumb-wrap');
      if (thumbWrap && thumbs[effective]) thumbWrap.innerHTML = thumbs[effective];
      const meta = card.querySelector('.ifd-slide-meta');
      let marker = card.querySelector('.ifd-picked-marker');
      if (slide.user_pick) {
        card.classList.add('is-picked');
        if (!marker && meta) {
          marker = document.createElement('span');
          marker.className = 'ifd-picked-marker';
          marker.textContent = '• picked';
          meta.insertBefore(marker, meta.children[1] || null);
        }
      } else {
        card.classList.remove('is-picked');
        if (marker) marker.remove();
      }
    }
    persist();
    refreshCount();
    closeModal();
  }

  function copyChanges() {
    const payload = {
      story_file: state.story_file,
      picks: state.slides
        .filter(s => s.user_pick && s.user_pick !== s.current_layout)
        .map(s => ({ index: s.index, layout: s.user_pick }))
    };
    const text = JSON.stringify(payload, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => showToast(payload.picks.length ? `Copied ${payload.picks.length} change(s)` : 'No changes to copy'),
        () => showToast('Clipboard blocked — see DevTools')
      );
    } else {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); showToast('Copied'); } catch { showToast('Copy failed'); }
      document.body.removeChild(ta);
    }
  }

  function suggestMore() {
    if (activeSlideIdx == null) return;
    const slide = state.slides.find(s => s.index === activeSlideIdx);
    if (!slide) return;
    if (typeof window.sendPrompt === 'function') {
      window.sendPrompt(`Propose 2–3 alternative IM_ deck layouts for slide ${slide.index} "${slide.title}" — current layout is ${slide.current_layout}. Briefly justify each.`);
    } else {
      showToast('sendPrompt unavailable — ask Claude directly');
    }
  }

  // Wire up
  document.querySelectorAll('.ifd-slide-card').forEach(card => {
    card.addEventListener('click', e => {
      // Ignore clicks that originate inside the modal that bubble up
      if (e.target.closest('.ifd-modal')) return;
      const idx = Number(card.dataset.slide);
      if (!Number.isFinite(idx)) return;
      openModal(idx);
    });
  });
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (suggestBtn) suggestBtn.addEventListener('click', suggestMore);
  if (copyBtn) copyBtn.addEventListener('click', copyChanges);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal && !modal.hidden) closeModal();
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      // Let the browser save the page — state was already persisted to DOM on every pick
      showToast('Tip: state is already in the DOM; Ctrl+S saves the whole file');
    }
  });
  refreshCount();
  // Mark current picks visually on load
  state.slides.forEach(s => {
    if (s.user_pick && s.user_pick !== s.current_layout) {
      const card = document.querySelector(`.ifd-slide-card[data-slide="${s.index}"]`);
      if (card) {
        card.classList.add('is-picked');
        const badge = card.querySelector('.ifd-slide-layout-badge');
        if (badge) badge.textContent = s.user_pick;
      }
    }
  });
})();
```

- [ ] **Step 5: Confirm the generator emits the IDs that sorter.js expects**

Read `im-first-draft/scripts/generate-firstdraft.mjs`. The script must emit:
- `<script id="im-first-draft-state" type="application/json">…</script>` containing `state`
- `<script id="im-first-draft-thumbnails" type="application/json">…</script>` containing a `{layout: thumbnailHtml}` map
- `<div class="ifd-modal" id="ifd-modal" hidden>` with children `#ifd-modal-eyebrow`, `#ifd-modal-title`, `#ifd-modal-candidates`, `#ifd-modal-close`, `#ifd-suggest-more`
- `<div class="ifd-toast" id="ifd-toast" hidden>`

If any of these are missing, edit `generate-firstdraft.mjs` to add them. Use the existing card-emission code as a model for the JSON state script; build the thumbnails map by iterating over the catalog and calling `renderThumbnail(layout)` for each.

The fragment to append immediately before `</body>`:
```html
<div class="ifd-modal" id="ifd-modal" hidden>
  <div class="ifd-modal-content">
    <button class="ifd-modal-close" id="ifd-modal-close" aria-label="Close">×</button>
    <div class="ifd-modal-header">
      <span class="ifd-modal-header-eyebrow" id="ifd-modal-eyebrow"></span>
      <span class="ifd-modal-header-title" id="ifd-modal-title"></span>
    </div>
    <div class="ifd-modal-candidates" id="ifd-modal-candidates"></div>
    <div class="ifd-modal-actions">
      <button type="button" class="ifd-suggest-more" id="ifd-suggest-more">Suggest something else</button>
    </div>
  </div>
</div>
<script id="im-first-draft-state" type="application/json">${JSON.stringify(state, null, 2)}</script>
<script id="im-first-draft-thumbnails" type="application/json">${JSON.stringify(thumbnailMap)}</script>
<script>${js}</script>
```

If `thumbnailMap` isn't built yet, build it from the catalog:
```js
const thumbnailMap = {};
for (const entry of catalog) {
  thumbnailMap[entry.layout] = await renderThumbnail(entry.layout);
}
```

- [ ] **Step 6: Regenerate the user's firstdraft to verify**
```powershell
node "C:\Users\heol\.claude\skills\im-first-draft\scripts\generate-firstdraft.mjs" "C:\Users\heol\Documents\Pogrammering\Projects\IM workshop\aker-bp-decarbonization-proposal-story.md"
Select-String -Path "C:\Users\heol\Documents\Pogrammering\Projects\IM workshop\aker-bp-decarbonization-proposal-firstdraft.html" -Pattern '<style>[^<]+\.ifd-grid' -Quiet
# Expected: True
Select-String -Path "C:\Users\heol\Documents\Pogrammering\Projects\IM workshop\aker-bp-decarbonization-proposal-firstdraft.html" -Pattern 'photo-left-content:letter`' -Quiet
# Expected: False (backtick must be gone)
```

- [ ] **Step 7: Commit Task 2**
```powershell
Push-Location "C:\Users\heol\Documents\Pogrammering\Projects\im-skills"
git add im-first-draft/assets/sorter.css im-first-draft/assets/sorter.js im-first-draft/scripts/story-parser.mjs im-first-draft/scripts/catalog.mjs im-first-draft/scripts/generate-firstdraft.mjs
git commit -m "fix(im-first-draft): ship sorter css/js + strip backticks from layout hints"
Pop-Location
```

---

## Task 3 — Harden `im-deck` so this class of defect cannot ship again

**Root causes (confirmed):**
- `.action-title` has no max-line clamp; titles >120 chars push content out of slide (`im-styles.css` ~line 119–130).
- Variant hide rules (`.photo-left-content { display: none }` ~line 1532, `.segment-divider { display: none }` ~line 1443, `.slide-purpose { display: none }` ~line 1215) lack `!important` while their `.active` counterparts use `!important`. Asymmetric specificity causes leaks during nav.
- `SKILL.md` quality checklist doesn't cap action-title length, doesn't constrain card counts, doesn't enforce UTF-8, doesn't require verbatim chrome script.
- Layout 16 (`team-and-investment`) notes don't warn that >3 columns will overflow the 720px slide.

**Files (all already modified by user's WIP — append carefully):**
- Modify: `im-deck/references/im-styles.css` (action-title block; variant hide rules)
- Modify: `im-deck/references/layout-snippets.md` (Layout 16 notes; deck-chrome callout)
- Modify: `im-deck/SKILL.md` (quality checklist)

- [ ] **Step 1: Add the action-title clamp**
In `im-deck/references/im-styles.css`, find the `.action-title { … }` block (search for `.action-title {`). Append these declarations inside the existing block:
```css
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-height: calc(1.26em * 3);
```
Do not change other lines in the block.

- [ ] **Step 2: Add a universal hide-safety net**
In the same file, find the rule `.slide.active { display: flex; … }` (search `.slide.active {`). Immediately after that rule, add:
```css
.slide:not(.active) { display: none !important; }
```
This is the safety net that makes the asymmetric `!important` irrelevant.

- [ ] **Step 3: Add an overflow guard on team-grid-wrap**
Find `.team-grid-wrap {` and append `overflow: hidden;` inside the block. This makes overflow visible-but-clipped rather than invisible-but-bleeding.

- [ ] **Step 4: Update Layout 16 notes in layout-snippets.md**
In `im-deck/references/layout-snippets.md`, find `## Layout 16 — Team and investment`. Find the Notes paragraph at the end of that section. After the existing note about overriding to `1fr 1fr`, append:
```
**Overflow rule:** Never use more than 3 team columns. For 4–6 people, use the default 3-column grid in two rows. For >6 people, split into Core team + SMEs subsections (the snippet shows the pattern). Overriding to 4 columns will overflow the 720px slide height because each team card has a fixed photo aspect-ratio plus three text lines.
```

- [ ] **Step 5: Strengthen the deck-chrome instruction**
In the same file, find the heading `## Deck chrome (include in every generated deck)`. Immediately under the heading add a bold callout:
```
**Copy this block byte-for-byte before `</body>`.** Do not rename ids, do not paraphrase the script, do not drop the trailing `updateScale()` retries. The deck cannot function without this exact chrome.
```

- [ ] **Step 6: Expand SKILL.md quality checklist**
In `im-deck/SKILL.md`, find the `## Quality checks before saving` heading. Replace the existing checklist items with the existing items plus these additions (preserve any existing items the user's WIP has added):
```
- [ ] Every action title is ≤120 characters (≈3 lines at 24pt). If longer, restructure as `<strong>Section label</strong> | short declarative clause`.
- [ ] No layout exceeds its safe card count: `.team-grid` ≤ 6 cards in 3 columns (2 rows); `.assets-grid` ≤ 4 cards; `.qs-initiative-card` ≤ 4.
- [ ] Exactly one slide has the `active` class (`grep -c 'class="[^"]*\bactive\b' deck.html` must return 1).
- [ ] The deck-chrome block from `references/layout-snippets.md` is pasted verbatim immediately before `</body>`. Verify the `<script>` substring `updateScale()` appears at least three times.
- [ ] File is saved as UTF-8 without BOM. First three bytes must NOT be `EF BB BF` and the file must NOT contain mojibake sequences like `â€"`, `â€“`, `â€œ`, `â€š`.
- [ ] Open the deck in Chrome/Edge: slide 1 visible; arrow keys advance; no console errors; navigating through every slide shows distinct content.
```

- [ ] **Step 7: Add explicit UTF-8 guidance to SKILL.md Step 6**
In `## Step 6 — Deliver`, find the line `Save the file as `[topic-slug]-deck.html` in the current working directory.` and append:
```
Write the file as UTF-8 without BOM. Use the Write tool (default is correct). If scripting via PowerShell, use `[IO.File]::WriteAllText($path, $html, [Text.UTF8Encoding]::new($false))` — PowerShell 5.1's `Out-File`/`Set-Content` default to UTF-16 LE and will produce mojibake when the browser interprets the file as UTF-8.
```

- [ ] **Step 8: Verify the user's WIP still applies cleanly**
```powershell
Push-Location "C:\Users\heol\Documents\Pogrammering\Projects\im-skills"
git diff --stat im-deck im-edit im-story
# Confirm the line counts are: WIP totals + the small additions from this task.
# The user's WIP from earlier (deck-types.md, im-styles.css ~1467 lines, layout-snippets.md ~1144 lines, im-edit/chrome.js, im-story changes) must all still be present.
Pop-Location
```

- [ ] **Step 9: Commit Task 3**
```powershell
Push-Location "C:\Users\heol\Documents\Pogrammering\Projects\im-skills"
git add im-deck/references/im-styles.css im-deck/references/layout-snippets.md im-deck/SKILL.md
# CRITICAL: do NOT `git add .` — that would bundle the user's other WIP (deck-types.md, im-edit/chrome.js, im-story/*) into this commit. Stage explicitly.
git status --short
git commit -m "fix(im-deck): clamp action titles, hide-rule safety net, checklist guardrails"
Pop-Location
```

---

## Task 4 — Regenerate the Aker BP deck cleanly

**Goal:** Re-emit the Aker BP HTML deck so the user can immediately see the fixes. Specifically: shorten the 7 over-long action titles in the story; fix team slide to 3-card layout; ensure UTF-8 without mojibake; verify navigation works.

**Files:**
- Modify: `C:\Users\heol\Documents\Pogrammering\Projects\IM workshop\aker-bp-decarbonization-proposal-story.md`
- Rewrite: `C:\Users\heol\Documents\Pogrammering\Projects\IM workshop\aker-bp-decarbonization-proposal-deck.html`

- [ ] **Step 1: Shorten action titles in the story**

Read `aker-bp-decarbonization-proposal-story.md`. For each of these slides, replace the action title with the shorter version. Keep the `**Label**` prefix; the clause after the pipe must fit ≤120 chars total.

- Slide 5: `**Context** | EU policy, capital cost, and stakeholder scrutiny are turning 2030 decarbonization into a near-term commercial issue`
- Slide 7: `**Success criteria** | Five conditions decide whether decarbonization is embedded in operations — not bolted on as a programme`
- Slide 8: `**Credentials** | We bring deep experience in the three areas that matter most: low-carbon operating models, capital discipline, NCS`
- Slide 9: `**Framework** | Our IMPACT approach links emissions targets to operating decisions through four connected layers`
- Slide 11: `**Modules** | Four modules: baseline, target operating model, capability build, and governance & incentives`
- Slide 12: `**Plan** | A validated operating model in week 10 and an implementation roadmap signed by the EVP team in week 16`
- Slide 14: `**Team & investment** | The core team brings 60+ years of relevant experience across NCS operators and low-carbon transformations`

- [ ] **Step 2: Reduce slide 14 team to 3 core + 2 SMEs**

In the slide 14 content brief, change the core team from 4 people to 3: drop "Consultant — data & analytics" and keep [Partner], [Project manager], [Senior consultant — operating model]. The 3-column default grid then has no overflow risk.

- [ ] **Step 3: Rebuild the deck (delegate to a subagent — the full HTML is ~3000 lines)**

Dispatch a subagent with:
- The updated story file path
- The fix instructions for the team slide (3 core + 2 SMEs, both grids in 3-col defaults)
- An explicit "UTF-8 only — use the Write tool" instruction
- The "deck-chrome block must be copied verbatim from layout-snippets.md and appear before `</body>`" instruction
- A post-build verification: open the file via PowerShell, check first 3 bytes are NOT `EF BB BF`, grep for mojibake sequences (`â€"`, `â€“`), count slides (must be 15), count active classes (must be 1), confirm `updateScale()` appears ≥3 times.

- [ ] **Step 4: Spot-check the file**
```powershell
$f = "C:\Users\heol\Documents\Pogrammering\Projects\IM workshop\aker-bp-decarbonization-proposal-deck.html"
[byte[]]$head = Get-Content -Path $f -Encoding Byte -TotalCount 3
"{0:X2} {1:X2} {2:X2}" -f $head[0], $head[1], $head[2]   # must NOT be "EF BB BF"
(Select-String -Path $f -Pattern 'â€' -AllMatches).Matches.Count  # must be 0
(Select-String -Path $f -Pattern '<section class="slide').Matches.Count  # must be 15
(Select-String -Path $f -Pattern 'class="[^"]*\bactive\b').Matches.Count  # must be 1
(Select-String -Path $f -Pattern 'updateScale\(\)').Matches.Count  # must be >= 3
```

- [ ] **Step 5: NO COMMIT for Task 4** — the deck file lives outside the skills repo. Just confirm it works locally. The user opens it in a browser to verify.

---

## Task 5 — Push to GitHub

- [ ] **Step 1: Confirm branch and what's about to push**
```powershell
Push-Location "C:\Users\heol\Documents\Pogrammering\Projects\im-skills"
git log --oneline origin/main..HEAD
# Should list 3 new commits from Tasks 1–3, plus the docs/plans/ file if committed.
git status --short
# The user's WIP MUST still show as unstaged " M ..." entries — never push their WIP.
Pop-Location
```

- [ ] **Step 2: Commit the plan document itself**
```powershell
Push-Location "C:\Users\heol\Documents\Pogrammering\Projects\im-skills"
git add docs/plans/2026-06-23-skill-fixes.md
git commit -m "docs(plans): skill-repair plan for 2026-06-23"
Pop-Location
```

- [ ] **Step 3: Push**
```powershell
Push-Location "C:\Users\heol\Documents\Pogrammering\Projects\im-skills"
git push origin main
Pop-Location
```

---

## Self-review (run before executing)

- **Spec coverage:** All 6 reported symptoms → mapped to a task. Issue 1 (firstdraft flat) → Task 2 Steps 3–4. Issue 2 (title overflow) → Task 3 Step 1 + Task 4 Step 1. Issue 3 (overlay) → Task 3 Step 2. Issue 4 (bleed) → Task 3 Step 3 + Task 4 Step 2. Issue 5 (UTF-8) → Task 3 Steps 6–7 + Task 4 Step 4. Issue 6 (identical slides) → Task 3 Step 2 (hide-rule safety net) + Task 4 Step 4 (open in browser).
- **Placeholders:** None — every step has the exact code or command.
- **Type consistency:** state JSON shape consistent across generate/sorter/apply (validated against existing apply-firstdraft.mjs:51–53).
- **WIP safety:** explicit "stage explicitly, never `git add .`" guidance at every commit. WIP files (`im-edit/chrome.js`, `im-story/*`, `im-deck/references/deck-types.md`) untouched.
