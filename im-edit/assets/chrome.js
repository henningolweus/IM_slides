// =========================================================
// im-edit chrome — in-browser editor for IM_ HTML decks
// Vanilla JS, no dependencies. Loaded inline via inject-chrome.mjs.
// =========================================================

(function() {
  'use strict';

  // ---------- Global state ----------
  const IME = window.__IME = {
    state: null,
    catalogue: null,
    selectedElement: null,     // primary (most-recently-clicked)
    selectedElements: [],      // all selected (for multi-select)
    selectedHalo: null,        // primary halo
    selectedHalos: [],         // all halos
    fileHandle: null,
    saveTimer: null,
    unsaved: false,
    isReadOnly: false,
  };

  // ---------- Bootstrap ----------
  function bootstrap() {
    // Idempotency: a saved deck may already contain rendered chrome DOM
    // (toolbar, panels, pins, halos) from a previous edit session — captured
    // when the file was saved via download. On re-open, those stale elements
    // collide with the fresh ones we're about to create (duplicate IDs,
    // duplicate event listeners, broken buttons). Sweep them away first.
    document.querySelectorAll(
      '.ime-toolbar, .ime-comments-panel, .ime-comment-pin, ' +
      '.ime-selection-halo, .ime-comment-popover, .ime-globals-panel, ' +
      '[id^="ime-style-css-"]'
    ).forEach(el => el.remove());
    document.body.classList.remove('ime-active', 'ime-panel-open');

    const stateEl = document.getElementById('im-edit-state');
    if (!stateEl) {
      console.error('[im-edit] No #im-edit-state script tag found.');
      return;
    }
    try {
      IME.state = JSON.parse(stateEl.textContent || '{}');
    } catch (e) {
      console.error('[im-edit] Invalid state JSON:', e.message);
      IME.state = { version: 1, styles: {}, comments: [], edits: [] };
    }
    IME.state.global_overrides = IME.state.global_overrides || {};

    // Auto-assign data-imedit-id to shape containers (boxes, cards, circles, panels)
    // that don't have one. Lets reviewers select shapes for commenting, not just text.
    // IDs are deterministic: s<NN>-<class>-<N> based on slide index + class + occurrence.
    autoAssignShapeIds();

    const catEl = document.getElementById('im-edit-catalogue');
    if (!catEl) {
      console.error('[im-edit] No #im-edit-catalogue script tag found.');
      return;
    }
    try {
      IME.catalogue = JSON.parse(catEl.textContent || '{}');
    } catch (e) {
      console.error('[im-edit] Invalid catalogue JSON:', e.message);
      return;
    }

    if (window.location.search.includes('view=1')) {
      IME.isReadOnly = true;
      applyAllEdits();
      applyAllOverrides();
      applyGlobalOverrides();
      return;
    }

    document.body.classList.add('ime-active');
    applyAllEdits();
    applyAllOverrides();
    applyGlobalOverrides();
    renderToolbar();
    renderCommentsPanel();
    renderCommentPins();

    // Re-render pins when the active slide changes
    const slideObserver = new MutationObserver(muts => {
      for (const m of muts) {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          renderCommentPins();
          break;
        }
      }
    });
    document.querySelectorAll('section.slide').forEach(s => {
      slideObserver.observe(s, { attributes: true, attributeFilter: ['class'] });
    });

    document.addEventListener('click', onDocumentClick, true);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('beforeunload', onBeforeUnload);
  }

  // ---------- Auto-assign shape IDs ----------
  // Shape containers (cards, panels, circles) often lack a `data-imedit-id` because
  // they were declared in the deck as pure visual scaffolding. Without an id, they
  // can't be selected/commented. This walks the DOM and assigns deterministic IDs.
  function autoAssignShapeIds() {
    const SHAPE_CLASSES = [
      's2-right', 's2-left', 's2-layout',
      'iconic-card', 'iconic-circle', 'iconic-bullets', 'iconic-three-col',
      'asset-card', 'keyinfo-row', 'assets-grid',
      'kpi-card', 'kpi-detail-item', 'kpi-grid',
      'move-card', 'moves-grid', 'moves-label',
      'st-content', 'st-axis', 'timeline-wrap',
      'gov-side', 'gov-panel', 'gov-layout', 'own-layer', 'ownership-stack',
      'cover-left', 'cover-right',
      'divider-left', 'divider-right',
      'purpose-left', 'purpose-right', 'purpose-box',
      'pull-quote-slide',
      'im-table-wrap', 'full-body-content',
      'content-wrap'
    ];
    const slides = document.querySelectorAll('section.slide');
    slides.forEach((slide, slideIdx) => {
      const slideNum = String(slideIdx + 1).padStart(2, '0');
      for (const cls of SHAPE_CLASSES) {
        const els = slide.querySelectorAll('.' + cls);
        els.forEach((el, i) => {
          if (el.hasAttribute('data-imedit-id')) return;
          el.setAttribute('data-imedit-id', `s${slideNum}-${cls}-${i}`);
        });
      }
    });
  }

  // ---------- Text-edit application ----------
  // Some layouts (e.g. purpose-box-title/body in Layout 8) wrap their text in
  // <div data-imedit-id><p>text</p></div>. Setting textContent on the parent
  // div would replace the inner <p> with a bare text node and break structure
  // on reload. Resolve to the inner text leaf in that case.
  const TEXT_LEAF_TAGS = new Set(['P','H1','H2','H3','H4','H5','H6']);
  const TEXT_TAGS_FOR_EDIT = new Set(['P','H1','H2','H3','H4','H5','H6','LI','SPAN','TH','TD']);
  const BLOCK_CHILD_SELECTOR = 'p, div, h1, h2, h3, h4, h5, h6, ul, ol, table, section, article, header, footer, nav, aside, main, figure, blockquote';

  function getTextEditTarget(el) {
    if (!el || el.tagName !== 'DIV') return el;
    // A div whose only block-level child is a single text leaf (P or H1-6) that
    // itself contains only inline content — treat the inner leaf as the edit target.
    const blockKids = Array.from(el.children).filter(c =>
      ['P','H1','H2','H3','H4','H5','H6','UL','OL','DIV','TABLE','SECTION','ARTICLE','HEADER','FOOTER','NAV','ASIDE','MAIN','FIGURE','BLOCKQUOTE'].includes(c.tagName)
    );
    if (blockKids.length !== 1) return el;
    const inner = blockKids[0];
    if (!TEXT_LEAF_TAGS.has(inner.tagName)) return el;
    if (inner.querySelector(BLOCK_CHILD_SELECTOR)) return el;
    return inner;
  }

  function applyAllEdits() {
    if (!IME.state.edits) return;
    for (const edit of IME.state.edits) {
      const el = document.querySelector(`[data-imedit-id="${edit.imedit_id}"]`);
      if (!el) continue;
      const target = getTextEditTarget(el);
      if (target.textContent !== edit.new_text) {
        target.textContent = edit.new_text;
      }
    }
  }

  // ---------- Style override application ----------
  function applyAllOverrides() {
    if (!IME.state.styles) return;
    for (const [imeditId, override] of Object.entries(IME.state.styles)) {
      const el = document.querySelector(`[data-imedit-id="${imeditId}"]`);
      if (!el) continue;
      applyOverrideToElement(el, override);
    }
  }

  function applyOverrideToElement(el, override) {
    if (typeof override === 'string') {
      setNamedStyle(el, override);
    } else if (typeof override === 'object') {
      if (override.style) setNamedStyle(el, override.style);
      const props = ['font-family', 'font-size', 'color', 'font-weight', 'letter-spacing', 'text-transform', 'font-style'];
      for (const p of props) {
        if (override[p]) el.style.setProperty(p, override[p]);
      }
    }
  }

  function setNamedStyle(el, styleName) {
    el.className = el.className.split(/\s+/).filter(c => !c.startsWith('ime-style-')).join(' ');
    el.classList.add(`ime-style-${styleName}`);
    el.setAttribute('data-imedit-style', styleName);
    ensureStyleCSS(styleName);
  }

  function ensureStyleCSS(styleName) {
    if (document.getElementById(`ime-style-css-${styleName}`)) return;
    const recipe = IME.catalogue.styles && IME.catalogue.styles[styleName];
    if (!recipe) return;
    const css = `.ime-style-${styleName} { ` +
      Object.entries(recipe).map(([k, v]) => `${k}: ${v} !important;`).join(' ') +
      ` }`;
    const styleEl = document.createElement('style');
    styleEl.id = `ime-style-css-${styleName}`;
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
    // Keep globals CSS at the very end of <head> so it remains higher
    // in cascade order than any later-added per-element recipe styles.
    const globals = document.getElementById('ime-globals-css');
    if (globals) document.head.appendChild(globals);
  }

  // Extra deck-specific CSS class selectors a named-style global should ALSO target —
  // lifted to module scope so the globals panel can compute target counts per row.
  const NAMED_STYLE_EXTRA_SELECTORS = {
    'section-label': ['.section-label', '.table-label'],
    'kpi-kicker':    ['.kpi-kicker', '.mh-num', '.st-num', '.ml-kicker', '.ki-kicker'],
    'kpi-value':     ['.kpi-value'],
    'eyebrow':       ['.eyebrow', '.div-eyebrow', '.slide-eyebrow', '.photo-caption'],
    'caption':       ['.caption', '.asset-loc', '.asset-type'],
    'action-title':  ['.action-title', '.div-title', '.purpose-heading'],
    'quote':         ['.pull-quote-text'],
    'h1':            ['h1'],
  };

  function selectorsForNamedStyle(styleName) {
    const sels = [`.ime-style-${styleName}`, `.${styleName}`];
    for (const s of (NAMED_STYLE_EXTRA_SELECTORS[styleName] || [])) {
      if (!sels.includes(s)) sels.push(s);
    }
    return sels;
  }
  function targetCountForSelectors(selectors) {
    let n = 0;
    for (const sel of selectors) {
      try { n += document.querySelectorAll(sel).length; } catch {}
    }
    return n;
  }

  // ---------- Toolbar ----------
  function renderToolbar() {
    const bar = document.createElement('div');
    bar.className = 'ime-toolbar';
    bar.id = 'ime-toolbar';

    const styleGroup = mkGroup('Style');
    const styleSelect = document.createElement('select');
    styleSelect.id = 'ime-style-select';
    styleSelect.innerHTML = '<option value="">— inherit —</option>';
    for (const name of Object.keys(IME.catalogue.styles || {})) {
      const opt = document.createElement('option');
      opt.value = name; opt.textContent = humanize(name);
      styleSelect.appendChild(opt);
    }
    styleSelect.disabled = true;
    styleSelect.addEventListener('change', onStyleChange);
    styleGroup.appendChild(styleSelect);

    const fontGroup = mkGroup('Font');
    const fontSelect = document.createElement('select');
    fontSelect.id = 'ime-font-select';
    fontSelect.innerHTML = `
      <option value="">— style default —</option>
      <option value="var(--font-display)">Palatino (display)</option>
      <option value="var(--font-body)">Arial (body)</option>
    `;
    fontSelect.disabled = true;
    fontSelect.addEventListener('change', onFontChange);
    fontGroup.appendChild(fontSelect);

    const sizeGroup = mkGroup('Size');
    const sizeMinus = mkBtn('−', onSizeMinus, 'ime-size-minus');
    const sizeSelect = document.createElement('select');
    sizeSelect.id = 'ime-size-select';
    const sizePtSteps = [6.5, 8, 9, 10, 10.5, 11, 12, 13, 14, 16, 18, 20, 22, 24, 28, 32, 35, 38, 40, 44];
    sizeSelect.innerHTML = '<option value="">— style default —</option>' +
      sizePtSteps.map(p => `<option value="${p}">${p}</option>`).join('');
    sizeSelect.style.width = '76px'; sizeSelect.disabled = true;
    sizeSelect.addEventListener('change', onSizeChange);
    const sizePlus = mkBtn('+', onSizePlus, 'ime-size-plus');
    sizeGroup.append(sizeMinus, sizeSelect, sizePlus);

    const colourGroup = mkGroup('Colour');
    const colourSelect = document.createElement('select');
    colourSelect.id = 'ime-colour-select';
    colourSelect.innerHTML = '<option value="">— style default —</option>';
    for (const [name, value] of Object.entries(IME.catalogue.color_palette || {})) {
      const opt = document.createElement('option');
      opt.value = value; opt.textContent = humanize(name);
      colourSelect.appendChild(opt);
    }
    colourSelect.disabled = true;
    colourSelect.addEventListener('change', onColourChange);
    colourGroup.appendChild(colourSelect);

    const cmtGroup = mkGroup('Comment');
    const cmtBtn = mkBtn('Add comment', onAddCommentClick, 'ime-add-comment');
    cmtBtn.disabled = true;
    cmtGroup.appendChild(cmtBtn);

    const globalsGroup = mkGroup('Globals');
    const globalsBtn = mkBtn('⚙', onToggleGlobals, 'ime-globals-btn');
    globalsBtn.title = 'Open global type controls';
    globalsGroup.appendChild(globalsBtn);

    const targetGroup = document.createElement('div');
    targetGroup.style.cssText = 'flex:1; display:flex; align-items:center; gap:8px;';
    const targetLabel = document.createElement('div');
    targetLabel.className = 'ime-target-label';
    targetLabel.id = 'ime-target-label';
    targetLabel.textContent = 'Click an element to begin';
    const saveDot = document.createElement('div');
    saveDot.className = 'ime-save-indicator ime-saved';
    saveDot.id = 'ime-save-dot';
    saveDot.title = 'All changes saved';
    targetGroup.append(targetLabel, saveDot);

    const actionGroup = mkGroup('');
    const saveBtn = mkBtn('Save', onSaveClick, 'ime-save-btn');
    const panelBtn = mkBtn('☰', onTogglePanel, 'ime-panel-toggle');
    actionGroup.append(saveBtn, panelBtn);

    bar.append(styleGroup, fontGroup, sizeGroup, colourGroup, cmtGroup, globalsGroup, targetGroup, actionGroup);
    document.body.insertBefore(bar, document.body.firstChild);
  }

  function mkGroup(label) {
    const g = document.createElement('div');
    g.className = 'ime-group';
    if (label) {
      const l = document.createElement('span');
      l.className = 'ime-label';
      l.textContent = label;
      g.appendChild(l);
    }
    return g;
  }

  function mkBtn(text, handler, id) {
    const b = document.createElement('button');
    b.textContent = text;
    if (id) b.id = id;
    if (handler) b.addEventListener('click', handler);
    return b;
  }

  function humanize(str) {
    return str.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  function onTogglePanel() {
    document.body.classList.toggle('ime-panel-open');
    const panel = document.getElementById('ime-comments-panel');
    if (panel) panel.classList.toggle('ime-collapsed');
  }

  // ---------- Selection ----------
  function onDocumentClick(e) {
    if (e.target.closest('.ime-toolbar, .ime-comments-panel, .ime-comment-popover, .ime-comment-pin, .ime-globals-panel')) {
      return;
    }
    const el = e.target.closest('[data-imedit-id]');
    if (!el) {
      clearSelection();
      return;
    }
    if (e.shiftKey && IME.selectedElements.length > 0) {
      // Multi-select: add to or remove from selection
      if (IME.selectedElements.includes(el)) {
        removeFromSelection(el);
      } else {
        addToSelection(el);
      }
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (el === IME.selectedElement && el.getAttribute('contenteditable') === 'true') {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    selectElement(el);
  }

  function selectElement(el) {
    if (IME.selectedElement === el && IME.selectedElements.length === 1) return;
    // Disable contentEditable on the previous selection(s) — clean both the
    // wrapper and the inner leaf in the p-wrapper-div case.
    for (const prev of IME.selectedElements) {
      if (prev !== el) {
        const prevTarget = getTextEditTarget(prev);
        prev.removeAttribute('contenteditable');
        prev.removeEventListener('input', onElementInput);
        if (prevTarget !== prev) {
          prevTarget.removeAttribute('contenteditable');
          prevTarget.removeEventListener('input', onElementInput);
        }
      }
    }
    // Clear old halos
    for (const h of IME.selectedHalos) h.halo.remove();
    IME.selectedHalos = [];
    IME.selectedElements = [el];
    IME.selectedElement = el;
    drawHalo(el);
    IME.selectedHalos.push({ el, halo: IME.selectedHalo });
    updateToolbarForSelection(el);
    // A <div> with data-imedit-id that holds only inline content (text + span/strong/em/br/a/code)
    // is treated as a text leaf — gives custom layouts the same in-place edit affordance as <p>,
    // without breaking real containers (cards, panels) that wrap block-level children.
    const isTextLeafDiv = el.tagName === 'DIV' && !el.querySelector(BLOCK_CHILD_SELECTOR);
    // A <div data-imedit-id> wrapping a single <p>/<h1-6> (Layout 8 purpose-box,
    // and any future layout using the same pattern) — edit the inner leaf, but
    // route input events back to the parent via closest('[data-imedit-id]').
    const editTarget = getTextEditTarget(el);
    const isPWrapper = editTarget !== el;
    if (TEXT_TAGS_FOR_EDIT.has(el.tagName) || isTextLeafDiv || isPWrapper) {
      editTarget.setAttribute('contenteditable', 'true');
      editTarget.addEventListener('input', onElementInput);
      setTimeout(() => editTarget.focus(), 0);
    }
  }

  function onElementInput(e) {
    const el = e.target.closest('[data-imedit-id]');
    if (!el) return;
    const imeditId = el.getAttribute('data-imedit-id');
    const newText = el.textContent;
    IME.state.edits = IME.state.edits || [];
    const existing = IME.state.edits.findIndex(x => x.imedit_id === imeditId);
    const entry = { imedit_id: imeditId, new_text: newText, edited_at: new Date().toISOString() };
    if (existing >= 0) IME.state.edits[existing] = entry;
    else IME.state.edits.push(entry);
    markDirty();
    if (IME.selectedHalo) positionHalo(IME.selectedHalo, el);
  }

  function clearSelection() {
    for (const el of IME.selectedElements) {
      const target = getTextEditTarget(el);
      el.removeAttribute('contenteditable');
      el.removeEventListener('input', onElementInput);
      if (target !== el) {
        target.removeAttribute('contenteditable');
        target.removeEventListener('input', onElementInput);
      }
    }
    IME.selectedElements = [];
    IME.selectedElement = null;
    for (const h of IME.selectedHalos) h.halo.remove();
    IME.selectedHalos = [];
    if (IME.selectedHalo) {
      IME.selectedHalo.remove();
      IME.selectedHalo = null;
    }
    updateToolbarForSelection(null);
  }

  function addToSelection(el) {
    if (IME.selectedElements.includes(el)) return;
    IME.selectedElements.push(el);
    const halo = document.createElement('div');
    halo.className = 'ime-selection-halo';
    document.body.appendChild(halo);
    IME.selectedHalos.push({ el, halo });
    positionHalo(halo, el);
    // Update primary to most recent
    IME.selectedElement = el;
    updateToolbarForSelection(el);
  }

  function removeFromSelection(el) {
    const idx = IME.selectedElements.indexOf(el);
    if (idx < 0) return;
    IME.selectedElements.splice(idx, 1);
    const haloEntry = IME.selectedHalos.find(h => h.el === el);
    if (haloEntry) {
      haloEntry.halo.remove();
      IME.selectedHalos = IME.selectedHalos.filter(h => h.el !== el);
    }
    if (IME.selectedElement === el) {
      IME.selectedElement = IME.selectedElements[IME.selectedElements.length - 1] || null;
    }
    updateToolbarForSelection(IME.selectedElement);
  }

  function drawHalo(el) {
    if (IME.selectedHalo) IME.selectedHalo.remove();
    const halo = document.createElement('div');
    halo.className = 'ime-selection-halo';
    document.body.appendChild(halo);
    IME.selectedHalo = halo;
    positionHalo(halo, el);
    window.addEventListener('scroll', () => positionHalo(halo, el), { once: true, passive: true });
  }

  function positionHalo(halo, el) {
    const r = el.getBoundingClientRect();
    halo.style.left = (r.left + window.scrollX - 4) + 'px';
    halo.style.top = (r.top + window.scrollY - 4) + 'px';
    halo.style.width = (r.width + 8) + 'px';
    halo.style.height = (r.height + 8) + 'px';
  }

  function updateToolbarForSelection(el) {
    const enable = !!el;
    // Element-specific controls require a selected element
    const elementIds = ['ime-style-select','ime-font-select','ime-size-select','ime-size-minus','ime-size-plus','ime-colour-select'];
    for (const id of elementIds) {
      const e = document.getElementById(id);
      if (e) e.disabled = !enable;
    }
    // Add comment is always enabled — falls back to slide-level when no element is selected
    const cmt = document.getElementById('ime-add-comment');
    if (cmt) cmt.disabled = false;

    const targetLabel = document.getElementById('ime-target-label');
    if (!el) {
      if (targetLabel) targetLabel.textContent = 'Click an element — or use Add comment for a slide-level note';
      return;
    }

    const imeditId = el.getAttribute('data-imedit-id') || '(no id)';
    const role = imeditId.split('-').slice(1, -1).join('-') || 'element';
    if (targetLabel) targetLabel.textContent = `${role} · ${imeditId}`;

    const override = IME.state.styles && IME.state.styles[imeditId];
    const styleSelect = document.getElementById('ime-style-select');
    const fontSelect = document.getElementById('ime-font-select');
    const sizeSelect = document.getElementById('ime-size-select');
    const colourSelect = document.getElementById('ime-colour-select');

    if (typeof override === 'string') {
      styleSelect.value = override;
      fontSelect.value = ''; sizeSelect.value = ''; colourSelect.value = '';
    } else if (override && typeof override === 'object') {
      styleSelect.value = override.style || '';
      fontSelect.value = override['font-family'] || '';
      const fs = override['font-size'];
      sizeSelect.value = fs ? (parseFloat(fs) * 0.75).toString() : '';
      colourSelect.value = override.color || '';
    } else {
      const defaultStyle = (IME.catalogue.default_style_by_role || {})[role] || '';
      styleSelect.value = defaultStyle;
      fontSelect.value = ''; sizeSelect.value = ''; colourSelect.value = '';
    }
  }

  // ---------- Style / font / size / colour application ----------
  function onStyleChange(e) {
    const targets = IME.selectedElements.length > 0 ? IME.selectedElements : (IME.selectedElement ? [IME.selectedElement] : []);
    if (targets.length === 0) return;
    const newStyle = e.target.value;
    for (const target of targets) {
      const imeditId = target.getAttribute('data-imedit-id');
      const current = IME.state.styles[imeditId] || {};
      const merged = typeof current === 'string' ? { style: current } : { ...current };
      if (newStyle) merged.style = newStyle;
      else delete merged.style;
      if (Object.keys(merged).length === 0) delete IME.state.styles[imeditId];
      else if (Object.keys(merged).length === 1 && merged.style) IME.state.styles[imeditId] = merged.style;
      else IME.state.styles[imeditId] = merged;
      applyOverrideToElement(target, IME.state.styles[imeditId] || '');
    }
    markDirty();
    for (const h of IME.selectedHalos) positionHalo(h.halo, h.el);
  }

  function onFontChange(e) { updateOverrideProp('font-family', e.target.value); }
  function onSizeChange(e) {
    const ptStr = e.target.value;
    if (ptStr === '') {
      updateOverrideProp('font-size', '');
      return;
    }
    const pt = parseFloat(ptStr);
    if (Number.isNaN(pt)) return;
    const px = (pt / 0.75).toFixed(2) + 'px';
    updateOverrideProp('font-size', px);
  }
  function onSizeMinus() {
    const select = document.getElementById('ime-size-select');
    if (!select) return;
    const options = Array.from(select.options).filter(o => o.value !== '');
    const currentPx = getCurrentEffectiveSize();
    const currentPt = currentPx * 0.75;
    let target = null;
    for (let i = options.length - 1; i >= 0; i--) {
      if (parseFloat(options[i].value) < currentPt - 0.05) { target = options[i]; break; }
    }
    if (!target) target = options[0];
    select.value = target.value;
    onSizeChange({ target: select });
  }
  function onSizePlus() {
    const select = document.getElementById('ime-size-select');
    if (!select) return;
    const options = Array.from(select.options).filter(o => o.value !== '');
    const currentPx = getCurrentEffectiveSize();
    const currentPt = currentPx * 0.75;
    let target = null;
    for (const opt of options) {
      if (parseFloat(opt.value) > currentPt + 0.05) { target = opt; break; }
    }
    if (!target) target = options[options.length - 1];
    select.value = target.value;
    onSizeChange({ target: select });
  }
  function onColourChange(e) { updateOverrideProp('color', e.target.value); }

  function updateOverrideProp(prop, value) {
    const targets = IME.selectedElements.length > 0 ? IME.selectedElements : (IME.selectedElement ? [IME.selectedElement] : []);
    if (targets.length === 0) return;
    for (const target of targets) {
      const imeditId = target.getAttribute('data-imedit-id');
      const current = IME.state.styles[imeditId];
      let merged;
      if (typeof current === 'string') merged = { style: current };
      else if (current && typeof current === 'object') merged = { ...current };
      else merged = {};
      if (value) merged[prop] = value;
      else delete merged[prop];
      if (Object.keys(merged).length === 0) {
        delete IME.state.styles[imeditId];
        target.style.removeProperty(prop);
      } else if (Object.keys(merged).length === 1 && merged.style) {
        IME.state.styles[imeditId] = merged.style;
        target.style.removeProperty(prop);
      } else {
        IME.state.styles[imeditId] = merged;
        if (value) target.style.setProperty(prop, value);
        else target.style.removeProperty(prop);
      }
    }
    markDirty();
    for (const h of IME.selectedHalos) positionHalo(h.halo, h.el);
  }

  function getCurrentEffectiveSize() {
    if (!IME.selectedElement) return 16;
    return parseFloat(getComputedStyle(IME.selectedElement).fontSize) || 16;
  }

  function markDirty() {
    IME.unsaved = true;
    const dot = document.getElementById('ime-save-dot');
    if (dot) { dot.classList.remove('ime-saved'); dot.title = 'Unsaved changes'; }
    syncStateToScript();
    if (IME.saveTimer) clearTimeout(IME.saveTimer);
    IME.saveTimer = setTimeout(saveDeck, 1000);
  }
  function markClean() {
    IME.unsaved = false;
    const dot = document.getElementById('ime-save-dot');
    if (dot) { dot.classList.add('ime-saved'); dot.title = 'All changes saved'; }
  }
  function syncStateToScript() {
    const stateEl = document.getElementById('im-edit-state');
    if (stateEl) stateEl.textContent = JSON.stringify(IME.state, null, 2);
  }

  // ---------- Comments ----------
  function renderCommentsPanel() {
    const panel = document.createElement('div');
    panel.className = 'ime-comments-panel ime-collapsed';
    panel.id = 'ime-comments-panel';
    panel.innerHTML = `
      <div class="ime-panel-header">
        <span>Comments</span>
        <span id="ime-comment-count" style="opacity:0.5">0</span>
      </div>
      <div id="ime-comment-list"></div>
    `;
    document.body.appendChild(panel);
    refreshCommentsPanel();
  }

  function refreshCommentsPanel() {
    const list = document.getElementById('ime-comment-list');
    const count = document.getElementById('ime-comment-count');
    const comments = IME.state.comments || [];
    if (count) count.textContent = comments.length;
    if (!list) return;
    if (comments.length === 0) {
      list.innerHTML = '<div class="ime-comment-empty">No comments yet.<br>Click an element and use "Add comment".</div>';
      return;
    }
    list.innerHTML = '';
    for (const c of comments) {
      const card = document.createElement('div');
      card.className = 'ime-comment-card';
      card.dataset.commentId = c.id;
      card.innerHTML = `
        <div class="ime-comment-meta">slide ${c.slide_index} · ${humanize(c.target_role || 'element')}</div>
        <div class="ime-comment-text">${escapeHtml(c.text)}</div>
        <div class="ime-comment-status ime-${c.status || 'pending'}">${c.status || 'pending'}</div>
      `;
      card.addEventListener('click', () => {
        const target = document.querySelector(`[data-imedit-id="${c.target_imedit_id}"]`);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          selectElement(target);
        }
      });
      list.appendChild(card);
    }
  }

  function renderCommentPins() {
    document.querySelectorAll('.ime-comment-pin').forEach(p => p.remove());
    const comments = IME.state.comments || [];
    const activeSlide = document.querySelector('section.slide.active');
    if (!activeSlide) return;
    for (const c of comments) {
      let target;
      if (c.target_imedit_id) {
        target = document.querySelector(`[data-imedit-id="${c.target_imedit_id}"]`);
      } else {
        const slideEls = document.querySelectorAll('section.slide');
        target = slideEls[(c.target_slide_index || c.slide_index || 1) - 1];
      }
      if (!target) continue;
      // Skip if the target is not on the active slide
      const targetSlide = target.closest('section.slide') || target;
      if (targetSlide !== activeSlide) continue;
      const pin = document.createElement('div');
      pin.className = 'ime-comment-pin';
      if (c.status === 'applied') pin.classList.add('ime-applied');
      pin.textContent = comments.indexOf(c) + 1;
      pin.title = c.text;
      pin.addEventListener('click', e => {
        e.stopPropagation();
        selectElement(target);
        const panel = document.getElementById('ime-comments-panel');
        if (panel && panel.classList.contains('ime-collapsed')) onTogglePanel();
      });
      document.body.appendChild(pin);
      const r = target.getBoundingClientRect();
      if (!c.target_imedit_id) {
        pin.style.left = (r.left + window.scrollX + 8) + 'px';
        pin.style.top = (r.top + window.scrollY + 8) + 'px';
      } else {
        pin.style.left = (r.right + window.scrollX - 11) + 'px';
        pin.style.top = (r.top + window.scrollY - 11) + 'px';
      }
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function onAddCommentClick() {
    // Determine target: element if one is selected; otherwise the currently visible slide
    let el = IME.selectedElement;
    let isSlideLevel = false;
    if (!el) {
      el = document.querySelector('section.slide.active') || document.querySelector('section.slide');
      isSlideLevel = true;
      if (!el) return;
    }
    const r = el.getBoundingClientRect();

    document.querySelectorAll('.ime-comment-popover').forEach(p => p.remove());

    const pop = document.createElement('div');
    pop.className = 'ime-comment-popover';
    const placeholder = isSlideLevel ?
      "Slide-level comment — e.g. 'replace icons with people instead of objects'" :
      "Element comment — e.g. 'rephrase to be more direct' or 'delete this'";
    pop.innerHTML = `
      <textarea placeholder="${placeholder}"></textarea>
      <div class="ime-popover-actions">
        <button class="ime-cancel">Cancel</button>
        <button class="ime-confirm">Add</button>
      </div>
    `;
    document.body.appendChild(pop);
    if (isSlideLevel) {
      pop.style.left = (window.innerWidth / 2 - 160) + 'px';
      pop.style.top = (window.scrollY + 100) + 'px';
    } else {
      pop.style.left = (r.left + window.scrollX) + 'px';
      pop.style.top = (r.bottom + window.scrollY + 8) + 'px';
    }
    const ta = pop.querySelector('textarea');
    ta.focus();

    pop.querySelector('.ime-cancel').addEventListener('click', () => pop.remove());
    pop.querySelector('.ime-confirm').addEventListener('click', () => {
      const text = ta.value.trim();
      if (!text) { pop.remove(); return; }
      const slideEl = isSlideLevel ? el : el.closest('section.slide');
      const slideIndex = slideEl ? parseInt(slideEl.getAttribute('data-slide')) || 0 : 0;
      const imeditId = isSlideLevel ? null : el.getAttribute('data-imedit-id');
      const role = isSlideLevel ? 'slide' : (imeditId ? imeditId.split('-').slice(1, -1).join('-') : 'element');
      const newComment = {
        id: 'c-' + Math.random().toString(36).slice(2, 10),
        target_imedit_id: imeditId,
        target_role: role,
        target_slide_index: slideIndex,
        slide_index: slideIndex,
        scope: isSlideLevel ? 'slide' : 'element',
        text,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      IME.state.comments = IME.state.comments || [];
      IME.state.comments.push(newComment);
      markDirty();
      refreshCommentsPanel();
      renderCommentPins();
      pop.remove();
    });
  }

  // ---------- Globals panel ----------
  function onToggleGlobals() {
    let panel = document.getElementById('ime-globals-panel');
    if (panel) {
      panel.remove();
      return;
    }
    renderGlobalsPanel();
  }

  function renderGlobalsPanel() {
    const panel = document.createElement('div');
    panel.id = 'ime-globals-panel';
    panel.className = 'ime-globals-panel';
    panel.style.cssText = `
      position: fixed; top: 60px; right: 16px; width: 400px; max-height: 80vh; overflow-y: auto;
      background: rgba(31, 32, 35, 0.98); color: #E1E0DE;
      border: 1px solid rgba(255,255,255,0.1); border-radius: 6px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      font-family: -apple-system, "Segoe UI", Arial, sans-serif; font-size: 13px;
      z-index: 9200; padding: 16px;
    `;

    const header = document.createElement('div');
    header.style.cssText = 'display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;';
    header.innerHTML = `<strong>Global type controls</strong><button id="ime-globals-close" style="background:none; border:none; color:#E1E0DE; cursor:pointer; font-size:18px;">×</button>`;
    panel.appendChild(header);

    const intro = document.createElement('p');
    intro.style.cssText = 'opacity:0.7; font-size:11.5px; margin: 0 0 12px 0;';
    intro.textContent = 'All sizes in pt. Changes apply across the whole deck.';
    panel.appendChild(intro);

    IME.state.global_overrides = IME.state.global_overrides || {};

    // Section: Type tokens (CSS variables)
    const tokensHeader = document.createElement('div');
    tokensHeader.style.cssText = 'font-size:10.5px; letter-spacing:0.08em; text-transform:uppercase; opacity:0.5; margin: 8px 0 6px 0;';
    tokensHeader.textContent = 'Type tokens (CSS variables)';
    panel.appendChild(tokensHeader);

    const tokens = [
      { name: 'footer',         varName: '--type-footer',        defaultPx: 8.7 },
      { name: 'eyebrow',        varName: '--type-eyebrow',       defaultPx: 12 },
      { name: 'body-small',     varName: '--type-body-small',    defaultPx: 13.3 },
      { name: 'body',           varName: '--type-body',          defaultPx: 16 },
      { name: 'subheading',     varName: '--type-subheading',    defaultPx: 18.7 },
      { name: 'callout',        varName: '--type-callout',       defaultPx: 24 },
      { name: 'heading',        varName: '--type-heading',       defaultPx: 32 },
      { name: 'callout-large',  varName: '--type-callout-large', defaultPx: 53.3 },
    ];

    for (const tok of tokens) {
      // For type tokens, count elements whose computed font-size matches the variable.
      // Cheaper proxy: count elements that DECLARE font-size via var(--type-X) — we can't
      // walk stylesheets reliably across cross-origin/inline rules, so we compare computed
      // font-size to the variable's resolved px value.
      const rootStyle = getComputedStyle(document.documentElement);
      const varValuePx = parseFloat(rootStyle.getPropertyValue(tok.varName)) || tok.defaultPx;
      let tokTargetCount = 0;
      try {
        // Limit query to the slide deck content (skip toolbar/panel chrome)
        const decks = document.querySelectorAll('.deck, [class*="slide"]');
        decks.forEach(root => {
          root.querySelectorAll('*').forEach(el => {
            const cs = getComputedStyle(el);
            if (Math.abs(parseFloat(cs.fontSize) - varValuePx) < 0.6) tokTargetCount++;
          });
        });
      } catch {}
      panel.appendChild(makeRow({
        label: tok.name,
        currentPx: parseFloat(IME.state.global_overrides[tok.varName] || (tok.defaultPx + 'px')),
        targetCount: tokTargetCount,
        targetKind: 'type-token',
        onChangePx: (px) => {
          IME.state.global_overrides[tok.varName] = px + 'px';
          applyGlobalOverrides();
          markDirty();
        },
      }));
    }

    // Section: Named styles (from catalogue)
    const stylesHeader = document.createElement('div');
    stylesHeader.style.cssText = 'font-size:10.5px; letter-spacing:0.08em; text-transform:uppercase; opacity:0.5; margin: 16px 0 6px 0;';
    stylesHeader.textContent = 'Named styles (catalogue)';
    panel.appendChild(stylesHeader);

    // Names already covered by Type tokens — skip in Named Styles list to avoid duplicates
    const TOKEN_NAMES = new Set(['body', 'body-small', 'subheading', 'callout', 'callout-large', 'heading', 'eyebrow', 'footer']);
    const styles = IME.catalogue.styles || {};
    for (const styleName of Object.keys(styles)) {
      if (TOKEN_NAMES.has(styleName)) continue;
      const recipe = styles[styleName];
      const defaultPx = parseFloat(recipe['font-size'] || '16px');
      const overrideKey = 'style:' + styleName;
      const currentPx = parseFloat(IME.state.global_overrides[overrideKey] || (defaultPx + 'px'));
      const namedTargetCount = targetCountForSelectors(selectorsForNamedStyle(styleName));
      panel.appendChild(makeRow({
        label: styleName,
        currentPx,
        targetCount: namedTargetCount,
        targetKind: 'named-style',
        onChangePx: (px) => {
          IME.state.global_overrides[overrideKey] = px + 'px';
          applyGlobalOverrides();
          markDirty();
        },
      }));
    }

    document.body.appendChild(panel);
    document.getElementById('ime-globals-close').addEventListener('click', () => panel.remove());
  }

  function makeRow({ label, currentPx, onChangePx, targetCount, targetKind }) {
    const row = document.createElement('div');
    const noTargets = targetCount === 0;
    row.style.cssText = `display:grid; grid-template-columns: 140px 1fr 60px 60px; gap:8px; align-items:center; margin-bottom:6px; padding-bottom:6px; border-bottom: 1px solid rgba(255,255,255,0.06); opacity: ${noTargets ? '0.4' : '1'};`;
    row.title = noTargets
      ? `No elements in this deck use the "${label}" style — control disabled.`
      : `${targetCount} element${targetCount === 1 ? '' : 's'} in this deck match "${label}".`;

    const lab = document.createElement('span');
    lab.textContent = label;
    lab.style.cssText = 'font-weight:600;';
    row.appendChild(lab);

    const input = document.createElement('input');
    input.type = 'number';
    input.step = '0.5'; input.min = '4'; input.max = '90';
    input.value = (currentPx * 0.75).toFixed(1); // px → pt
    input.disabled = noTargets;
    input.style.cssText = `background:#2F363B; color:#F2F2F1; border:1px solid rgba(255,255,255,0.1); border-radius:4px; padding:4px 8px; font-size:12px; ${noTargets ? 'cursor:not-allowed;' : ''}`;

    const pxHint = document.createElement('span');
    pxHint.style.cssText = 'opacity:0.5; font-size:10.5px;';
    pxHint.textContent = currentPx.toFixed(1) + 'px';

    const countHint = document.createElement('span');
    countHint.style.cssText = `font-size:10.5px; text-align:right; color:${noTargets ? '#C07830' : '#67817F'};`;
    countHint.textContent = noTargets ? 'no targets' : `${targetCount} target${targetCount === 1 ? '' : 's'}`;

    if (!noTargets) {
      input.addEventListener('input', () => {
        const pt = parseFloat(input.value);
        if (!Number.isNaN(pt)) pxHint.textContent = (pt / 0.75).toFixed(1) + 'px';
      });
      input.addEventListener('change', () => {
        const pt = parseFloat(input.value);
        if (Number.isNaN(pt)) return;
        const px = pt / 0.75; // pt → px
        onChangePx(px.toFixed(2));
        pxHint.textContent = px.toFixed(1) + 'px';
      });
    }

    row.appendChild(input);
    row.appendChild(pxHint);
    row.appendChild(countHint);
    return row;
  }

  function applyGlobalOverrides() {
    let styleEl = document.getElementById('ime-globals-css');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'ime-globals-css';
    }
    // Always re-append so the element is the LAST <style> in <head>.
    // This guarantees globals beat any per-element recipe styles added later
    // in the same session (which would otherwise win the cascade tie at !important).
    document.head.appendChild(styleEl);

    const overrides = IME.state.global_overrides || {};

    // CSS variable overrides — applied at :root, affect all rules using var(--type-*)
    const varRules = Object.entries(overrides)
      .filter(([k]) => k.startsWith('--'))
      .map(([k, v]) => `${k}: ${v};`)
      .join(' ');
    let css = varRules ? `:root { ${varRules} }\n` : '';

    // Named-style recipe overrides — affect elements with .ime-style-<name> class
    // PLUS the deck-specific extra selectors from NAMED_STYLE_EXTRA_SELECTORS.
    for (const [key, value] of Object.entries(overrides)) {
      if (!key.startsWith('style:')) continue;
      const styleName = key.slice(6);
      const selectors = selectorsForNamedStyle(styleName);
      css += `${selectors.join(', ')} { font-size: ${value} !important; }\n`;
    }

    styleEl.textContent = css;
  }

  // ---------- Save (File System Access API + fallback) ----------
  // saveDeck(fromUserGesture): when true, may call showSaveFilePicker.
  // When false (debounced auto-save), only writes if an existing handle is available.
  async function saveDeck(fromUserGesture = false) {
    syncStateToScript();
    const html = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
    try {
      if (IME.fileHandle && 'createWritable' in IME.fileHandle) {
        const writable = await IME.fileHandle.createWritable();
        await writable.write(html);
        await writable.close();
        markClean();
        return;
      }
      if (!fromUserGesture) {
        // No handle yet AND no user gesture — calling showSaveFilePicker would throw.
        // Leave dirty flag set and show a hint on the save dot.
        const dot = document.getElementById('ime-save-dot');
        if (dot) dot.title = 'Click Save to choose where to save (first save this session)';
        return;
      }
      if ('showSaveFilePicker' in window) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: getSuggestedName(),
            types: [{ description: 'HTML deck', accept: { 'text/html': ['.html'] } }],
          });
          IME.fileHandle = handle;
          const writable = await handle.createWritable();
          await writable.write(html);
          await writable.close();
          markClean();
          return;
        } catch (pickerErr) {
          if (pickerErr.name === 'AbortError') return;
          // NotAllowedError / SecurityError: Chrome blocks the picker on this origin/context.
          // Fall through to the download fallback below.
          console.warn('[im-edit] showSaveFilePicker blocked, falling back to download:', pickerErr.message);
        }
      }
      // Fallback: download a copy via Blob link. Works on file:// when the picker is restricted.
      const blob = new Blob([html], { type: 'text/html' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = getSuggestedName();
      a.click();
      URL.revokeObjectURL(a.href);
      markClean();
    } catch (e) {
      if (e.name === 'AbortError') return;
      console.error('[im-edit] Save failed:', e);
      if (fromUserGesture) alert('Save failed: ' + e.message);
    }
  }

  function getSuggestedName() {
    const path = location.pathname.split('/').pop() || 'deck.html';
    return path.endsWith('.html') ? path : path + '.html';
  }

  function onSaveClick() {
    if (IME.saveTimer) clearTimeout(IME.saveTimer);
    saveDeck(true);
  }

  // ---------- Keyboard ----------
  function onKeyDown(e) {
    const t = e.target;
    if (t && (t.matches && (t.matches('input, textarea, select') || t.isContentEditable))) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault(); onSaveClick(); return;
    }
    if (e.key === 'Escape') {
      document.querySelectorAll('.ime-comment-popover').forEach(p => p.remove());
      clearSelection();
      return;
    }
    if (e.key === 'c' && IME.selectedElement && !e.ctrlKey && !e.metaKey) {
      e.preventDefault(); onAddCommentClick(); return;
    }
  }

  function onBeforeUnload(e) {
    if (IME.unsaved) { e.preventDefault(); e.returnValue = ''; }
  }

  // ---------- Boot ----------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
