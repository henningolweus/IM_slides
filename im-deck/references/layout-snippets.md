# Layout Snippets — im-deck Reference

12 composable HTML layouts + deck chrome. Read only the sections you need for the current deck.

**Usage:** Replace every `<!-- FILL: ... -->` comment with actual content. Replace `N` in `data-slide="N"` with the actual 1-based slide number. Replace `NN / TT` in page numbers with actual numbers.

**CSS:** All class names reference `im-styles.css`. Inline that file in the deck's `<style>` tag.

## Layout 1 — Cover

**When to use:** First slide of every deck. The only slide without an action title.

**Variants:** `:dark` (banded dark stripe + photo right, Proposal 4 style)

```html
<!-- Standard proposal cover: solid green-grey left + photo-placeholder right -->
<section class="slide slide-cover" data-slide="1">
  <div class="cover-left">
    <div class="im-mark">IM_</div>
    <div>
      <h1 data-imedit-id="{IMEDIT_ID:title:0}"><!-- FILL: deck title; use <em>word</em> to italicise key words --></h1>
      <p class="subtitle" data-imedit-id="{IMEDIT_ID:subtitle:0}"><!-- FILL: one-line italic subtitle, e.g. "A letter of proposal for [Client]" --></p>
    </div>
    <p class="meta" data-imedit-id="{IMEDIT_ID:meta:0}">
      <strong><!-- FILL: deck type label, e.g. "Letter of proposal" --></strong> · <!-- FILL: Month YYYY --><br>
      Implement Consulting Group
    </p>
  </div>
  <div class="cover-right-photo">
    <div class="photo-placeholder-cover">Image placeholder</div>
    <span class="im-mark-vertical">IMPLEMENT CONSULTING GROUP_</span>
  </div>
</section>

<!-- Dark variant: add class variant-dark for Proposal 4 style -->
<!-- <section class="slide slide-cover variant-dark" data-slide="1"> -->
```

**Notes:** The `.cover-left` has `background: var(--im-blue-green)` (proposal green). For non-proposal decks that need the dark right panel with body text, use `.cover-right` (not `.cover-right-photo`) — the old styles are preserved on `.cover-right`. For the `:dark` variant add `variant-dark` class to the section.

---

## Layout 2 — Bleed-right panel

**When to use:** Facts/assets with a coloured keyinfo sidebar. Transaction details, references grid, advisory board. The right panel bleeds to the slide edge.

```html
<section class="slide bleed-right" data-slide="N">
  <div class="logo">IM_</div>
  <h2 class="action-title" data-imedit-id="{IMEDIT_ID:action-title:0}">
    <strong><!-- FILL: section label --></strong> | <!-- FILL: declarative action title sentence -->
  </h2>
  <div class="content-wrap">
    <div class="s2-layout">
      <!-- LEFT: grid of cards -->
      <div class="s2-left-header">
        <p class="table-label" data-imedit-id="{IMEDIT_ID:table-label:0}"><!-- FILL: grid label, e.g. "Assets acquired" or "Select references" --></p>
        <div class="table-label-underline"></div>
      </div>
      <div class="s2-left-body">
        <div class="assets-grid">
          <!-- FILL: repeat .asset-card for each item; 2×2 grid = 4 cards is the default -->
          <!-- NOTE: when repeating cards/rows, increment :N in data-imedit-id placeholders (e.g. :0 → :1 → :2 → :3) -->
          <div class="asset-card" data-imedit-id="{IMEDIT_ID:asset-card:0}">
            <p class="asset-loc" data-imedit-id="{IMEDIT_ID:asset-loc:0}"><!-- FILL: location / category / client industry --></p>
            <p class="asset-name" data-imedit-id="{IMEDIT_ID:asset-name:0}"><!-- FILL: asset or engagement name --></p>
            <p class="asset-desc" data-imedit-id="{IMEDIT_ID:asset-desc:0}"><!-- FILL: 1–2 sentence description --></p>
            <p class="asset-type" data-imedit-id="{IMEDIT_ID:asset-type:0}"><!-- FILL: type tag, e.g. "Gondola · year-round" or "Commercial VDD · 2024" --></p>
          </div>
          <!-- repeat asset-card × 3 more (use asset-card:1, asset-card:2, asset-card:3; asset-loc:1, asset-name:1, asset-desc:1, asset-type:1 etc.) -->
        </div>
      </div>
      <!-- RIGHT: coloured keyinfo panel -->
      <div class="s2-right" data-imedit-id="{IMEDIT_ID:s2-right:0}">
        <p class="table-label on-dark" data-imedit-id="{IMEDIT_ID:table-label:1}"><!-- FILL: sidebar label, e.g. "Key transaction facts" or "Our team" --></p>
        <div class="table-label-underline on-dark"></div>
        <!-- FILL: repeat .keyinfo-row for each key fact; 3–5 rows typical -->
        <div class="keyinfo-row" data-imedit-id="{IMEDIT_ID:keyinfo-row:0}">
          <div class="ki-icon">
            <!-- FILL: inline SVG icon, 24×24 viewBox, stroke="white" stroke-width="1.5" -->
            <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <!-- FILL: icon paths -->
            </svg>
          </div>
          <div class="ki-text">
            <p class="ki-kicker" data-imedit-id="{IMEDIT_ID:ki-kicker:0}"><!-- FILL: SHORT UPPERCASE LABEL --></p>
            <p class="ki-value" data-imedit-id="{IMEDIT_ID:ki-value:0}"><!-- FILL: the key value in Palatino, e.g. "23 Jan 2026" or "EUR 1,054bn AUM" --></p>
            <p class="ki-detail" data-imedit-id="{IMEDIT_ID:ki-detail:0}"><!-- FILL: supporting detail, 1 line --></p>
          </div>
        </div>
        <!-- repeat keyinfo-row (use ki-kicker:1, ki-value:1, ki-detail:1 etc.) -->
      </div>
    </div>
  </div>
  <p class="source-line"><!-- FILL: source attribution, or omit --></p>
  <p class="page-number"><!-- FILL: NN / TT --></p>
</section>
```

---

## Layout 3 — Iconic 3-column

**When to use:** Thesis with 3 parallel pillars. Investment thesis, 3-part value proposition, experience pillars in proposals. Each column has an icon circle, Palatino title, italic subtitle, and bullets.

```html
<section class="slide" data-slide="N">
  <div class="logo">IM_</div>
  <h2 class="action-title" data-imedit-id="{IMEDIT_ID:action-title:0}">
    <strong><!-- FILL: section label --></strong> | <!-- FILL: declarative action title -->
  </h2>
  <div class="content-wrap">
    <div class="iconic-three-col">

      <!-- Column 1 -->
      <div class="iconic-card" data-imedit-id="{IMEDIT_ID:iconic-card:0}">
        <div class="iconic-circle" data-imedit-id="{IMEDIT_ID:iconic-circle:0}">
          <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <!-- FILL: icon paths; stroke="#30373B" stroke-width="1.4" fill="none" -->
          </svg>
        </div>
        <p class="iconic-title" data-imedit-id="{IMEDIT_ID:iconic-title:0}"><!-- FILL: pillar title in Palatino --></p>
        <p class="iconic-subtitle" data-imedit-id="{IMEDIT_ID:iconic-subtitle:0}"><!-- FILL: italic descriptor, e.g. "Buy and build mature assets" --></p>
        <ul class="iconic-bullets">
          <li data-imedit-id="{IMEDIT_ID:bullet:0}"><!-- FILL: use <strong> for key terms --> </li>
          <li data-imedit-id="{IMEDIT_ID:bullet:1}"></li>
          <li data-imedit-id="{IMEDIT_ID:bullet:2}"></li>
        </ul>
      </div>

      <!-- Column 2 — identical structure -->
      <div class="iconic-card" data-imedit-id="{IMEDIT_ID:iconic-card:1}">
        <div class="iconic-circle" data-imedit-id="{IMEDIT_ID:iconic-circle:1}">
          <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><!-- FILL --></svg>
        </div>
        <p class="iconic-title" data-imedit-id="{IMEDIT_ID:iconic-title:1}"><!-- FILL --></p>
        <p class="iconic-subtitle" data-imedit-id="{IMEDIT_ID:iconic-subtitle:1}"><!-- FILL --></p>
        <ul class="iconic-bullets">
          <li data-imedit-id="{IMEDIT_ID:bullet:3}"><!-- FILL --></li>
          <li data-imedit-id="{IMEDIT_ID:bullet:4}"><!-- FILL --></li>
          <li data-imedit-id="{IMEDIT_ID:bullet:5}"><!-- FILL --></li>
        </ul>
      </div>

      <!-- Column 3 — identical structure -->
      <div class="iconic-card" data-imedit-id="{IMEDIT_ID:iconic-card:2}">
        <div class="iconic-circle" data-imedit-id="{IMEDIT_ID:iconic-circle:2}">
          <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><!-- FILL --></svg>
        </div>
        <p class="iconic-title" data-imedit-id="{IMEDIT_ID:iconic-title:2}"><!-- FILL --></p>
        <p class="iconic-subtitle" data-imedit-id="{IMEDIT_ID:iconic-subtitle:2}"><!-- FILL --></p>
        <ul class="iconic-bullets">
          <li data-imedit-id="{IMEDIT_ID:bullet:6}"><!-- FILL --></li>
          <li data-imedit-id="{IMEDIT_ID:bullet:7}"><!-- FILL --></li>
          <li data-imedit-id="{IMEDIT_ID:bullet:8}"><!-- FILL --></li>
        </ul>
      </div>

    </div>
  </div>
  <p class="source-line"><!-- FILL: or omit --></p>
  <p class="page-number"><!-- FILL: NN / TT --></p>
</section>
```

---

## Layout 4 — Two-panel

**When to use:** Governance, ownership structure, comparison, issues/mitigations, team/fee split. Two equally-weighted panels with labelled headers.

```html
<section class="slide" data-slide="N">
  <div class="logo">IM_</div>
  <h2 class="action-title" data-imedit-id="{IMEDIT_ID:action-title:0}">
    <strong><!-- FILL: section label --></strong> | <!-- FILL: declarative action title -->
  </h2>
  <div class="content-wrap">
    <div class="gov-layout">

      <!-- Left panel -->
      <div class="gov-side">
        <p class="table-label" data-imedit-id="{IMEDIT_ID:table-label:0}"><!-- FILL: left panel label --></p>
        <div class="table-label-underline"></div>
        <div class="gov-panel left-panel">
          <!-- FILL: ownership stack, bullets, or body text -->
          <!-- Option A: ownership stack -->
          <div class="ownership-stack">
            <div class="own-layer layer-top">
              <p class="layer-label" data-imedit-id="{IMEDIT_ID:layer-label:0}"><!-- FILL: tier label --></p>
              <p class="layer-name" data-imedit-id="{IMEDIT_ID:layer-name:0}"><!-- FILL: entity name --></p>
            </div>
            <div class="own-arrow">↓</div>
            <div class="own-layer">
              <p class="layer-label" data-imedit-id="{IMEDIT_ID:layer-label:1}"><!-- FILL --></p>
              <p class="layer-name" data-imedit-id="{IMEDIT_ID:layer-name:1}"><!-- FILL --></p>
            </div>
            <div class="own-arrow">↓</div>
            <div class="own-layer">
              <p class="layer-label" data-imedit-id="{IMEDIT_ID:layer-label:2}"><!-- FILL --></p>
              <p class="layer-name" data-imedit-id="{IMEDIT_ID:layer-name:2}"><!-- FILL --></p>
            </div>
          </div>
          <!-- Option B: bullets -->
          <ul class="gov-bullets">
            <li data-imedit-id="{IMEDIT_ID:bullet:0}"><!-- FILL --></li>
            <li data-imedit-id="{IMEDIT_ID:bullet:1}"><!-- FILL --></li>
          </ul>
        </div>
      </div>

      <!-- Right panel — identical structure, use right-panel class -->
      <div class="gov-side">
        <p class="table-label" data-imedit-id="{IMEDIT_ID:table-label:1}"><!-- FILL: right panel label --></p>
        <div class="table-label-underline"></div>
        <div class="gov-panel right-panel">
          <div class="gov-blocks">
            <!-- FILL: repeat gov-block for each sub-section (2–3 typical) -->
            <div class="gov-block">
              <p class="gov-block-label" data-imedit-id="{IMEDIT_ID:gov-block-label:0}"><!-- FILL: sub-section heading --></p>
              <ul class="gov-bullets">
                <li data-imedit-id="{IMEDIT_ID:bullet:2}"><!-- FILL --></li>
                <li data-imedit-id="{IMEDIT_ID:bullet:3}"><!-- FILL --></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
  <p class="source-line"><!-- FILL: or omit --></p>
  <p class="page-number"><!-- FILL: NN / TT --></p>
</section>
```

