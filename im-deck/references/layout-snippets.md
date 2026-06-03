# Layout Snippets — im-deck Reference

12 composable HTML layouts + deck chrome. Read only the sections you need for the current deck.

**Usage:** Replace every `<!-- FILL: ... -->` comment with actual content. Replace `N` in `data-slide="N"` with the actual 1-based slide number. Replace `NN / TT` in page numbers with actual numbers.

**CSS:** All class names reference `im-styles.css`. Inline that file in the deck's `<style>` tag.

## Layout 1 — Cover

**When to use:** First slide of every deck. The only slide without an action title.

```html
<section class="slide slide-cover" data-slide="1">
  <div class="cover-left">
    <div class="im-mark">IM_</div>
    <div>
      <h1 data-imedit-id="{IMEDIT_ID:title:0}"><!-- FILL: deck title; use <em>word</em> to italicise key words --></h1>
      <p class="subtitle" data-imedit-id="{IMEDIT_ID:subtitle:0}"><!-- FILL: one-line subtitle, e.g. "A strategic read of the January 2026 acquisition." --></p>
    </div>
    <p class="meta" data-imedit-id="{IMEDIT_ID:meta:0}">
      <strong><!-- FILL: deck type label, e.g. "Strategic briefing" or "Letter of proposal" --></strong> · <!-- FILL: Month YYYY --><br>
      Implement Consulting Group
    </p>
  </div>
  <div class="cover-right">
    <div>
      <p class="panel-sub on-dark" data-imedit-id="{IMEDIT_ID:panel-sub:0}"><!-- FILL: panel heading, e.g. "About this briefing" or "Dear [Name]," --></p>
      <div class="panel-sub-underline on-dark"></div>
      <p class="body-text" data-imedit-id="{IMEDIT_ID:body:0}"><!-- FILL: 1–2 sentences of context or opening statement --></p>
      <p class="body-text" data-imedit-id="{IMEDIT_ID:body:1}" style="margin-top: 10.2px;">
        <!-- FILL: what the deck covers or the ask; use <strong> for key phrases -->
      </p>
    </div>
    <p class="footer-meta" data-imedit-id="{IMEDIT_ID:footer-meta:0}">
      <strong>Source basis</strong> · <!-- FILL: data sources, or omit this block for proposals --><br>
      <strong>Status</strong> · <!-- FILL: e.g. "Lightly interpreted, non-confidential" or "Confidential — prepared for [Client]" -->
    </p>
  </div>
</section>
```

**Notes:** For proposals, replace the footer-meta block with the lead partner's name and contact info. For the personal intro slide (slide 2 of proposals), use Layout 12 (full-width body text) instead of a second cover.

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

## Layout 7 — Section divider

**When to use:** Part transitions (Part 1/2/3), ToC markers, section breaks between major deck chapters. Full-bleed two-tone: blue-green left, dark ash right.

```html
<section class="slide slide-divider" data-slide="N">
  <div class="logo">IM_</div>
  <div class="divider-left">
    <p class="div-eyebrow" data-imedit-id="{IMEDIT_ID:div-eyebrow:0}"><!-- FILL: e.g. "Part 1" or "Section" or omit --></p>
    <h2 class="div-title" data-imedit-id="{IMEDIT_ID:div-title:0}"><!-- FILL: section name in Palatino; use <em> for italic --></h2>
  </div>
  <div class="divider-right">
    <!-- FILL: either a list of what this section covers, or leave this panel minimal -->
    <div class="div-items">
      <div class="div-item">
        <span class="div-num" data-imedit-id="{IMEDIT_ID:div-num:0}">01</span>
        <p class="div-label" data-imedit-id="{IMEDIT_ID:div-label:0}" style="margin:0"><!-- FILL: item label --></p>
      </div>
      <div class="div-item">
        <span class="div-num" data-imedit-id="{IMEDIT_ID:div-num:1}">02</span>
        <p class="div-label" data-imedit-id="{IMEDIT_ID:div-label:1}" style="margin:0"><!-- FILL --></p>
      </div>
      <div class="div-item">
        <span class="div-num" data-imedit-id="{IMEDIT_ID:div-num:2}">03</span>
        <p class="div-label" data-imedit-id="{IMEDIT_ID:div-label:2}" style="margin:0"><!-- FILL --></p>
      </div>
    </div>
  </div>
  <p class="page-number"><!-- FILL: NN / TT --></p>
</section>
```

**Notes:** For a ToC divider with no right-panel content, leave `.divider-right` empty or add a single-line subtitle. For a simple section transition, omit `.div-items` and add only a `.div-eyebrow` + `.div-title` on the left.

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
