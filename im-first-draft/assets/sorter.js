(function() {
  'use strict';

  const stateEl = document.getElementById('im-first-draft-state');
  const thumbsEl = document.getElementById('im-first-draft-thumbnails');
  if (!stateEl || !thumbsEl) { console.error('[im-first-draft] missing state or thumbnails script tag'); return; }

  const state = JSON.parse(stateEl.textContent);
  const thumbnails = JSON.parse(thumbsEl.textContent);

  const modal = document.getElementById('ifd-modal');
  const modalHeader = document.getElementById('ifd-modal-header');
  const modalCandidates = document.getElementById('ifd-modal-candidates');
  const modalClose = document.getElementById('ifd-modal-close');
  const suggestBtn = document.getElementById('ifd-suggest-more');
  const grid = document.getElementById('ifd-grid');
  const saveDot = document.getElementById('ifd-save-dot');

  let dirty = false;
  let fileHandle = null;
  let activeSlideIndex = null;

  function markDirty() {
    dirty = true;
    saveDot.classList.add('ifd-dirty');
    saveDot.title = 'Unsaved changes';
  }
  function markClean() {
    dirty = false;
    saveDot.classList.remove('ifd-dirty');
    saveDot.title = 'All changes saved';
  }

  function openModal(slideIdx) {
    activeSlideIndex = slideIdx;
    const slide = state.slides.find(s => s.index === slideIdx);
    if (!slide) return;
    modalHeader.textContent = `Alternative layouts for slide ${slide.index} — ${truncate(slide.title, 70)}`;
    modalCandidates.innerHTML = '';
    for (const cand of slide.candidates) {
      if (cand === slide.current_layout) continue;
      const div = document.createElement('div');
      div.className = 'ifd-candidate';
      div.innerHTML = `<div class="ifd-candidate-thumb">${thumbnails[cand] || ''}</div><div class="ifd-candidate-name">${cand}</div>`;
      div.addEventListener('click', () => pickLayout(slideIdx, cand));
      modalCandidates.appendChild(div);
    }
    modal.hidden = false;
  }
  function closeModal() {
    modal.hidden = true;
    activeSlideIndex = null;
  }
  function pickLayout(slideIdx, newLayout) {
    const slide = state.slides.find(s => s.index === slideIdx);
    if (!slide) return;
    slide.user_pick = newLayout;
    slide.current_layout = newLayout;
    rerenderCard(slide);
    syncStateToScript();
    markDirty();
    scheduleSave();
    closeModal();
  }
  function rerenderCard(slide) {
    const card = grid.querySelector(`.ifd-slide-card[data-slide="${slide.index}"]`);
    if (!card) return;
    card.setAttribute('data-layout', slide.current_layout);
    card.querySelector('.ifd-slide-layout-badge').textContent = slide.current_layout;
    card.querySelector('.ifd-thumb-wrap').innerHTML = thumbnails[slide.current_layout] || '';
  }
  function syncStateToScript() {
    stateEl.textContent = JSON.stringify(state, null, 2);
  }
  function truncate(s, max) { return s.length > max ? s.slice(0, max - 1) + '…' : s; }

  let saveTimer = null;
  function scheduleSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => save(false), 1200);
  }
  async function save(fromUserGesture) {
    syncStateToScript();
    const html = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
    try {
      if (fileHandle && 'createWritable' in fileHandle) {
        const w = await fileHandle.createWritable();
        await w.write(html); await w.close();
        markClean(); return;
      }
      if (!fromUserGesture) return;
      if ('showSaveFilePicker' in window) {
        const h = await window.showSaveFilePicker({
          suggestedName: location.pathname.split('/').pop() || 'firstdraft.html',
          types: [{ description: 'HTML', accept: { 'text/html': ['.html'] } }]
        });
        fileHandle = h;
        const w = await h.createWritable();
        await w.write(html); await w.close();
        markClean(); return;
      }
      const blob = new Blob([html], { type: 'text/html' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = location.pathname.split('/').pop() || 'firstdraft.html';
      a.click(); URL.revokeObjectURL(a.href);
      markClean();
    } catch (e) {
      if (e.name === 'AbortError') return;
      console.error('[im-first-draft] save failed:', e);
    }
  }

  function onSuggestMore() {
    if (activeSlideIndex == null) return;
    const slide = state.slides.find(s => s.index === activeSlideIndex);
    if (!slide) return;
    const prompt =
      `For slide ${slide.index} of the first draft (action title: "${slide.title}", current layout: ${slide.current_layout}, ` +
      `current candidates already shown: ${slide.candidates.join(', ')}), propose 2-3 alternative layouts not already shown that fit this slide's intent. ` +
      `If a worthwhile alternative isn't in the standard 12-layout catalog, describe a new layout I could add.`;
    if (typeof window.sendPrompt === 'function') {
      window.sendPrompt(prompt);
    } else {
      navigator.clipboard.writeText(prompt).then(
        () => alert('sendPrompt not available — prompt copied to clipboard. Paste it into chat.'),
        () => alert('sendPrompt not available. Prompt:\n\n' + prompt)
      );
    }
    closeModal();
  }

  grid.addEventListener('click', e => {
    const card = e.target.closest('.ifd-slide-card');
    if (!card) return;
    openModal(parseInt(card.getAttribute('data-slide'), 10));
  });
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  suggestBtn.addEventListener('click', onSuggestMore);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(true); }
  });
  window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
})();