---

## Layout 5 — Moves / initiatives grid

**When to use:** 6 numbered plays or initiatives grouped into 2 themes (A/B). Also works for 4 items (1 group × 4) or scope workstreams.

```html
<section class="slide" data-slide="N">
  <div class="logo">IM_</div>
  <h2 class="action-title" data-imedit-id="{IMEDIT_ID:action-title:0}">
    <strong><!-- FILL: section label --></strong> | <!-- FILL: declarative action title -->
  </h2>
  <div class="content-wrap">
    <div class="moves-grid">

      <!-- Group A label -->
      <div class="moves-label">
        <p class="ml-kicker" data-imedit-id="{IMEDIT_ID:ml-kicker:0}"><!-- FILL: e.g. "Group A" or "Phase 1" --></p>
        <p class="ml-title" data-imedit-id="{IMEDIT_ID:ml-title:0}"><!-- FILL: group name in Palatino --></p>
        <p class="ml-sub" data-imedit-id="{IMEDIT_ID:ml-sub:0}"><!-- FILL: 1-line descriptor --></p>
      </div>

      <!-- Move card A1 -->
      <div class="move-card" data-imedit-id="{IMEDIT_ID:move-card:0}">
        <div class="move-head">
          <span class="mh-num" data-imedit-id="{IMEDIT_ID:mh-num:0}"><!-- FILL: A1 --></span>
          <span class="mh-name" data-imedit-id="{IMEDIT_ID:mh-name:0}"><!-- FILL: initiative name --></span>
          <span class="mh-icon">
            <svg viewBox="0 0 36 36" fill="none" stroke="#30373B" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
              <!-- FILL: icon paths -->
            </svg>
          </span>
        </div>
        <p class="move-body" data-imedit-id="{IMEDIT_ID:move-body:0}"><!-- FILL: 1–2 sentence description; use <strong> for key terms --></p>
      </div>

      <!-- Move cards A2, A3 — identical structure -->
      <div class="move-card" data-imedit-id="{IMEDIT_ID:move-card:1}">
        <div class="move-head"><span class="mh-num" data-imedit-id="{IMEDIT_ID:mh-num:1}">A2</span><span class="mh-name" data-imedit-id="{IMEDIT_ID:mh-name:1}"><!-- FILL --></span><span class="mh-icon"><svg viewBox="0 0 36 36" fill="none" stroke="#30373B" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><!-- FILL --></svg></span></div>
        <p class="move-body" data-imedit-id="{IMEDIT_ID:move-body:1}"><!-- FILL --></p>
      </div>
      <div class="move-card" data-imedit-id="{IMEDIT_ID:move-card:2}">
        <div class="move-head"><span class="mh-num" data-imedit-id="{IMEDIT_ID:mh-num:2}">A3</span><span class="mh-name" data-imedit-id="{IMEDIT_ID:mh-name:2}"><!-- FILL --></span><span class="mh-icon"><svg viewBox="0 0 36 36" fill="none" stroke="#30373B" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><!-- FILL --></svg></span></div>
        <p class="move-body" data-imedit-id="{IMEDIT_ID:move-body:2}"><!-- FILL --></p>
      </div>

      <!-- Group B label -->
      <div class="moves-label">
        <p class="ml-kicker" data-imedit-id="{IMEDIT_ID:ml-kicker:1}"><!-- FILL: e.g. "Group B" or "Phase 2" --></p>
        <p class="ml-title" data-imedit-id="{IMEDIT_ID:ml-title:1}"><!-- FILL: group name in Palatino --></p>
        <p class="ml-sub" data-imedit-id="{IMEDIT_ID:ml-sub:1}"><!-- FILL --></p>
      </div>

      <!-- Move cards B1, B2, B3 — identical to A1-A3 -->
      <div class="move-card" data-imedit-id="{IMEDIT_ID:move-card:3}">
        <div class="move-head"><span class="mh-num" data-imedit-id="{IMEDIT_ID:mh-num:3}">B1</span><span class="mh-name" data-imedit-id="{IMEDIT_ID:mh-name:3}"><!-- FILL --></span><span class="mh-icon"><svg viewBox="0 0 36 36" fill="none" stroke="#30373B" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><!-- FILL --></svg></span></div>
        <p class="move-body" data-imedit-id="{IMEDIT_ID:move-body:3}"><!-- FILL --></p>
      </div>
      <div class="move-card" data-imedit-id="{IMEDIT_ID:move-card:4}">
        <div class="move-head"><span class="mh-num" data-imedit-id="{IMEDIT_ID:mh-num:4}">B2</span><span class="mh-name" data-imedit-id="{IMEDIT_ID:mh-name:4}"><!-- FILL --></span><span class="mh-icon"><svg viewBox="0 0 36 36" fill="none" stroke="#30373B" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><!-- FILL --></svg></span></div>
        <p class="move-body" data-imedit-id="{IMEDIT_ID:move-body:4}"><!-- FILL --></p>
      </div>
      <div class="move-card" data-imedit-id="{IMEDIT_ID:move-card:5}">
        <div class="move-head"><span class="mh-num" data-imedit-id="{IMEDIT_ID:mh-num:5}">B3</span><span class="mh-name" data-imedit-id="{IMEDIT_ID:mh-name:5}"><!-- FILL --></span><span class="mh-icon"><svg viewBox="0 0 36 36" fill="none" stroke="#30373B" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><!-- FILL --></svg></span></div>
        <p class="move-body" data-imedit-id="{IMEDIT_ID:move-body:5}"><!-- FILL --></p>
      </div>

    </div>
  </div>
  <p class="source-line"><!-- FILL: or omit --></p>
  <p class="page-number"><!-- FILL: NN / TT --></p>
</section>
```

---

## Layout 6 — Alternating timeline

**When to use:** 6 signals / milestones on a horizontal time axis, alternating above/below. Confirmed events get filled black dots; upcoming get hollow blue-green dots.

```html
<section class="slide" data-slide="N">
  <div class="logo">IM_</div>
  <h2 class="action-title" data-imedit-id="{IMEDIT_ID:action-title:0}">
    <strong><!-- FILL: section label --></strong> | <!-- FILL: declarative action title -->
  </h2>
  <div class="content-wrap">
    <div class="timeline-wrap">
      <p class="table-label" data-imedit-id="{IMEDIT_ID:table-label:0}"><!-- FILL: axis label, e.g. "Expected timing of the six signals" --></p>
      <div class="table-label-underline"></div>

      <div class="signal-timeline-outer">
        <p class="st-end-label start">Now</p>
        <p class="st-end-label end"><!-- FILL: e.g. "24+ months" or "Q4 2027" --></p>

        <div class="signal-timeline">

          <!-- ABOVE: signals 1, 3, 5 (odd columns) -->
          <div class="st-content above confirmed first-col" data-imedit-id="{IMEDIT_ID:st-content:0}" style="grid-column: 1;">
            <!-- Add class "confirmed" if this event has already occurred -->
            <p class="st-num" data-imedit-id="{IMEDIT_ID:st-num:0}">01</p>
            <div class="st-title-row">
              <span class="st-title" data-imedit-id="{IMEDIT_ID:st-title:0}"><!-- FILL: signal name --></span>
              <span class="st-tag"><!-- FILL: "Already seen" if confirmed, else omit this span --></span>
            </div>
            <p class="st-body" data-imedit-id="{IMEDIT_ID:st-body:0}"><!-- FILL: 1–2 sentence description; use <strong> for key details --></p>
          </div>

          <div class="st-content above" data-imedit-id="{IMEDIT_ID:st-content:2}" style="grid-column: 3;">
            <p class="st-num" data-imedit-id="{IMEDIT_ID:st-num:2}">03</p>
            <div class="st-title-row"><span class="st-title" data-imedit-id="{IMEDIT_ID:st-title:2}"><!-- FILL --></span></div>
            <p class="st-body" data-imedit-id="{IMEDIT_ID:st-body:2}"><!-- FILL --></p>
          </div>

          <div class="st-content above" data-imedit-id="{IMEDIT_ID:st-content:4}" style="grid-column: 5;">
            <p class="st-num" data-imedit-id="{IMEDIT_ID:st-num:4}">05</p>
            <div class="st-title-row"><span class="st-title" data-imedit-id="{IMEDIT_ID:st-title:4}"><!-- FILL --></span></div>
            <p class="st-body" data-imedit-id="{IMEDIT_ID:st-body:4}"><!-- FILL --></p>
          </div>

          <!-- AXIS -->
          <div class="st-axis">
            <div class="st-line"></div>
            <!-- Add class "confirmed" to dots that represent past events -->
            <div class="st-dot confirmed" style="left: 8.33%;"></div>
            <div class="st-dot" style="left: 25%;"></div>
            <div class="st-dot" style="left: 41.67%;"></div>
            <div class="st-dot" style="left: 58.33%;"></div>
            <div class="st-dot" style="left: 75%;"></div>
            <div class="st-dot" style="left: 91.67%;"></div>
          </div>

          <!-- BELOW: signals 2, 4, 6 (even columns) -->
          <div class="st-content below" data-imedit-id="{IMEDIT_ID:st-content:1}" style="grid-column: 2;">
            <p class="st-num" data-imedit-id="{IMEDIT_ID:st-num:1}">02</p>
            <div class="st-title-row"><span class="st-title" data-imedit-id="{IMEDIT_ID:st-title:1}"><!-- FILL --></span></div>
            <p class="st-body" data-imedit-id="{IMEDIT_ID:st-body:1}"><!-- FILL --></p>
          </div>

          <div class="st-content below" data-imedit-id="{IMEDIT_ID:st-content:3}" style="grid-column: 4;">
            <p class="st-num" data-imedit-id="{IMEDIT_ID:st-num:3}">04</p>
            <div class="st-title-row"><span class="st-title" data-imedit-id="{IMEDIT_ID:st-title:3}"><!-- FILL --></span></div>
            <p class="st-body" data-imedit-id="{IMEDIT_ID:st-body:3}"><!-- FILL --></p>
          </div>

          <div class="st-content below last-col" data-imedit-id="{IMEDIT_ID:st-content:5}" style="grid-column: 6;">
            <p class="st-num" data-imedit-id="{IMEDIT_ID:st-num:5}">06</p>
            <div class="st-title-row"><span class="st-title" data-imedit-id="{IMEDIT_ID:st-title:5}"><!-- FILL --></span></div>
            <p class="st-body" data-imedit-id="{IMEDIT_ID:st-body:5}"><!-- FILL --></p>
          </div>

        </div>
      </div>
    </div>
  </div>
  <p class="source-line"><!-- FILL: or omit --></p>
  <p class="page-number"><!-- FILL: NN / TT --></p>
</section>
```

---

## Layout 7 — Segment divider (replaces Section divider)

**When to use:** Section breaks between major proposal chapters. Full-bleed photo-background treatment (default) or solid-colour variant. Alias: `section-divider` still works for back-compat.

**Variants:** `:photo` (default — full-bleed image placeholder + dark overlay + Palatino title bottom-left), `:solid` (light green-grey solid + big serif number + dark title)

```html
<!-- Photo variant (default) -->
<section class="slide segment-divider" data-slide="N">
  <span class="logo">IM_</span>
  <!-- Full-bleed photo background -->
  <div class="sdiv-photo-bg">
    <div class="photo-placeholder-divider"></div>
  </div>
  <!-- Dark gradient overlay -->
  <div class="sdiv-overlay"></div>
  <!-- Title block bottom-left -->
  <div class="sdiv-content">
    <span class="sdiv-section-num" data-imedit-id="{IMEDIT_ID:sdiv-section-num:0}"><!-- FILL: e.g. 01 --></span>
    <p class="sdiv-eyebrow" data-imedit-id="{IMEDIT_ID:sdiv-eyebrow:0}"><!-- FILL: e.g. "Section 01" --></p>
    <h2 class="sdiv-title" data-imedit-id="{IMEDIT_ID:sdiv-title:0}"><!-- FILL: section name in Palatino; use <em> for italic --></h2>
  </div>
  <p class="page-number" style="color:rgba(255,255,255,0.4);"><!-- FILL: NN / TT --></p>
</section>

<!-- Solid variant: add class variant-solid -->
<!-- <section class="slide segment-divider variant-solid" data-slide="N"> -->
<!-- Same inner structure; colours flip automatically via CSS. -->
<!-- In variant-solid: sdiv-title becomes dark (#1F1F23), sdiv-section-num becomes blue-green -->
```

