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
    modalHeader.textContent = `Alternative layouts for slide ${slide.index} — ${slide.title}`;
    modalCandidates.innerHTML = '';
    // Current-layout preview block
    const currentBlock = document.createElement('div');
    currentBlock.className = 'ifd-current-layout';
    currentBlock.innerHTML = `
      <div class="ifd-current-label">Current</div>
      <div class="ifd-current-thumb">${thumbnails[slide.current_layout] || ''}</div>
      <div class="ifd-current-name">${slide.current_layout}</div>
    `;
    modalCandidates.appendChild(currentBlock);
    // Alternative candidates
    const alternatives = slide.candidates.filter(c => c !== slide.current_layout);
    if (alternatives.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'ifd-empty-alts';
      empty.textContent = 'No catalog alternatives. Click "Suggest something else" for AI proposals.';
      modalCandidates.appendChild(empty);
    } else {
      for (const cand of alternatives) {
        const div = document.createElement('div');
        div.className = 'ifd-candidate';
        div.innerHTML = `<div class="ifd-candidate-thumb">${thumbnails[cand] || ''}</div><div class="ifd-candidate-name">${cand}</div>`;
        div.addEventListener('click', () => pickLayout(slideIdx, cand));
        modalCandidates.appendChild(div);
      }
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
  let saveTimer = null;
  function scheduleSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => save(false), 1200);
  }
  const toastEl = document.getElementById('ifd-toast');
  let toastTimer = null;
  function showToast(message, kind) {
    if (!toastEl) { console.log('[im-first-draft]', message); return; }
    toastEl.textContent = message;
    toastEl.className = 'ifd-toast ifd-toast-' + (kind || 'info');
    toastEl.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 4000);
  }

  async function save(fromUserGesture) {
    syncStateToScript();
    const html = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
    const filename = decodeURIComponent(location.pathname.split('/').pop()) || 'firstdraft.html';
    try {
      if (fileHandle && 'createWritable' in fileHandle) {
        const w = await fileHandle.createWritable();
        await w.write(html); await w.close();
        markClean();
        showToast('Saved in place', 'ok');
        return;
      }
      if (!fromUserGesture) return;
      // Try in-place save via File System Access API
      if ('showSaveFilePicker' in window) {
        try {
          const h = await window.showSaveFilePicker({
            suggestedName: filename,
            types: [{ description: 'HTML', accept: { 'text/html': ['.html'] } }]
          });
          fileHandle = h;
          const w = await h.createWritable();
          await w.write(html); await w.close();
          markClean();
          showToast('Saved — future saves will write to the same file silently', 'ok');
          return;
        } catch (e) {
          if (e.name === 'AbortError') { showToast('Save cancelled', 'info'); return; }
          // NotAllowedError / SecurityError / file://-restricted contexts — fall through to download
          console.warn('[im-first-draft] showSaveFilePicker rejected, falling back to download:', e.message);
        }
      }
      // Fallback: blob download. Lands in the Downloads folder; user replaces the original.
      const blob = new Blob([html], { type: 'text/html' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
      markClean();
      showToast('Downloaded ' + filename + ' to your Downloads folder. Replace the original to keep your picks. (Or use "Copy picks" for a no-file flow.)', 'warn');
    } catch (e) {
      console.error('[im-first-draft] save failed:', e);
      showToast('Save failed: ' + (e.message || e.name || 'unknown error'), 'err');
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
  const saveBtn = document.getElementById('ifd-save-btn');
  if (saveBtn) saveBtn.addEventListener('click', () => save(true));
  const copyPicksBtn = document.getElementById('ifd-copy-picks-btn');
  if (copyPicksBtn) copyPicksBtn.addEventListener('click', copyPicks);

  function copyPicks() {
    const picks = state.slides
      .filter(s => s.user_pick && s.user_pick !== s.candidates[s.candidates.length - 1])
      .map(s => ({ index: s.index, title: s.title, layout: s.user_pick }));
    const hasPicks = state.slides.some(s => s.user_pick);
    if (!hasPicks) {
      showToast('No picks to copy — swap a layout first by clicking a slide', 'info');
      return;
    }
    const payload = {
      story_file: state.story_file,
      picks: state.slides
        .filter(s => s.user_pick)
        .map(s => ({ index: s.index, layout: s.user_pick }))
    };
    const json = JSON.stringify(payload, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(json).then(
        () => showToast('Picks copied. Paste in chat and say "apply these picks".', 'ok'),
        () => promptCopy(json)
      );
    } else {
      promptCopy(json);
    }
  }
  function promptCopy(json) {
    window.prompt('Copy this JSON and paste in chat:', json);
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); e.stopPropagation(); save(true); }
  });
  window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
})();
