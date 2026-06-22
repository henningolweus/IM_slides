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
  const copyBtn = document.getElementById('ifd-copy-changes-btn');
  const countEl = document.getElementById('ifd-changes-count');
  const toastEl = document.getElementById('ifd-toast');

  let activeSlideIndex = null;
  let toastTimer = null;

  function showToast(message, kind) {
    if (!toastEl) { console.log('[im-first-draft]', message); return; }
    toastEl.textContent = message;
    toastEl.className = 'ifd-toast ifd-toast-' + (kind || 'info');
    toastEl.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 4000);
  }

  function changeCount() {
    return state.slides.filter(s => s.user_pick || s.wants_ai_suggestion).length;
  }
  function updateCountBadge() {
    if (!countEl) return;
    const n = changeCount();
    countEl.textContent = n;
    copyBtn.classList.toggle('ifd-has-changes', n > 0);
  }
  function syncStateToScript() {
    stateEl.textContent = JSON.stringify(state, null, 2);
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
      empty.textContent = 'No catalog alternatives. Click "Suggest something else" to ask Claude.';
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
    // Reflect already-flagged AI request state on the suggest button
    suggestBtn.textContent = slide.wants_ai_suggestion ? 'Cancel AI request' : 'Suggest something else';
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
    delete slide.wants_ai_suggestion; // a concrete pick supersedes the AI request
    rerenderCard(slide);
    syncStateToScript();
    updateCountBadge();
    closeModal();
  }
  function toggleAiRequest() {
    if (activeSlideIndex == null) return;
    const slide = state.slides.find(s => s.index === activeSlideIndex);
    if (!slide) return;
    if (slide.wants_ai_suggestion) {
      delete slide.wants_ai_suggestion;
      showToast(`Slide ${slide.index}: AI request cancelled`, 'info');
    } else {
      slide.wants_ai_suggestion = true;
      showToast(`Slide ${slide.index}: marked for AI suggestions — include via "Copy changes"`, 'ok');
    }
    rerenderCard(slide);
    syncStateToScript();
    updateCountBadge();
    closeModal();
  }
  function rerenderCard(slide) {
    const card = grid.querySelector(`.ifd-slide-card[data-slide="${slide.index}"]`);
    if (!card) return;
    card.setAttribute('data-layout', slide.current_layout);
    card.querySelector('.ifd-slide-layout-badge').textContent = slide.current_layout;
    card.querySelector('.ifd-thumb-wrap').innerHTML = thumbnails[slide.current_layout] || '';
    card.classList.toggle('ifd-picked', !!slide.user_pick);
    card.classList.toggle('ifd-wants-ai', !!slide.wants_ai_suggestion);
  }

  function copyChanges() {
    if (changeCount() === 0) {
      showToast('No changes to copy. Click a slide to swap its layout or request AI suggestions.', 'info');
      return;
    }
    const payload = {
      story_file: state.story_file,
      picks: state.slides
        .filter(s => s.user_pick)
        .map(s => ({ index: s.index, layout: s.user_pick })),
      ai_suggestions_requested: state.slides
        .filter(s => s.wants_ai_suggestion)
        .map(s => ({ index: s.index, title: s.title, current_layout: s.current_layout }))
    };
    const json = JSON.stringify(payload, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(json).then(
        () => showToast('Changes copied. Paste in chat and say "apply these changes".', 'ok'),
        () => promptCopy(json)
      );
    } else {
      promptCopy(json);
    }
  }
  function promptCopy(json) {
    window.prompt('Copy this JSON and paste in chat:', json);
  }

  grid.addEventListener('click', e => {
    const card = e.target.closest('.ifd-slide-card');
    if (!card) return;
    openModal(parseInt(card.getAttribute('data-slide'), 10));
  });
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  suggestBtn.addEventListener('click', toggleAiRequest);
  if (copyBtn) copyBtn.addEventListener('click', copyChanges);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && e.shiftKey) { e.preventDefault(); copyChanges(); }
  });

  updateCountBadge();
  // Reflect persisted state (e.g. picks loaded from a saved file) on initial render
  for (const slide of state.slides) {
    if (slide.user_pick || slide.wants_ai_suggestion) rerenderCard(slide);
  }
})();