**Notes:** The old `.slide-divider` two-tone split layout is deprecated. Use `segment-divider` for all new and updated decks. The `.section-divider` class is a CSS alias for back-compat. The large serif number in `.sdiv-section-num` renders at 80px Palatino — use 2-character strings like `01`, `02` etc. Photo placeholder fills the full slide and is styled via `.sdiv-photo-bg .photo-placeholder-divider`.

---

## Layout 8 — Purpose / photo-left

**When to use:** Workshop objectives, proposal opener "why we're here", about-this-project slides. 35% egg-tone left (image placeholder), 65% near-white right with icon-boxes and Palatino heading.

```html
<section class="slide slide-purpose" data-slide="N">
  <div class="purpose-left">
    <div class="photo-placeholder">
      <!-- FILL: image or leave as placeholder box -->
    </div>
    <p class="photo-caption" data-imedit-id="{IMEDIT_ID:photo-caption:0}"><!-- FILL: caption or "Image placeholder" --></p>
  </div>
  <div class="purpose-right">
    <div class="logo">IM_</div>
    <p class="slide-eyebrow" data-imedit-id="{IMEDIT_ID:slide-eyebrow:0}"><!-- FILL: EYEBROW LABEL, e.g. "ABOUT THIS PROJECT" --></p>
    <h2 class="purpose-heading" data-imedit-id="{IMEDIT_ID:purpose-heading:0}"><!-- FILL: main heading in Palatino, 2–4 words --></h2>
    <div class="purpose-boxes">
      <!-- FILL: repeat purpose-box for each objective (2–3 typical) -->
      <!-- NOTE: when repeating purpose-box, increment :N in data-imedit-id placeholders (e.g. :0 → :1 → :2) -->
      <div class="purpose-box">
        <div class="purpose-box-icon">
          <svg viewBox="0 0 36 36"><!-- FILL: icon --></svg>
        </div>
        <div>
          <div class="purpose-box-title" data-imedit-id="{IMEDIT_ID:purpose-box-title:0}"><p><!-- FILL: objective title --></p></div>
          <div class="purpose-box-body" data-imedit-id="{IMEDIT_ID:purpose-box-body:0}"><p><!-- FILL: 1–2 sentence description --></p></div>
        </div>
      </div>
    </div>
    <p class="page-number"><!-- FILL: NN / TT --></p>
  </div>
</section>
```

---

## Layout 9 — KPI dashboard

**When to use:** Slide 2 of status/update decks. 3–4 headline metrics with RAG status (Green/Amber/Red), plus supporting detail rows below.

```html
<section class="slide" data-slide="N">
  <div class="logo">IM_</div>
  <h2 class="action-title" data-imedit-id="{IMEDIT_ID:action-title:0}">
    <strong><!-- FILL: section label --></strong> | <!-- FILL: declarative action title -->
  </h2>
  <div class="content-wrap">
    <!-- Optional sub-heading (Arial bold 12pt with underline). Remove if not needed. -->
    <p class="table-label" data-imedit-id="{IMEDIT_ID:table-label:0}"><!-- FILL: e.g. "Headline metrics" — optional --></p>
    <div class="table-label-underline"></div>
    <div class="kpi-grid" style="--kpi-cols: <!-- FILL: 3 or 4 -->;">

      <!-- KPI card: add class rag-green, rag-amber, or rag-red -->
      <!-- NOTE: when repeating kpi-card, increment :N in data-imedit-id placeholders (e.g. :0 → :1 → :2) -->
      <div class="kpi-card rag-green" data-imedit-id="{IMEDIT_ID:kpi-card:0}">
        <p class="kpi-kicker" data-imedit-id="{IMEDIT_ID:kpi-kicker:0}"><!-- FILL: METRIC NAME --></p>
        <p class="kpi-value" data-imedit-id="{IMEDIT_ID:kpi-value:0}"><!-- FILL: value, e.g. "87%" or "NOK 4.4m" --></p>
        <p class="kpi-label" data-imedit-id="{IMEDIT_ID:kpi-label:0}"><!-- FILL: 1-line context --></p>
      </div>
      <!-- FILL: repeat kpi-card × (total cols - 1) -->

      <!-- Detail rows below the metric cards -->
      <!-- NOTE: when repeating kpi-detail-item, increment :N in data-imedit-id placeholders -->
      <div class="kpi-detail-row">
        <div class="kpi-detail-item" data-imedit-id="{IMEDIT_ID:kpi-detail-item:0}">
          <p class="kpi-detail-label" data-imedit-id="{IMEDIT_ID:kpi-detail-label:0}" style="margin:0"><!-- FILL: item label --></p>
          <p data-imedit-id="{IMEDIT_ID:kpi-detail-value:0}" style="margin:0"><!-- FILL: detail text --></p>
        </div>
        <!-- FILL: repeat kpi-detail-item as needed -->
      </div>

    </div>
  </div>
  <p class="source-line"><!-- FILL: or omit --></p>
  <p class="page-number"><!-- FILL: NN / TT --></p>
</section>
```

---

## Layout 10 — Comparison table

**When to use:** Benchmarks, feature comparisons, competitive landscape. Dark header row, alternating stripes. Optional colour-coded cells.

```html
<section class="slide" data-slide="N">
  <div class="logo">IM_</div>
  <h2 class="action-title" data-imedit-id="{IMEDIT_ID:action-title:0}">
    <strong><!-- FILL: section label --></strong> | <!-- FILL: declarative action title -->
  </h2>
  <div class="content-wrap">
    <div class="im-table-wrap">
      <table class="im-table">
        <thead>
          <tr>
            <!-- NOTE: th N counts left-to-right across the header row starting at 0 -->
            <th data-imedit-id="{IMEDIT_ID:th:0}"><!-- FILL: row header label, e.g. "Dimension" --></th>
            <th data-imedit-id="{IMEDIT_ID:th:1}"><!-- FILL: column 1 header --></th>
            <th data-imedit-id="{IMEDIT_ID:th:2}"><!-- FILL: column 2 header --></th>
            <th data-imedit-id="{IMEDIT_ID:th:3}"><!-- FILL: column 3 header --></th>
            <!-- FILL: add more <th> columns as needed, incrementing :N -->
          </tr>
        </thead>
        <tbody>
          <!-- NOTE: td N counts row-major (left-to-right, top-to-bottom) starting at 0 -->
          <tr>
            <td data-imedit-id="{IMEDIT_ID:td:0}"><strong><!-- FILL: row label --></strong></td>
            <td data-imedit-id="{IMEDIT_ID:td:1}"><!-- FILL: cell content --></td>
            <td data-imedit-id="{IMEDIT_ID:td:2}" class="cell-green"><!-- FILL: use cell-green/amber/red/highlight for coded cells --></td>
            <td data-imedit-id="{IMEDIT_ID:td:3}"><!-- FILL --></td>
          </tr>
          <!-- FILL: repeat <tr> for each row, continuing td N sequentially -->
        </tbody>
      </table>
    </div>
  </div>
  <p class="source-line"><!-- FILL: or omit --></p>
  <p class="page-number"><!-- FILL: NN / TT --></p>
</section>
```

---

## Layout 11 — Pull quote / closing

**When to use:** Key insight or executive provocation (standard variant). "Thank you" closing slide (use `thank-you-slide` class on the `<section>` — gives it a near-black background).

```html
<!-- Standard pull quote -->
<section class="slide" data-slide="N">
  <div class="logo">IM_</div>
  <div class="content-wrap">
    <div class="pull-quote-slide">
      <span class="pull-quote-mark">"</span>
      <p class="pull-quote-text" data-imedit-id="{IMEDIT_ID:pull-quote-text:0}"><!-- FILL: the key statement or provocation, 1–3 lines --></p>
      <p class="pull-quote-attribution" data-imedit-id="{IMEDIT_ID:pull-quote-attribution:0}"><!-- FILL: attribution, e.g. "— Partner name, Implement" or omit --></p>
    </div>
  </div>
  <p class="page-number"><!-- FILL: NN / TT --></p>
</section>

<!-- Thank you / closing variant -->
<section class="slide thank-you-slide" data-slide="N">
  <div class="logo">IM_</div>
  <div class="content-wrap">
    <div class="pull-quote-slide">
      <p class="pull-quote-text" data-imedit-id="{IMEDIT_ID:pull-quote-text:0}"><!-- FILL: "Thank you." or "We look forward to the conversation." --></p>
      <p class="pull-quote-attribution" data-imedit-id="{IMEDIT_ID:pull-quote-attribution:0}">
        <strong><!-- FILL: Partner name --></strong><br>
        <!-- FILL: email --><br>
        <!-- FILL: phone -->
      </p>
    </div>
  </div>
</section>
```

---

## Layout 12 — Full-width body text

**When to use:** Personal intro/thank-you note (slide 2 of proposals), executive summary of key questions, next steps, appendix, SCR text, instructions.

```html
<section class="slide" data-slide="N">
  <div class="logo">IM_</div>
  <!-- FILL: for slides with action titles (executive summary, next steps, appendix) -->
  <h2 class="action-title" data-imedit-id="{IMEDIT_ID:action-title:0}">
    <strong><!-- FILL: section label --></strong> | <!-- FILL: declarative action title, or omit this entire h2 for intro/personal note slides -->
  </h2>
  <div class="content-wrap">
    <div class="full-body-content">
      <!-- Option A: paragraphs -->
      <!-- NOTE: body-text N counts across paragraphs starting at 0 -->
      <p class="body-text" data-imedit-id="{IMEDIT_ID:body:0}"><!-- FILL: paragraph 1 --></p>
      <p class="body-text" data-imedit-id="{IMEDIT_ID:body:1}"><!-- FILL: paragraph 2 --></p>

      <!-- Option B: bullet list -->
      <!-- NOTE: bullet N counts across top-level li starting at 0; sub-bullet N counts within im-sub -->
      <ul class="im-bullets">
        <li data-imedit-id="{IMEDIT_ID:bullet:0}"><strong><!-- FILL: bold term --></strong> <!-- FILL: detail --></li>
        <li data-imedit-id="{IMEDIT_ID:bullet:1}"><!-- FILL --></li>
        <li data-imedit-id="{IMEDIT_ID:bullet:2}"><!-- FILL -->
          <!-- Optional sub-bullets -->
          <ul class="im-sub">
            <li data-imedit-id="{IMEDIT_ID:sub-bullet:0}"><!-- FILL --></li>
          </ul>
        </li>
      </ul>

      <!-- Option C: labelled sub-sections (for executive summary) -->
      <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 4px;">
        <div>
          <p class="table-label" style="font-size: 15px; margin-bottom: 4px;"><!-- FILL: sub-section label --></p>
          <p class="body-text" style="font-size: 15.6px;"><!-- FILL: content --></p>
        </div>
      </div>
    </div>
  </div>
  <p class="source-line"><!-- FILL: or omit --></p>
  <p class="page-number"><!-- FILL: NN / TT --></p>
</section>
```

---

---

## Layout 13 — Photo-left-content

**When to use:** Proposal opener letter (`:letter`), contents/agenda page (`:contents`), or workshop objectives (`:purpose`). Replaces the old `purpose-photo-left` layout. 35/65 split with photo-placeholder left and content right.

**Variants:** `:purpose` (icon-boxes for objectives — matches old purpose-photo-left), `:letter` (Palatino body text + partner signature), `:contents` (numbered section list)

```html
<!-- Base: use class variant-purpose, variant-letter, or variant-contents -->
<section class="slide photo-left-content variant-purpose" data-slide="N">
  <div class="plc-left">
    <div class="photo-placeholder">Image placeholder</div>
  </div>
  <div class="plc-right">
    <div class="logo">IM_</div>
    <p class="slide-eyebrow" data-imedit-id="{IMEDIT_ID:slide-eyebrow:0}"><!-- FILL: EYEBROW LABEL, e.g. "ABOUT THIS PROJECT" --></p>
    <h2 class="plc-heading" data-imedit-id="{IMEDIT_ID:plc-heading:0}"><!-- FILL: main heading in Palatino, 2–4 words --></h2>

    <!-- Purpose variant: icon-boxes for objectives -->
    <div class="purpose-boxes">
      <!-- NOTE: increment :N in data-imedit-id for each repeated purpose-box -->
      <div class="purpose-box">
        <div class="purpose-box-icon">
          <svg viewBox="0 0 36 36" stroke="#67817F" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
            <!-- FILL: icon paths -->
          </svg>
        </div>
        <div>
          <div class="purpose-box-title" data-imedit-id="{IMEDIT_ID:purpose-box-title:0}"><p><!-- FILL: objective title --></p></div>
          <div class="purpose-box-body" data-imedit-id="{IMEDIT_ID:purpose-box-body:0}"><p><!-- FILL: 1–2 sentence description --></p></div>
        </div>
      </div>
      <!-- repeat purpose-box × 1-2 more (use :1, :2 for imedit ids) -->
    </div>

    <p class="page-number"><!-- FILL: NN / TT --></p>
  </div>
</section>
```

```html
<!-- Letter variant -->
<section class="slide photo-left-content variant-letter" data-slide="N">
  <div class="plc-left">
    <div class="photo-placeholder">Image placeholder</div>
  </div>
  <div class="plc-right">
    <div class="logo">IM_</div>
    <p class="slide-eyebrow" data-imedit-id="{IMEDIT_ID:slide-eyebrow:0}"><!-- FILL: e.g. "DEAR [CLIENT NAME]," --></p>
    <div class="plc-letter-body" data-imedit-id="{IMEDIT_ID:letter-body:0}">
      <p><!-- FILL: opening paragraph of the partner letter --></p>
      <p><!-- FILL: second paragraph — state what the proposal covers --></p>
      <p><!-- FILL: closing sentence, e.g. "We look forward to the conversation." --></p>
    </div>
    <div class="plc-signature">
      <div class="plc-signature-avatar"></div>
      <div>
        <p class="plc-signature-name" data-imedit-id="{IMEDIT_ID:signature-name:0}"><!-- FILL: Partner name --></p>
        <p class="plc-signature-role" data-imedit-id="{IMEDIT_ID:signature-role:0}"><!-- FILL: Partner role · Implement Consulting Group --></p>
      </div>
    </div>
    <p class="page-number"><!-- FILL: NN / TT --></p>
  </div>
</section>
```

```html
<!-- Contents / agenda variant -->
<section class="slide photo-left-content variant-contents" data-slide="N">
  <div class="plc-left">
    <div class="photo-placeholder">Image placeholder</div>
  </div>
  <div class="plc-right">
    <div class="logo">IM_</div>
    <p class="slide-eyebrow" data-imedit-id="{IMEDIT_ID:slide-eyebrow:0}"><!-- FILL: e.g. "CONTENTS" --></p>
    <h2 class="plc-heading" data-imedit-id="{IMEDIT_ID:plc-heading:0}"><!-- FILL: e.g. "Our proposal" or omit --></h2>
    <div class="plc-contents-list">
      <!-- NOTE: increment :N for each repeated plc-contents-item -->
      <!-- Add class active-section to highlight the current section -->
      <div class="plc-contents-item" data-imedit-id="{IMEDIT_ID:contents-item:0}">
        <span class="plc-contents-num">01</span>
        <span class="plc-contents-label" data-imedit-id="{IMEDIT_ID:contents-label:0}"><!-- FILL: section name --></span>
      </div>
      <div class="plc-contents-item" data-imedit-id="{IMEDIT_ID:contents-item:1}">
        <span class="plc-contents-num">02</span>
        <span class="plc-contents-label" data-imedit-id="{IMEDIT_ID:contents-label:1}"><!-- FILL --></span>
      </div>
      <div class="plc-contents-item" data-imedit-id="{IMEDIT_ID:contents-item:2}">
        <span class="plc-contents-num">03</span>
        <span class="plc-contents-label" data-imedit-id="{IMEDIT_ID:contents-label:2}"><!-- FILL --></span>
      </div>
      <div class="plc-contents-item" data-imedit-id="{IMEDIT_ID:contents-item:3}">
        <span class="plc-contents-num">04</span>
        <span class="plc-contents-label" data-imedit-id="{IMEDIT_ID:contents-label:3}"><!-- FILL --></span>
      </div>
      <div class="plc-contents-item" data-imedit-id="{IMEDIT_ID:contents-item:4}">
        <span class="plc-contents-num">05</span>
        <span class="plc-contents-label" data-imedit-id="{IMEDIT_ID:contents-label:4}"><!-- FILL --></span>
      </div>
    </div>
    <p class="page-number"><!-- FILL: NN / TT --></p>
  </div>
</section>
```

**Notes:** Default (no variant class) behaves like `:purpose`. The `:letter` variant sets `.plc-right { background: white }` for a cleaner letter feel. For the `:contents` variant, add class `active-section` to the `.plc-contents-item` that represents the current section (useful on repeated contents slides within a proposal). The old `slide-purpose` / `purpose-photo-left` snippet still works — it is a CSS alias.

---

## Layout 14 — Photo card grid

**When to use:** Credentials, project references, expert panels. Configurable 2/3/4 column density. Each card: photo placeholder top + bold title + 2-line description.

```html
<section class="slide" data-slide="N">
  <div class="logo">IM_</div>
  <h2 class="action-title" data-imedit-id="{IMEDIT_ID:action-title:0}">
    <strong><!-- FILL: section label --></strong> | <!-- FILL: declarative action title -->
  </h2>
  <div class="content-wrap">
    <div class="photo-card-grid">
      <!-- Set --pcg-cols to 2, 3, or 4 depending on content density -->
      <div class="photo-card-grid-inner" style="--pcg-cols: 3;">
        <!-- NOTE: increment :N in data-imedit-id for each repeated photo-card -->
        <div class="photo-card" data-imedit-id="{IMEDIT_ID:photo-card:0}">
          <div class="photo-card-img">Image placeholder</div>
          <p class="photo-card-title" data-imedit-id="{IMEDIT_ID:photo-card-title:0}"><!-- FILL: bold title — client or engagement name --></p>
          <p class="photo-card-desc" data-imedit-id="{IMEDIT_ID:photo-card-desc:0}"><!-- FILL: 1–2 line description; use <strong> for key detail --></p>
        </div>
        <div class="photo-card" data-imedit-id="{IMEDIT_ID:photo-card:1}">
          <div class="photo-card-img">Image placeholder</div>
          <p class="photo-card-title" data-imedit-id="{IMEDIT_ID:photo-card-title:1}"><!-- FILL --></p>
          <p class="photo-card-desc" data-imedit-id="{IMEDIT_ID:photo-card-desc:1}"><!-- FILL --></p>
        </div>
        <div class="photo-card" data-imedit-id="{IMEDIT_ID:photo-card:2}">
          <div class="photo-card-img">Image placeholder</div>
          <p class="photo-card-title" data-imedit-id="{IMEDIT_ID:photo-card-title:2}"><!-- FILL --></p>
          <p class="photo-card-desc" data-imedit-id="{IMEDIT_ID:photo-card-desc:2}"><!-- FILL --></p>
        </div>
        <!-- FILL: repeat photo-card as needed; typical: 3 per row, 1–2 rows -->
      </div>
    </div>
  </div>
  <p class="source-line"><!-- FILL: or omit --></p>
  <p class="page-number"><!-- FILL: NN / TT --></p>
</section>
```

**Notes:** For 4-column dense grids (e.g. 8 references), set `--pcg-cols: 4`. For 2-column large-card grids (e.g. 2 flagship credentials), set `--pcg-cols: 2` and the cards naturally expand. The `.photo-card-img` uses a 4:3 `aspect-ratio` so card heights stay consistent within a row.

---

## Layout 15 — Ring diagram

**When to use:** Co-creation model, collaboration structure, one-project-team concept. Two overlapping circles (outlined left, filled right) with bullet lists on each side. Optional bottom icon row.

```html
<section class="slide" data-slide="N">
  <div class="logo">IM_</div>
  <h2 class="action-title" data-imedit-id="{IMEDIT_ID:action-title:0}">
    <strong><!-- FILL: section label --></strong> | <!-- FILL: declarative action title -->
  </h2>
  <div class="content-wrap">
    <div class="ring-diagram">
      <div class="ring-diagram-inner">

        <!-- Left bullets (client side) -->
        <div class="ring-bullets-left">
          <p class="ring-left-label" data-imedit-id="{IMEDIT_ID:ring-left-label:0}"><!-- FILL: left side label, e.g. "[CLIENT]" --></p>
          <!-- NOTE: increment :N for each ring-bullet -->
          <p class="ring-bullet" data-imedit-id="{IMEDIT_ID:ring-bullet-left:0}"><!-- FILL: left side bullet --></p>
          <p class="ring-bullet" data-imedit-id="{IMEDIT_ID:ring-bullet-left:1}"><!-- FILL --></p>
          <p class="ring-bullet" data-imedit-id="{IMEDIT_ID:ring-bullet-left:2}"><!-- FILL --></p>
          <p class="ring-bullet" data-imedit-id="{IMEDIT_ID:ring-bullet-left:3}"><!-- FILL --></p>
        </div>

        <!-- Overlapping circles -->
        <div class="ring-diagram-circles">
          <div class="ring-circle-left"></div>
          <div class="ring-circle-right"></div>
          <div class="ring-center">
            <p class="ring-center-label" data-imedit-id="{IMEDIT_ID:ring-center-label:0}"><!-- FILL: center overlap label, e.g. "One project team" --></p>
          </div>
        </div>

        <!-- Right bullets (Implement side) -->
        <div class="ring-bullets-right">
          <p class="ring-right-label" data-imedit-id="{IMEDIT_ID:ring-right-label:0}"><!-- FILL: right side label, e.g. "IMPLEMENT" --></p>
          <p class="ring-bullet" data-imedit-id="{IMEDIT_ID:ring-bullet-right:0}"><!-- FILL: right side bullet --></p>
          <p class="ring-bullet" data-imedit-id="{IMEDIT_ID:ring-bullet-right:1}"><!-- FILL --></p>
          <p class="ring-bullet" data-imedit-id="{IMEDIT_ID:ring-bullet-right:2}"><!-- FILL --></p>
          <p class="ring-bullet" data-imedit-id="{IMEDIT_ID:ring-bullet-right:3}"><!-- FILL --></p>
        </div>

      </div>

      <!-- Optional bottom icon row — omit entire .ring-icons block if not needed -->
      <div class="ring-icons">
        <div class="ring-icons-side">
          <div class="ring-icon-item" data-imedit-id="{IMEDIT_ID:ring-icon:0}">
            <div class="ring-icon-circle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><!-- FILL: icon paths --></svg>
            </div>
            <span class="ring-icon-label" data-imedit-id="{IMEDIT_ID:ring-icon-label:0}"><!-- FILL: icon label --></span>
          </div>
          <!-- repeat ring-icon-item × 1-3 more -->
        </div>
        <div></div><!-- center spacer (circles column) -->
        <div class="ring-icons-side">
          <div class="ring-icon-item" data-imedit-id="{IMEDIT_ID:ring-icon:4}">
            <div class="ring-icon-circle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><!-- FILL --></svg>
            </div>
            <span class="ring-icon-label" data-imedit-id="{IMEDIT_ID:ring-icon-label:4}"><!-- FILL --></span>
          </div>
          <!-- repeat ring-icon-item × 1-3 more -->
        </div>
      </div>

    </div>
  </div>
  <p class="source-line"><!-- FILL: or omit --></p>
  <p class="page-number"><!-- FILL: NN / TT --></p>
</section>
```

**Notes:** The left circle is outlined only (`border: 2.5px solid #B9C7C2; background: transparent`) — representing the client. The right circle is filled `#67817F` — representing Implement. The overlap center has a white Palatino italic label. For the bottom icon row, keep left icons parallel to left bullets and right icons parallel to right bullets.

---

## Layout 16 — Team and investment

**When to use:** Proposal team + fee slide. 2/1 split: team photo grid left (optionally split into Core team + SMEs subsections) and Investment panel right. Optional "Updated price" callout tag.

```html
<section class="slide" data-slide="N">
  <div class="logo">IM_</div>
  <h2 class="action-title" data-imedit-id="{IMEDIT_ID:action-title:0}">
    <strong><!-- FILL: section label --></strong> | <!-- FILL: declarative action title -->
  </h2>
  <div class="content-wrap">
    <div class="team-and-investment">

      <!-- Left: team photo grid -->
      <div class="team-grid-wrap">
        <!-- Optional subsection label — omit if only one group -->
        <p class="team-section-label" data-imedit-id="{IMEDIT_ID:team-section-label:0}">Core team</p>
        <div class="team-grid">
          <!-- NOTE: increment :N in data-imedit-id for each repeated team-card -->
          <div class="team-card" data-imedit-id="{IMEDIT_ID:team-card:0}">
            <div class="team-card-photo">Image placeholder</div>
            <p class="team-card-name" data-imedit-id="{IMEDIT_ID:team-card-name:0}"><!-- FILL: Name --></p>
            <p class="team-card-role" data-imedit-id="{IMEDIT_ID:team-card-role:0}"><!-- FILL: Role / title --></p>
            <p class="team-card-email" data-imedit-id="{IMEDIT_ID:team-card-email:0}"><!-- FILL: email@implement.no --></p>
          </div>
          <div class="team-card" data-imedit-id="{IMEDIT_ID:team-card:1}">
            <div class="team-card-photo">Image placeholder</div>
            <p class="team-card-name" data-imedit-id="{IMEDIT_ID:team-card-name:1}"><!-- FILL --></p>
            <p class="team-card-role" data-imedit-id="{IMEDIT_ID:team-card-role:1}"><!-- FILL --></p>
            <p class="team-card-email" data-imedit-id="{IMEDIT_ID:team-card-email:1}"><!-- FILL --></p>
          </div>
          <div class="team-card" data-imedit-id="{IMEDIT_ID:team-card:2}">
            <div class="team-card-photo">Image placeholder</div>
            <p class="team-card-name" data-imedit-id="{IMEDIT_ID:team-card-name:2}"><!-- FILL --></p>
            <p class="team-card-role" data-imedit-id="{IMEDIT_ID:team-card-role:2}"><!-- FILL --></p>
            <p class="team-card-email" data-imedit-id="{IMEDIT_ID:team-card-email:2}"><!-- FILL --></p>
          </div>
          <!-- repeat team-card × up to 3 more for a 2×3 grid (use :3, :4, :5) -->
        </div>
        <!-- Optional SMEs subsection -->
        <!-- <p class="team-section-label">Subject matter experts</p>
             <div class="team-grid"> ... more team-cards ... </div> -->
      </div>

      <!-- Right: investment panel -->
      <div class="investment-panel">
        <!-- Optional callout tag — omit if not needed -->
        <div class="investment-callout" data-imedit-id="{IMEDIT_ID:investment-callout:0}"><!-- FILL: e.g. "Updated price" — or remove this element --></div>
        <h3 class="investment-heading" data-imedit-id="{IMEDIT_ID:investment-heading:0}">Investment</h3>
        <p class="investment-body" data-imedit-id="{IMEDIT_ID:investment-body:0}"><!-- FILL: 1–2 sentence fee summary, e.g. "Our estimated fee for this engagement is..." --></p>
        <ul class="investment-bullets">
          <li data-imedit-id="{IMEDIT_ID:investment-bullet:0}"><strong><!-- FILL: category, e.g. "Fee" --></strong> <!-- FILL: amount --></li>
          <li data-imedit-id="{IMEDIT_ID:investment-bullet:1}"><strong><!-- FILL: "Expenses" --></strong> <!-- FILL: --></li>
          <li data-imedit-id="{IMEDIT_ID:investment-bullet:2}"><strong><!-- FILL: "Terms" --></strong> <!-- FILL: --></li>
          <!-- add more as needed -->
        </ul>
      </div>

    </div>
  </div>
  <p class="source-line"><!-- FILL: or omit --></p>
  <p class="page-number"><!-- FILL: NN / TT --></p>
</section>
```

**Notes:** Default team grid is 3 columns (matching CSS `.team-grid { grid-template-columns: repeat(3, 1fr) }`). For a 2×2 grid (4 people), override with `style="grid-template-columns: 1fr 1fr"` on `.team-grid`. The `.investment-callout` element is absolutely positioned and should be removed when there is no callout.

---

## Layout 17 — Person bio

**When to use:** Individual team member CV slides. 30/70 split: large photo left with name and contact info; CV content right with Palatino name, role, and two-column sections (Experience, Education, Selected projects, Areas of expertise).

```html
<section class="slide person-bio" data-slide="N">
  <!-- Left: photo column -->
  <div class="person-photo-col">
    <div class="person-photo-placeholder">Image placeholder</div>
    <p class="person-photo-name" data-imedit-id="{IMEDIT_ID:person-photo-name:0}"><!-- FILL: Full name --></p>
    <p class="person-photo-contact" data-imedit-id="{IMEDIT_ID:person-photo-contact:0}">
      <!-- FILL: email --><br><!-- FILL: phone -->
    </p>
  </div>
  <!-- Right: CV content -->
  <div class="person-content-col">
    <div class="logo">IM_</div>
    <h2 class="person-name-large" data-imedit-id="{IMEDIT_ID:person-name:0}"><!-- FILL: Full name in Palatino --></h2>
    <p class="person-role" data-imedit-id="{IMEDIT_ID:person-role:0}"><!-- FILL: Role / title --></p>
    <div class="person-sections-grid">

      <!-- Experience -->
      <div class="person-section">
        <p class="person-section-label">Experience</p>
        <ul class="person-section-items">
          <li data-imedit-id="{IMEDIT_ID:experience:0}"><!-- FILL: 1-line engagement or role description --></li>
          <li data-imedit-id="{IMEDIT_ID:experience:1}"><!-- FILL --></li>
          <li data-imedit-id="{IMEDIT_ID:experience:2}"><!-- FILL --></li>
          <li data-imedit-id="{IMEDIT_ID:experience:3}"><!-- FILL --></li>
        </ul>
      </div>

      <!-- Education -->
      <div class="person-section">
        <p class="person-section-label">Education</p>
        <div class="person-section-body" data-imedit-id="{IMEDIT_ID:education:0}">
          <p><!-- FILL: degree, institution, year --></p>
          <p><!-- FILL: additional qualification if any --></p>
        </div>
      </div>

      <!-- Selected projects -->
      <div class="person-section">
        <p class="person-section-label">Selected projects</p>
        <ul class="person-section-items">
          <li data-imedit-id="{IMEDIT_ID:project:0}"><!-- FILL: client/project description --></li>
          <li data-imedit-id="{IMEDIT_ID:project:1}"><!-- FILL --></li>
          <li data-imedit-id="{IMEDIT_ID:project:2}"><!-- FILL --></li>
        </ul>
      </div>

      <!-- Areas of expertise -->
      <div class="person-section">
        <p class="person-section-label">Areas of expertise</p>
        <ul class="person-section-items">
          <li data-imedit-id="{IMEDIT_ID:expertise:0}"><!-- FILL: expertise area --></li>
          <li data-imedit-id="{IMEDIT_ID:expertise:1}"><!-- FILL --></li>
          <li data-imedit-id="{IMEDIT_ID:expertise:2}"><!-- FILL --></li>
          <li data-imedit-id="{IMEDIT_ID:expertise:3}"><!-- FILL --></li>
        </ul>
      </div>

    </div>
    <p class="page-number"><!-- FILL: NN / TT --></p>
  </div>
</section>
```

**Notes:** The `.person-bio` slide is a full-bleed grid (no standard action title) — the name serves as the heading. The two-column `.person-sections-grid` uses `grid-template-columns: 1fr 1fr` with items flowing left-top then right-top. For a shorter bio (fewer sections), simply omit a `.person-section` block. The right column has `position: relative` so the `.logo` and `.page-number` can be absolutely positioned inside it.

---

## Layout 18 — Quantified summary

**When to use:** Cost potential, value opportunity, or quantified initiative overview. 1/1.4 split: chart placeholder left (with sub-label and source line); numbered initiative cards right in dotted-border boxes.

```html
<section class="slide" data-slide="N">
  <div class="logo">IM_</div>
  <h2 class="action-title" data-imedit-id="{IMEDIT_ID:action-title:0}">
    <strong><!-- FILL: section label --></strong> | <!-- FILL: declarative action title -->
  </h2>
  <div class="content-wrap">
    <div class="quantified-summary">

      <!-- Left: chart placeholder -->
      <div class="qs-chart-col">
        <div class="qs-chart-placeholder">Chart placeholder</div>
        <p class="qs-chart-label" data-imedit-id="{IMEDIT_ID:qs-chart-label:0}"><!-- FILL: chart title, e.g. "Cost reduction potential (NOK m)" --></p>
        <p class="qs-chart-source" data-imedit-id="{IMEDIT_ID:qs-chart-source:0}"><!-- FILL: Source: ... --></p>
      </div>

      <!-- Right: numbered initiative cards -->
      <div class="qs-initiatives-col">

        <!-- NOTE: increment :N in data-imedit-id for each repeated qs-initiative-card -->
        <div class="qs-initiative-card" data-imedit-id="{IMEDIT_ID:qs-card:0}">
          <div class="qs-initiative-num">1</div>
          <div class="qs-initiative-content">
            <p class="qs-initiative-title" data-imedit-id="{IMEDIT_ID:qs-card-title:0}"><!-- FILL: initiative title --></p>
            <ul class="qs-initiative-bullets">
              <li data-imedit-id="{IMEDIT_ID:qs-bullet:0}"><!-- FILL: specific lever --></li>
              <li data-imedit-id="{IMEDIT_ID:qs-bullet:1}"><!-- FILL --></li>
              <li data-imedit-id="{IMEDIT_ID:qs-bullet:2}"><!-- FILL --></li>
            </ul>
          </div>
        </div>

        <div class="qs-initiative-card" data-imedit-id="{IMEDIT_ID:qs-card:1}">
          <div class="qs-initiative-num">2</div>
          <div class="qs-initiative-content">
            <p class="qs-initiative-title" data-imedit-id="{IMEDIT_ID:qs-card-title:1}"><!-- FILL --></p>
            <ul class="qs-initiative-bullets">
              <li data-imedit-id="{IMEDIT_ID:qs-bullet:3}"><!-- FILL --></li>
              <li data-imedit-id="{IMEDIT_ID:qs-bullet:4}"><!-- FILL --></li>
              <li data-imedit-id="{IMEDIT_ID:qs-bullet:5}"><!-- FILL --></li>
            </ul>
          </div>
        </div>

        <div class="qs-initiative-card" data-imedit-id="{IMEDIT_ID:qs-card:2}">
          <div class="qs-initiative-num">3</div>
          <div class="qs-initiative-content">
            <p class="qs-initiative-title" data-imedit-id="{IMEDIT_ID:qs-card-title:2}"><!-- FILL --></p>
            <ul class="qs-initiative-bullets">
              <li data-imedit-id="{IMEDIT_ID:qs-bullet:6}"><!-- FILL --></li>
              <li data-imedit-id="{IMEDIT_ID:qs-bullet:7}"><!-- FILL --></li>
              <li data-imedit-id="{IMEDIT_ID:qs-bullet:8}"><!-- FILL --></li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  </div>
  <p class="source-line"><!-- FILL: or omit --></p>
  <p class="page-number"><!-- FILL: NN / TT --></p>
</section>
```

**Notes:** The `.qs-chart-placeholder` fills the available vertical space via `flex: 1`. The dotted border on `.qs-initiative-card` uses `border: 1px dashed #B9C7C2`. The three cards use `flex: 1` to share vertical space equally — for 2 or 4 cards, simply add or remove a `.qs-initiative-card` block.

---

## Layout 19 — Vertical numbered list

**When to use:** 5 stacked criteria, considerations, principles, or phases. Each row has a numbered or lettered circle, a bold title, and 1–2 bullets. Distinct from the horizontal moves-grid.

**Variants:** `:numbered` (1–5 in filled green-grey circles), `:lettered` (A–E in same circles)

```html
<!-- Numbered variant -->
<section class="slide vertical-numbered-list variant-numbered" data-slide="N">
  <div class="logo">IM_</div>
  <h2 class="action-title" data-imedit-id="{IMEDIT_ID:action-title:0}">
    <strong><!-- FILL: section label --></strong> | <!-- FILL: declarative action title -->
  </h2>
  <!-- Optional left arc decoration — add position:relative to content-wrap, then include .vnl-decoration -->
  <div class="content-wrap" style="position: relative;">
    <!-- <div class="vnl-decoration"></div> -->
    <div class="vertical-numbered-list">

      <!-- NOTE: increment :N in data-imedit-id for each repeated vnl-row -->
      <div class="vnl-row" data-imedit-id="{IMEDIT_ID:vnl-row:0}">
        <div class="vnl-circle">1</div>
        <div class="vnl-content">
          <p class="vnl-title" data-imedit-id="{IMEDIT_ID:vnl-title:0}"><!-- FILL: criterion/phase title --></p>
          <ul class="vnl-bullets">
            <li data-imedit-id="{IMEDIT_ID:vnl-bullet:0}"><!-- FILL: supporting detail --></li>
            <li data-imedit-id="{IMEDIT_ID:vnl-bullet:1}"><!-- FILL --></li>
          </ul>
        </div>
      </div>

      <div class="vnl-row" data-imedit-id="{IMEDIT_ID:vnl-row:1}">
        <div class="vnl-circle">2</div>
        <div class="vnl-content">
          <p class="vnl-title" data-imedit-id="{IMEDIT_ID:vnl-title:1}"><!-- FILL --></p>
          <ul class="vnl-bullets">
            <li data-imedit-id="{IMEDIT_ID:vnl-bullet:2}"><!-- FILL --></li>
            <li data-imedit-id="{IMEDIT_ID:vnl-bullet:3}"><!-- FILL --></li>
          </ul>
        </div>
      </div>

      <div class="vnl-row" data-imedit-id="{IMEDIT_ID:vnl-row:2}">
        <div class="vnl-circle">3</div>
        <div class="vnl-content">
          <p class="vnl-title" data-imedit-id="{IMEDIT_ID:vnl-title:2}"><!-- FILL --></p>
          <ul class="vnl-bullets">
            <li data-imedit-id="{IMEDIT_ID:vnl-bullet:4}"><!-- FILL --></li>
            <li data-imedit-id="{IMEDIT_ID:vnl-bullet:5}"><!-- FILL --></li>
          </ul>
        </div>
      </div>

      <div class="vnl-row" data-imedit-id="{IMEDIT_ID:vnl-row:3}">
        <div class="vnl-circle">4</div>
        <div class="vnl-content">
          <p class="vnl-title" data-imedit-id="{IMEDIT_ID:vnl-title:3}"><!-- FILL --></p>
          <ul class="vnl-bullets">
            <li data-imedit-id="{IMEDIT_ID:vnl-bullet:6}"><!-- FILL --></li>
            <li data-imedit-id="{IMEDIT_ID:vnl-bullet:7}"><!-- FILL --></li>
          </ul>
        </div>
      </div>

      <div class="vnl-row" data-imedit-id="{IMEDIT_ID:vnl-row:4}">
        <div class="vnl-circle">5</div>
        <div class="vnl-content">
          <p class="vnl-title" data-imedit-id="{IMEDIT_ID:vnl-title:4}"><!-- FILL --></p>
          <ul class="vnl-bullets">
            <li data-imedit-id="{IMEDIT_ID:vnl-bullet:8}"><!-- FILL --></li>
            <li data-imedit-id="{IMEDIT_ID:vnl-bullet:9}"><!-- FILL --></li>
          </ul>
        </div>
      </div>

    </div>
  </div>
  <p class="source-line"><!-- FILL: or omit --></p>
  <p class="page-number"><!-- FILL: NN / TT --></p>
</section>

<!-- Lettered variant: change class to variant-lettered and use A-E in .vnl-circle -->
<!-- <section class="slide vertical-numbered-list variant-lettered" ...> -->
<!-- <div class="vnl-circle">A</div> ... B ... C ... D ... E -->
```

**Notes:** The `.vnl-row` elements use `flex: 1` to distribute vertical space equally across all 5 rows. For a slide with only 3 or 4 criteria, simply remove the excess `.vnl-row` blocks — remaining rows expand to fill. The optional `.vnl-decoration` (quarter-arc) is placed as a sibling of `.vertical-numbered-list` inside the `position: relative` content-wrap. To activate, uncomment the decoration line and ensure `content-wrap` has `position: relative`.

---

## Layout 20 — Gantt process

**When to use:** Week-by-week or month-by-month project plan. Month/week column headers × workstream rows. Activity bands in cells. Optional bottom legend + dashed "future phase" column at right.

```html
<section class="slide" data-slide="N">
  <div class="logo">IM_</div>
  <h2 class="action-title" data-imedit-id="{IMEDIT_ID:action-title:0}">
    <strong><!-- FILL: section label --></strong> | <!-- FILL: declarative action title -->
  </h2>
  <div class="content-wrap">
    <div class="gantt-process">

      <!-- Set --gantt-col-template to match your columns: label col + N content cols -->
      <!-- Example: 160px + 8 week columns = repeat(8, 1fr) -->
      <div class="gantt-table" style="--gantt-col-template: 160px repeat(8, 1fr);">

        <!-- Row 1: Month headers -->
        <div class="gantt-header-row">
          <div class="gantt-header-month"><!-- empty label corner --></div>
          <!-- NOTE: use colspan-like spans by repeating or merging header cells manually -->
          <!-- Adjust header cells to span the appropriate number of week columns -->
          <div class="gantt-header-month" data-imedit-id="{IMEDIT_ID:gantt-month:0}" style="grid-column: span 2;"><!-- FILL: e.g. OCT --></div>
          <div class="gantt-header-month" data-imedit-id="{IMEDIT_ID:gantt-month:1}" style="grid-column: span 2;"><!-- FILL: NOV --></div>
          <div class="gantt-header-month" data-imedit-id="{IMEDIT_ID:gantt-month:2}" style="grid-column: span 2;"><!-- FILL: DEC --></div>
          <div class="gantt-header-month" data-imedit-id="{IMEDIT_ID:gantt-month:3}" style="grid-column: span 2;"><!-- FILL: JAN --></div>
        </div>

        <!-- Row 2: Week/sub-column labels -->
        <div class="gantt-subheader-row">
          <div class="gantt-subheader-cell">Workstream</div>
          <div class="gantt-subheader-cell">W1</div><div class="gantt-subheader-cell">W2</div>
          <div class="gantt-subheader-cell">W1</div><div class="gantt-subheader-cell">W2</div>
          <div class="gantt-subheader-cell">W1</div><div class="gantt-subheader-cell">W2</div>
          <div class="gantt-subheader-cell">W1</div><div class="gantt-subheader-cell">W2</div>
        </div>

        <!-- Workstream rows -->
        <div class="gantt-workstream-rows">

          <!-- NOTE: increment :N in data-imedit-id for each workstream row -->
          <div class="gantt-workstream-row" data-imedit-id="{IMEDIT_ID:gantt-row:0}">
            <div class="gantt-workstream-label" data-imedit-id="{IMEDIT_ID:gantt-label:0}"><!-- FILL: Mobilisation --></div>
            <!-- FILL: each cell below is one column; add .gantt-band spans where activity occurs -->
            <!-- Use band-start on first cell, band-mid on intermediate, band-end on last -->
            <div class="gantt-cell"><div class="gantt-band band-start" data-imedit-id="{IMEDIT_ID:gantt-band:0}"><!-- FILL: activity label or leave empty --></div></div>
            <div class="gantt-cell"><div class="gantt-band band-end"></div></div>
            <div class="gantt-cell"></div>
            <div class="gantt-cell"></div>
            <div class="gantt-cell"></div>
            <div class="gantt-cell"></div>
            <div class="gantt-cell"></div>
            <div class="gantt-cell"></div>
          </div>

          <div class="gantt-workstream-row" data-imedit-id="{IMEDIT_ID:gantt-row:1}">
            <div class="gantt-workstream-label" data-imedit-id="{IMEDIT_ID:gantt-label:1}"><!-- FILL: Phase 1 --></div>
            <div class="gantt-cell"></div>
            <div class="gantt-cell"><div class="gantt-band band-start band-light" data-imedit-id="{IMEDIT_ID:gantt-band:1}"><!-- FILL --></div></div>
            <div class="gantt-cell"><div class="gantt-band band-mid band-light"></div></div>
            <div class="gantt-cell"><div class="gantt-band band-end band-light"></div></div>
            <div class="gantt-cell"></div>
            <div class="gantt-cell"></div>
            <div class="gantt-cell"></div>
            <div class="gantt-cell"></div>
          </div>

          <div class="gantt-workstream-row" data-imedit-id="{IMEDIT_ID:gantt-row:2}">
            <div class="gantt-workstream-label" data-imedit-id="{IMEDIT_ID:gantt-label:2}"><!-- FILL: Phase 2 --></div>
            <div class="gantt-cell"></div>
            <div class="gantt-cell"></div>
            <div class="gantt-cell"></div>
            <div class="gantt-cell"><div class="gantt-band band-start" data-imedit-id="{IMEDIT_ID:gantt-band:2}"><!-- FILL --></div></div>
            <div class="gantt-cell"><div class="gantt-band band-mid"></div></div>
            <div class="gantt-cell"><div class="gantt-band band-mid"></div></div>
            <div class="gantt-cell"><div class="gantt-band band-end"></div></div>
            <!-- Optional future phase: add class gantt-future-phase -->
            <div class="gantt-cell gantt-future-phase"></div>
          </div>

          <div class="gantt-workstream-row" data-imedit-id="{IMEDIT_ID:gantt-row:3}">
            <div class="gantt-workstream-label" data-imedit-id="{IMEDIT_ID:gantt-label:3}"><!-- FILL: Main touchpoints --></div>
            <div class="gantt-cell"><div class="gantt-milestone"></div></div>
            <div class="gantt-cell"></div>
            <div class="gantt-cell"><div class="gantt-milestone"></div></div>
            <div class="gantt-cell"></div>
            <div class="gantt-cell"><div class="gantt-milestone"></div></div>
            <div class="gantt-cell"></div>
            <div class="gantt-cell"><div class="gantt-milestone"></div></div>
            <div class="gantt-cell gantt-future-phase"></div>
          </div>

          <!-- FILL: repeat gantt-workstream-row as needed (typically 4-5 rows) -->

        </div>

      </div>

      <!-- Optional legend row -->
      <div class="gantt-legend">
        <div class="gantt-legend-item">
          <div class="gantt-legend-swatch"></div>
          <span data-imedit-id="{IMEDIT_ID:gantt-legend:0}"><!-- FILL: e.g. "Core workstream" --></span>
        </div>
        <div class="gantt-legend-item">
          <div class="gantt-legend-swatch swatch-light"></div>
          <span data-imedit-id="{IMEDIT_ID:gantt-legend:1}"><!-- FILL: e.g. "Supporting workstream" --></span>
        </div>
        <div class="gantt-legend-item">
          <div class="gantt-legend-diamond"></div>
          <span data-imedit-id="{IMEDIT_ID:gantt-legend:2}"><!-- FILL: e.g. "Key milestone / touchpoint" --></span>
        </div>
      </div>

    </div>
  </div>
  <p class="source-line"><!-- FILL: or omit --></p>
  <p class="page-number"><!-- FILL: NN / TT --></p>
</section>
```

**Notes:** The `--gantt-col-template` CSS variable controls the grid columns for all four gantt sub-rows — set once on `.gantt-table` and it applies everywhere. For month-span headers, use `style="grid-column: span N"` on `.gantt-header-month` cells. The `.gantt-band` chevron shape uses `clip-path: polygon(...)` — `band-start` has the left side flush, `band-end` has the right side flush, `band-mid` has both sides angled. For a "future phase" dashed column, add class `gantt-future-phase` to the relevant `.gantt-cell` elements in each row AND to the matching label with `future-label`. The legend is optional; omit the `.gantt-legend` div entirely if the slide has a source line.

---

## Layout 4 variants — Two-panel variant slots

**When to use (SCR):** Situation-Complication-Resolution framing. Left panel = situation/context; right panel = key questions or objectives with numbered green circles. Optional "FOR DISCUSSION" tag top-right.

```html
<!-- Two-panel:scr variant -->
<section class="slide two-panel variant-scr" data-slide="N">
  <div class="logo">IM_</div>
  <h2 class="action-title" data-imedit-id="{IMEDIT_ID:action-title:0}">
    <strong><!-- FILL: section label --></strong> | <!-- FILL: declarative action title -->
  </h2>
  <!-- Optional FOR DISCUSSION tag -->
  <div class="scr-discussion-tag" data-imedit-id="{IMEDIT_ID:scr-tag:0}">For discussion</div>
  <div class="content-wrap">
    <div class="gov-layout">

      <!-- Left: situation / context -->
      <div class="gov-side">
        <p class="table-label" data-imedit-id="{IMEDIT_ID:table-label:0}"><!-- FILL: e.g. "Situation" or "Background" --></p>
        <div class="table-label-underline"></div>
        <div class="gov-panel left-panel">
          <ul class="gov-bullets">
            <li data-imedit-id="{IMEDIT_ID:bullet:0}"><!-- FILL: context point --></li>
            <li data-imedit-id="{IMEDIT_ID:bullet:1}"><!-- FILL --></li>
            <li data-imedit-id="{IMEDIT_ID:bullet:2}"><!-- FILL --></li>
          </ul>
        </div>
      </div>

      <!-- Chevron arrow between panels -->
      <div class="scr-arrow" aria-hidden="true"></div>

      <!-- Right: key questions or objectives -->
      <div class="gov-side">
        <p class="table-label" data-imedit-id="{IMEDIT_ID:table-label:1}"><!-- FILL: e.g. "Key questions" --></p>
        <div class="table-label-underline"></div>
        <div class="gov-panel right-panel">
          <div class="gov-blocks">
            <!-- FILL: each block uses a scr-numbered-circle before the text -->
            <div class="gov-block">
              <p class="gov-block-label" data-imedit-id="{IMEDIT_ID:gov-block-label:0}">
                <span class="scr-numbered-circle">1</span><!-- FILL: question or objective title -->
              </p>
              <ul class="gov-bullets">
                <li data-imedit-id="{IMEDIT_ID:bullet:3}"><!-- FILL --></li>
              </ul>
            </div>
            <div class="gov-block">
              <p class="gov-block-label" data-imedit-id="{IMEDIT_ID:gov-block-label:1}">
                <span class="scr-numbered-circle">2</span><!-- FILL --></p>
              <ul class="gov-bullets">
                <li data-imedit-id="{IMEDIT_ID:bullet:4}"><!-- FILL --></li>
              </ul>
            </div>
            <div class="gov-block">
              <p class="gov-block-label" data-imedit-id="{IMEDIT_ID:gov-block-label:2}">
                <span class="scr-numbered-circle">3</span><!-- FILL --></p>
              <ul class="gov-bullets">
                <li data-imedit-id="{IMEDIT_ID:bullet:5}"><!-- FILL --></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
  <p class="source-line"><!-- FILL: or omit --></p>
  <p class="page-number"><!-- FILL: NN / TT --></p>
</section>
```

**Notes for SCR variant:** The `.scr-arrow` is absolutely positioned between the two `.gov-side` panels using `position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%)` — it requires `position: relative` on `.gov-layout`. The `.scr-discussion-tag` is absolutely positioned top-right relative to `.content-wrap`. Omit both elements if not needed. The `.scr-numbered-circle` sits inline before the label text.

---

**When to use (header-band):** Two parallel content panels sharing a single dark header band across the top — creates a table-like visual structure for methodology or framework slides.

```html
<!-- Two-panel:header-band variant -->
<section class="slide two-panel variant-header-band" data-slide="N">
  <div class="logo">IM_</div>
  <h2 class="action-title" data-imedit-id="{IMEDIT_ID:action-title:0}">
    <strong><!-- FILL: section label --></strong> | <!-- FILL: declarative action title -->
  </h2>
  <div class="content-wrap">
    <!-- Shared header band spanning both panels -->
    <div class="thb-header-band">
      <span class="thb-header-band-title" data-imedit-id="{IMEDIT_ID:thb-title:0}"><!-- FILL: left column heading --></span>
      <span class="thb-header-band-sub" data-imedit-id="{IMEDIT_ID:thb-sub:0}" style="margin-left:auto"><!-- FILL: right column heading --></span>
    </div>
    <div class="gov-layout" style="flex:1; margin-top:0;">

      <!-- Left panel -->
      <div class="gov-side">
        <div class="gov-panel left-panel">
          <div class="gov-blocks">
            <div class="gov-block">
              <p class="gov-block-label" data-imedit-id="{IMEDIT_ID:gov-block-label:0}"><!-- FILL: sub-heading --></p>
              <ul class="gov-bullets">
                <li data-imedit-id="{IMEDIT_ID:bullet:0}"><!-- FILL --></li>
                <li data-imedit-id="{IMEDIT_ID:bullet:1}"><!-- FILL --></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Right panel -->
      <div class="gov-side">
        <div class="gov-panel right-panel">
          <div class="gov-blocks">
            <div class="gov-block">
              <p class="gov-block-label" data-imedit-id="{IMEDIT_ID:gov-block-label:1}"><!-- FILL: sub-heading --></p>
              <ul class="gov-bullets">
                <li data-imedit-id="{IMEDIT_ID:bullet:2}"><!-- FILL --></li>
                <li data-imedit-id="{IMEDIT_ID:bullet:3}"><!-- FILL --></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
  <p class="source-line"><!-- FILL: or omit --></p>
  <p class="page-number"><!-- FILL: NN / TT --></p>
</section>
```

---

**When to use (about-firm):** "About Implement" slide at the end of a proposal. Dark left panel with white title + firm description + chart area; white right with 4 numbered Palatino "We are..." principle blocks.

```html
<!-- Two-panel:about-firm variant -->
<section class="slide two-panel variant-about-firm" data-slide="N">
  <div class="logo" style="color: rgba(255,255,255,0.55);">IM_</div>
  <h2 class="action-title" data-imedit-id="{IMEDIT_ID:action-title:0}">
    <strong><!-- FILL: section label --></strong> | <!-- FILL: declarative action title -->
  </h2>
  <div class="content-wrap" style="flex-direction:row; gap:0; padding:0; margin:0;">

    <!-- Left dark panel -->
    <div class="about-left">
      <h3 class="about-left-title" data-imedit-id="{IMEDIT_ID:about-title:0}"><!-- FILL: e.g. "We are Implement Consulting Group" --></h3>
      <p class="about-left-body" data-imedit-id="{IMEDIT_ID:about-body:0}"><!-- FILL: 2–3 sentence firm description --></p>
      <div class="about-chart-slot">Chart placeholder</div>
    </div>

    <!-- Right white panel -->
    <div class="about-right">
      <!-- FILL: 4 principle blocks (We are... statements) -->
      <!-- NOTE: increment :N in data-imedit-id for each principle -->
      <div class="about-principle">
        <span class="about-principle-num" data-imedit-id="{IMEDIT_ID:about-num:0}">1</span>
        <p class="about-principle-text" data-imedit-id="{IMEDIT_ID:about-principle:0}"><!-- FILL: "We are <em>decisive</em> and direct..." --></p>
      </div>
      <div class="about-principle">
        <span class="about-principle-num" data-imedit-id="{IMEDIT_ID:about-num:1}">2</span>
        <p class="about-principle-text" data-imedit-id="{IMEDIT_ID:about-principle:1}"><!-- FILL --></p>
      </div>
      <div class="about-principle">
        <span class="about-principle-num" data-imedit-id="{IMEDIT_ID:about-num:2}">3</span>
        <p class="about-principle-text" data-imedit-id="{IMEDIT_ID:about-principle:2}"><!-- FILL --></p>
      </div>
      <div class="about-principle">
        <span class="about-principle-num" data-imedit-id="{IMEDIT_ID:about-num:3}">4</span>
        <p class="about-principle-text" data-imedit-id="{IMEDIT_ID:about-principle:3}"><!-- FILL --></p>
      </div>
    </div>

  </div>
  <p class="source-line"><!-- FILL: or omit --></p>
  <p class="page-number"><!-- FILL: NN / TT --></p>
</section>
```

**Notes for about-firm:** The `.content-wrap` needs `flex-direction: row; gap: 0; padding: 0` to let the two panels fill edge-to-edge below the action title. The `.about-left` and `.about-right` each get `flex: 1` by default (50/50). The `.about-principle-text` uses Palatino italic for emphasis — wrap key words in `<em>`.

---

## Layout 3 variants — Iconic 3-column variant slots

**When to use (photo):** Experience pillars or capability columns where a photograph is more persuasive than a line-art icon. The icon circle becomes a 4:3 photo placeholder.

```html
<!-- Iconic-3-column:photo variant -->
<section class="slide iconic-3-column variant-photo" data-slide="N">
  <div class="logo">IM_</div>
  <h2 class="action-title" data-imedit-id="{IMEDIT_ID:action-title:0}">
    <strong><!-- FILL: section label --></strong> | <!-- FILL: declarative action title -->
  </h2>
  <div class="content-wrap">
    <div class="iconic-three-col">

      <div class="iconic-card" data-imedit-id="{IMEDIT_ID:iconic-card:0}">
        <!-- Photo replaces icon circle — the class overrides width/height/border-radius -->
        <div class="iconic-circle">Image placeholder</div>
        <p class="iconic-title" data-imedit-id="{IMEDIT_ID:iconic-title:0}"><!-- FILL: pillar title in Palatino --></p>
        <p class="iconic-subtitle" data-imedit-id="{IMEDIT_ID:iconic-subtitle:0}"><!-- FILL: italic descriptor --></p>
        <ul class="iconic-bullets">
          <li data-imedit-id="{IMEDIT_ID:bullet:0}"><!-- FILL --></li>
          <li data-imedit-id="{IMEDIT_ID:bullet:1}"><!-- FILL --></li>
          <li data-imedit-id="{IMEDIT_ID:bullet:2}"><!-- FILL --></li>
        </ul>
      </div>

      <div class="iconic-card" data-imedit-id="{IMEDIT_ID:iconic-card:1}">
        <div class="iconic-circle">Image placeholder</div>
        <p class="iconic-title" data-imedit-id="{IMEDIT_ID:iconic-title:1}"><!-- FILL --></p>
        <p class="iconic-subtitle" data-imedit-id="{IMEDIT_ID:iconic-subtitle:1}"><!-- FILL --></p>
        <ul class="iconic-bullets">
          <li data-imedit-id="{IMEDIT_ID:bullet:3}"><!-- FILL --></li>
          <li data-imedit-id="{IMEDIT_ID:bullet:4}"><!-- FILL --></li>
          <li data-imedit-id="{IMEDIT_ID:bullet:5}"><!-- FILL --></li>
        </ul>
      </div>

      <div class="iconic-card" data-imedit-id="{IMEDIT_ID:iconic-card:2}">
        <div class="iconic-circle">Image placeholder</div>
        <p class="iconic-title" data-imedit-id="{IMEDIT_ID:iconic-title:2}"><!-- FILL --></p>
        <p class="iconic-subtitle" data-imedit-id="{IMEDIT_ID:iconic-subtitle:2}"><!-- FILL --></p>
        <ul class="iconic-bullets">
          <li data-imedit-id="{IMEDIT_ID:bullet:6}"><!-- FILL --></li>
          <li data-imedit-id="{IMEDIT_ID:bullet:7}"><!-- FILL --></li>
          <li data-imedit-id="{IMEDIT_ID:bullet:8}"><!-- FILL --></li>
        </ul>
      </div>

    </div>
  </div>
  <p class="source-line"><!-- FILL: or omit --></p>
  <p class="page-number"><!-- FILL: NN / TT --></p>
</section>
```

---

**When to use (sidebar):** "Why Implement?" or "Why X?" slides where a left sidebar adds a framing question/icon next to 3 main columns.

```html
<!-- Iconic-3-column:sidebar variant -->
<section class="slide iconic-3-column variant-sidebar" data-slide="N">
  <div class="logo">IM_</div>
  <h2 class="action-title" data-imedit-id="{IMEDIT_ID:action-title:0}">
    <strong><!-- FILL: section label --></strong> | <!-- FILL: declarative action title -->
  </h2>
  <div class="content-wrap">

    <!-- Left sidebar -->
    <div class="iconic-sidebar">
      <div class="iconic-sidebar-icon">
        <svg viewBox="0 0 48 48" stroke="currentColor" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
          <!-- FILL: sidebar icon paths -->
        </svg>
      </div>
      <p class="iconic-sidebar-label" data-imedit-id="{IMEDIT_ID:sidebar-label:0}"><!-- FILL: e.g. "Why Implement?" --></p>
    </div>

    <!-- 3 columns (same structure as base iconic-3-column) -->
    <div class="iconic-three-col">
      <div class="iconic-card" data-imedit-id="{IMEDIT_ID:iconic-card:0}">
        <div class="iconic-circle">
          <svg viewBox="0 0 32 32"><!-- FILL --></svg>
        </div>
        <p class="iconic-title" data-imedit-id="{IMEDIT_ID:iconic-title:0}"><!-- FILL --></p>
        <p class="iconic-subtitle" data-imedit-id="{IMEDIT_ID:iconic-subtitle:0}"><!-- FILL --></p>
        <ul class="iconic-bullets">
          <li data-imedit-id="{IMEDIT_ID:bullet:0}"><!-- FILL --></li>
          <li data-imedit-id="{IMEDIT_ID:bullet:1}"><!-- FILL --></li>
          <li data-imedit-id="{IMEDIT_ID:bullet:2}"><!-- FILL --></li>
        </ul>
      </div>
      <div class="iconic-card" data-imedit-id="{IMEDIT_ID:iconic-card:1}">
        <div class="iconic-circle"><svg viewBox="0 0 32 32"><!-- FILL --></svg></div>
        <p class="iconic-title" data-imedit-id="{IMEDIT_ID:iconic-title:1}"><!-- FILL --></p>
        <p class="iconic-subtitle" data-imedit-id="{IMEDIT_ID:iconic-subtitle:1}"><!-- FILL --></p>
        <ul class="iconic-bullets">
          <li data-imedit-id="{IMEDIT_ID:bullet:3}"><!-- FILL --></li>
          <li data-imedit-id="{IMEDIT_ID:bullet:4}"><!-- FILL --></li>
          <li data-imedit-id="{IMEDIT_ID:bullet:5}"><!-- FILL --></li>
        </ul>
      </div>
      <div class="iconic-card" data-imedit-id="{IMEDIT_ID:iconic-card:2}">
        <div class="iconic-circle"><svg viewBox="0 0 32 32"><!-- FILL --></svg></div>
        <p class="iconic-title" data-imedit-id="{IMEDIT_ID:iconic-title:2}"><!-- FILL --></p>
        <p class="iconic-subtitle" data-imedit-id="{IMEDIT_ID:iconic-subtitle:2}"><!-- FILL --></p>
        <ul class="iconic-bullets">
          <li data-imedit-id="{IMEDIT_ID:bullet:6}"><!-- FILL --></li>
          <li data-imedit-id="{IMEDIT_ID:bullet:7}"><!-- FILL --></li>
          <li data-imedit-id="{IMEDIT_ID:bullet:8}"><!-- FILL --></li>
        </ul>
      </div>
    </div>

  </div>
  <p class="source-line"><!-- FILL: or omit --></p>
  <p class="page-number"><!-- FILL: NN / TT --></p>
</section>
```

**Notes for sidebar variant:** The `.content-wrap` is set to `flex-direction: row` via the variant CSS. The `.iconic-sidebar` takes 14% width, leaving 86% for the 3 columns. The sidebar label uses `writing-mode: vertical-rl; transform: rotate(180deg)` to read bottom-to-top.

---

## Layout 10 variant — Comparison table:strategic-options

**When to use:** Strategic options matrix where each row represents a distinct option (A/B/C/D/E) with a letter-tagged colored circle in the first column and an italic option name below it.

```html
<section class="slide comparison-table variant-strategic-options" data-slide="N">
  <div class="logo">IM_</div>
  <h2 class="action-title" data-imedit-id="{IMEDIT_ID:action-title:0}">
    <strong><!-- FILL: section label --></strong> | <!-- FILL: declarative action title -->
  </h2>
  <div class="content-wrap">
    <div class="im-table-wrap">
      <table class="im-table">
        <thead>
          <tr>
            <th data-imedit-id="{IMEDIT_ID:th:0}"><!-- FILL: e.g. "Option" --></th>
            <th data-imedit-id="{IMEDIT_ID:th:1}"><!-- FILL: dimension 1, e.g. "Risk" --></th>
            <th data-imedit-id="{IMEDIT_ID:th:2}"><!-- FILL: dimension 2 --></th>
            <th data-imedit-id="{IMEDIT_ID:th:3}"><!-- FILL: dimension 3 --></th>
            <th data-imedit-id="{IMEDIT_ID:th:4}"><!-- FILL: dimension 4 --></th>
          </tr>
        </thead>
        <tbody>
          <!-- Row A -->
          <!-- NOTE: increment td :N row-major (left-to-right, top-to-bottom) starting at 0 -->
          <tr>
            <td data-imedit-id="{IMEDIT_ID:td:0}">
              <div class="cto-row-label">
                <span class="cto-row-label-circle option-a">A</span>
                <span class="cto-row-label-name" data-imedit-id="{IMEDIT_ID:cto-name:0}"><!-- FILL: option name in italics --></span>
              </div>
            </td>
            <td data-imedit-id="{IMEDIT_ID:td:1}"><!-- FILL --></td>
            <td data-imedit-id="{IMEDIT_ID:td:2}"><!-- FILL --></td>
            <td data-imedit-id="{IMEDIT_ID:td:3}"><!-- FILL --></td>
            <td data-imedit-id="{IMEDIT_ID:td:4}"><!-- FILL --></td>
          </tr>
          <!-- Row B -->
          <tr>
            <td data-imedit-id="{IMEDIT_ID:td:5}">
              <div class="cto-row-label">
                <span class="cto-row-label-circle option-b">B</span>
                <span class="cto-row-label-name" data-imedit-id="{IMEDIT_ID:cto-name:1}"><!-- FILL --></span>
              </div>
            </td>
            <td data-imedit-id="{IMEDIT_ID:td:6}"><!-- FILL --></td>
            <td data-imedit-id="{IMEDIT_ID:td:7}"><!-- FILL --></td>
            <td data-imedit-id="{IMEDIT_ID:td:8}"><!-- FILL --></td>
            <td data-imedit-id="{IMEDIT_ID:td:9}"><!-- FILL --></td>
          </tr>
          <!-- Row C -->
          <tr>
            <td data-imedit-id="{IMEDIT_ID:td:10}">
              <div class="cto-row-label">
                <span class="cto-row-label-circle option-c">C</span>
                <span class="cto-row-label-name" data-imedit-id="{IMEDIT_ID:cto-name:2}"><!-- FILL --></span>
              </div>
            </td>
            <td data-imedit-id="{IMEDIT_ID:td:11}"><!-- FILL --></td>
            <td data-imedit-id="{IMEDIT_ID:td:12}"><!-- FILL --></td>
            <td data-imedit-id="{IMEDIT_ID:td:13}"><!-- FILL --></td>
            <td data-imedit-id="{IMEDIT_ID:td:14}"><!-- FILL --></td>
          </tr>
          <!-- Row D -->
          <tr>
            <td data-imedit-id="{IMEDIT_ID:td:15}">
              <div class="cto-row-label">
                <span class="cto-row-label-circle option-d">D</span>
                <span class="cto-row-label-name" data-imedit-id="{IMEDIT_ID:cto-name:3}"><!-- FILL --></span>
              </div>
            </td>
            <td data-imedit-id="{IMEDIT_ID:td:16}"><!-- FILL --></td>
            <td data-imedit-id="{IMEDIT_ID:td:17}"><!-- FILL --></td>
            <td data-imedit-id="{IMEDIT_ID:td:18}"><!-- FILL --></td>
            <td data-imedit-id="{IMEDIT_ID:td:19}"><!-- FILL --></td>
          </tr>
          <!-- Row E (optional) -->
          <tr>
            <td data-imedit-id="{IMEDIT_ID:td:20}">
              <div class="cto-row-label">
                <span class="cto-row-label-circle option-e">E</span>
                <span class="cto-row-label-name" data-imedit-id="{IMEDIT_ID:cto-name:4}"><!-- FILL --></span>
              </div>
            </td>
            <td data-imedit-id="{IMEDIT_ID:td:21}"><!-- FILL --></td>
            <td data-imedit-id="{IMEDIT_ID:td:22}"><!-- FILL --></td>
            <td data-imedit-id="{IMEDIT_ID:td:23}"><!-- FILL --></td>
            <td data-imedit-id="{IMEDIT_ID:td:24}"><!-- FILL --></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <p class="source-line"><!-- FILL: or omit --></p>
  <p class="page-number"><!-- FILL: NN / TT --></p>
</section>
```

**Notes:** The `.cto-row-label-circle` uses five option classes (`option-a` through `option-e`) with distinct palette colours. The `.cto-row-label-name` uses Palatino italic. Standard table cell colour-coding (`cell-green`, `cell-amber`, `cell-red`, `cell-highlight`) still applies to non-label cells in this variant.

---

## Deck chrome (include in every generated deck)

Paste this immediately before `</body>`. Replace the `<!-- FILL: N -->` values with the actual total slide count.

```html
<!-- Navigation bar -->
<nav class="nav">
  <button id="prev" aria-label="Previous slide">‹</button>
  <div class="dots" id="dots"></div>
  <div class="counter" id="counter">1 / <!-- FILL: total slide count --></div>
  <button id="next" aria-label="Next slide">›</button>
  <button id="export-pdf" aria-label="Save as PDF" title="Save as PDF">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  </button>
</nav>

<!-- Print modal -->
<div class="print-modal" id="print-modal" role="dialog" aria-modal="true">
  <div class="print-modal-content">
    <button class="print-modal-close" id="print-modal-close">&times;</button>
    <div class="print-modal-title">Save as PDF</div>
    <div class="print-modal-sub">Produces a vector PDF with searchable text</div>
    <p class="print-modal-intro">When the print dialog opens, change three settings:</p>
    <ol class="print-modal-steps">
      <li><span class="step-num">1</span><span><span class="step-label">Destination</span> — Save as PDF</span></li>
      <li><span class="step-num">2</span><span><span class="step-label">Margins</span> — None</span></li>
      <li><span class="step-num">3</span><span><span class="step-label">Background graphics</span> — enabled</span></li>
    </ol>
    <div class="print-modal-actions">
      <button class="print-modal-cancel" id="print-modal-cancel">Cancel</button>
      <button class="print-modal-confirm" id="print-modal-confirm">Open print dialog</button>
    </div>
  </div>
</div>

<script>
  const SLIDE_W = 1280, SLIDE_H = 720;
  const slides = document.querySelectorAll('.slide');
  const total = slides.length;
  // Sync with whichever slide is currently marked .active in the DOM
  // (Important when the deck is re-loaded from a saved file where the user
  // had navigated past slide 1 before saving.)
  let current = (() => {
    for (let i = 0; i < slides.length; i++) {
      if (slides[i].classList.contains('active')) return i;
    }
    return 0;
  })();
  slides.forEach((s, i) => { if (i !== current) s.classList.remove('active'); });
  const counter = document.getElementById('counter');
  const dotsEl = document.getElementById('dots');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');

  function updateScale() {
    const toolbar = document.querySelector('.ime-toolbar');
    const toolbarH = toolbar && !toolbar.classList.contains('ime-hidden') ? toolbar.offsetHeight : 0;
    const availH = Math.max(100, window.innerHeight - toolbarH);
    const scale = Math.min(window.innerWidth / SLIDE_W, availH / SLIDE_H);
    document.documentElement.style.setProperty('--scale', scale);
    document.documentElement.style.setProperty('--ime-toolbar-h', toolbarH + 'px');
  }
  window.addEventListener('resize', updateScale);
  updateScale();
  // Recompute a few times after load to catch late-injected chrome (e.g. im-edit toolbar)
  setTimeout(updateScale, 100);
  setTimeout(updateScale, 500);
  setTimeout(updateScale, 1500);

  function buildDots() {
    dotsEl.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const d = document.createElement('div');
      d.className = 'dot' + (i === current ? ' active' : '');
      d.addEventListener('click', () => go(i));
      dotsEl.appendChild(d);
    }
  }
  function go(i) {
    if (i < 0 || i >= total) return;
    slides[current].classList.remove('active');
    current = i;
    slides[current].classList.add('active');
    counter.textContent = `${current + 1} / ${total}`;
    document.querySelectorAll('.dot').forEach((d, idx) => d.classList.toggle('active', idx === current));
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
  }
  prevBtn.addEventListener('click', () => go(current - 1));
  nextBtn.addEventListener('click', () => go(current + 1));

  const printModal = document.getElementById('print-modal');
  document.getElementById('export-pdf').addEventListener('click', () => printModal.classList.add('open'));
  document.getElementById('print-modal-close').addEventListener('click', () => printModal.classList.remove('open'));
  document.getElementById('print-modal-cancel').addEventListener('click', () => printModal.classList.remove('open'));
  document.getElementById('print-modal-confirm').addEventListener('click', () => {
    printModal.classList.remove('open');
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
  });
  printModal.addEventListener('click', e => { if (e.target === printModal) printModal.classList.remove('open'); });
  document.addEventListener('keydown', e => {
    if (printModal.classList.contains('open')) { if (e.key === 'Escape') printModal.classList.remove('open'); return; }
    // Don't hijack keys while the user is typing in an input / textarea / contentEditable
    const t = e.target;
    if (t && (t.matches && (t.matches('input, textarea, select') || t.isContentEditable))) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); go(current + 1); }
    if (e.key === 'ArrowLeft'  || e.key === 'PageUp')                    { e.preventDefault(); go(current - 1); }
    if (e.key === 'Home') { e.preventDefault(); go(0); }
    if (e.key === 'End')  { e.preventDefault(); go(total - 1); }
  });
  buildDots();
  // Sync prev/next button state with the actual current slide (may be > 0 if loaded from a saved deck)
  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === total - 1;
  if (counter) counter.textContent = `${current + 1} / ${total}`;
  document.querySelectorAll('.dot').forEach((d, idx) => d.classList.toggle('active', idx === current));
</script>
```

**Deck HTML shell:** Every generated deck follows this outer structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><!-- FILL: deck title --></title>
<style>
/* FILL: paste color theme override block here FIRST if not Standard */
/* FILL: paste full contents of im-styles.css here */
</style>
</head>
<body>
<div class="deck" id="deck">
  <!-- FILL: slide sections here, first slide gets class="active" -->
</div>
<!-- FILL: deck chrome block (nav + modal + script) here -->
</body>
</html>
```
