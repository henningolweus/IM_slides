# Deck Types — im-story Scaffold Reference

Load the relevant section when building a storyline. Use the slide sequence as a starting scaffold — deviate only when content clearly demands it, and note the deviation in the story file.

---

## 1. Strategic Briefing
*Default: 6–8 slides. Argument-first.*

**Purpose:** Communicate a single strategic argument or analysis finding. Each slide advances one point toward the governing conclusion. Used for: transaction analysis, market entry assessments, strategic options, competitive intelligence.

**Default slide scaffold:**
1. Cover — title + "about this briefing" right panel
2. Iconic 3-column — the thesis: 3 pillars that together prove the governing thought
3. Bleed-right panel — the facts: transaction details, assets, key numbers with a coloured sidebar
4. Two-panel — implications: governance shift, ownership structure, "what changed"
5. Moves grid — the plays: 6 likely moves grouped into 2 themes (Group A / Group B)
6. Alternating timeline — signals to watch: 6 events on a 0–24 month axis, confirmed vs. upcoming

**Action title style:** Noun phrase (subject) + declarative so what. The 6 titles read as a 6-sentence memo.

Real examples from the DWS Norway briefing:
- "The transaction | DWS bought four iconic Norwegian travel assets from Longship and split the business into infrastructure and operating companies"
- "Investment thesis | DWS is buying quasi-monopoly access points to a structurally growing Arctic tourism market"
- "Governance | Capital and strategy shift to DWS while Norwegian management and Tromsø HQ remain in place"
- "Likely moves | Six plays will build the platform around the anchors and then harden it for the long hold"
- "What to watch | Six signals over the next 12 to 24 months will tell us if this becomes a platform or stays a portfolio bet"

**Deviation guidance:**
- Add a second bleed-right panel (slide 3b) if facts are complex enough to need two slides
- Remove moves grid if the deck is purely analytical with no forward-looking view
- Replace iconic 3-column with two-panel if the thesis has only 2 pillars

---

## 2. Proposal / Pitch
*Default: 25 slides. Credentials-first, then substance, then engagement details.*

**Purpose:** Consulting services proposal. Leads with a personal thank-you letter and a contents page, then works through structured sections: background/objectives → our perspectives → scope & approach → team & investment → appendix. Closes with a second partner letter. Reference decks: four anonymized IM_ proposals (Proposals 1–4, 2025–2026).

### Proposal slide scaffold

**Opening (slides 1–3):**

1. **Cover** (`cover`)
   - Action title: none (labels only)
   - Content: "Letter of proposal — prepared by Implement Consulting Group"; photo placeholder or solid right panel; Palatino white title left-aligned; vertical IMPLEMENT mark top-right

2. **Opening letter** (`photo-left-content:letter`)
   - Action title: none (personal correspondence tone)
   - Content: partner thank-you letter addressed to named client contact. Format: "Dear [Client name], Thank you for the opportunity to submit this proposal on [engagement topic]. We are pleased to present our approach... [3–5 paragraphs]. We look forward to discussing this with you. Best regards, [Partner name], [Role]." Include signature block and partner avatar placeholder. Photo left carries the "Change with impact" wordmark overlay.

3. **Contents** (`photo-left-content:contents`)
   - Action title: "Contents" (label only — no declarative sentence)
   - Content: numbered list of 4–6 section names matching the segment-dividers that follow. Example: "01 Background & objectives / 02 Our perspectives / 03 Scope & approach / 04 Team & investment / 05 Appendix". Optional active-section highlight on the current section.

**Section 1 — Background & objectives (~3 slides):**

4. **Section divider** (`segment-divider`)
   - Action title: none
   - Content: "Section 01" + section name, e.g. "Background & objectives". Use photo variant by default; use solid variant if no contextual image is available.

5. **Situation, complications, key questions** (`two-panel:scr`)
   - Action title: declarative sentence framing why this engagement is needed, e.g. "Three structural shifts are creating the need to act on [topic] now"
   - Content: left panel — situation and complications in bullet form (3–5 bullets); right panel — numbered key questions or objectives the proposal will address (3–5, in green-grey numbered circles). Optional "FOR DISCUSSION" tag top-right.

6. **Cost/value potential** (`quantified-summary`)
   - Action title: states the magnitude of the opportunity or problem, e.g. "The addressable improvement potential is DKK X–Y billion across [N] initiatives"
   - Content: chart left (waterfall, bar, or simple column showing value bridge); numbered initiative cards right (3 cards typical, each with a green numbered circle + bold title + 2–3 bullets describing the initiative)

**Section 2 — Our perspectives (~5–7 slides):**

7. **Section divider** (`segment-divider`)
   - Content: "Section 02" + section name, e.g. "Our perspectives on [Client]"

8. **Success criteria** (`vertical-numbered-list:dark-labels`)
   - Action title: states what must be true for the engagement to succeed, e.g. "Five criteria will determine whether this transformation delivers lasting impact"
   - Content: 5 rows, each with a dark-ash label cell on the left (bold white title + optional italic subtitle) and 1–2 supporting bullets on the right. Variants: `:numbered` for green-grey circles + bullets, `:numbered-arc` adds a quarter-arc decoration (use when the slide is THE thesis page of the section), `:light-labels` for airy italic-Palatino labels with paragraph body, `:lettered` for A/B/C ordering when items are non-ranked.

9. **Credentials / experience** (`photo-card-grid`)
   - Action title: anchors on the client's specific need, e.g. "We bring deep experience in exactly the three areas that matter most for [Client]"
   - Content: 3–4 column grid of experience cards. Each card: photo placeholder top (engagement image or sector visual), bold title ("We know X / We have delivered Y / We bring Z"), 2–3 bullet description below. Use `iconic-3-column:photo` as fallback if cards are fewer.

10. **Methodology / framework** (`two-panel:header-band`)
    - Action title: names and justifies the approach, e.g. "Our [methodology name] framework is built for [client's] speed and complexity"
    - Content: shared header band at top spanning both panels; left panel — approach overview or framework diagram; right panel — what each phase/element delivers for the client

11. **Co-creation / project team** (`ring-diagram`)
    - Action title: commits to a collaborative working model, e.g. "We work as one team with [Client] — not as external advisors"
    - Content: two overlapping circles (client name left, Implement right); overlap area labelled "One team" or "Co-creation"; 3–5 bullets per side describing what each party brings; optional bottom icon row (joint deliverables or touchpoints)

12. *(Optional)* **Philosophy / approach pillars** (`iconic-3-column:photo`)
    - Action title: names the three distinguishing aspects of Implement's approach
    - Content: 3 columns, each with a real photo placeholder (not icon circle) + italic Palatino subtitle + 3–4 body bullets

**Section 3 — Scope & approach (~3–5 slides):**

13. **Section divider** (`segment-divider`)
    - Content: "Section 03" + section name, e.g. "Suggested scope & approach"

14. **Module overview** (`moves-grid` or `iconic-3-column`)
    - Action title: summarises how the scope is structured, e.g. "The engagement is structured in [N] modules covering [theme A], [theme B], and [theme C]"
    - Content: 4–6 module cards (Module A / B / C / D) each with a short title and 2–3 bullet deliverables. Use `moves-grid` for 4–6 modules; `iconic-3-column` for exactly 3.

15. **Project plan / Gantt** (`gantt-process`)
    - Action title: commits to a concrete timeline, e.g. "The [N]-week project delivers [key milestone] in [month] and [final deliverable] in [month]"
    - Content: month/week column headers × 4–5 workstream rows × colored activity bands. Bottom row: meetings and touchpoints (interview waves, steering committees, final delivery). Optional dashed "Phase N (optional)" column at right.

16. *(Optional)* **Requirements matrix or strategic options** (`comparison-table` or `comparison-table:strategic-options`)
    - Action title: frames the decision or comparison, e.g. "Option B meets all mandatory requirements and best balances speed with risk"
    - Content: requirements matrix (rows = criteria, columns = options) or strategic options table (letter-tagged rows A–E with colored row labels)

**Section 4 — Team & investment (~3 slides):**

17. **Section divider** (`segment-divider`)
    - Content: "Section 04" + section name, e.g. "Team & investment"

18. **Team and investment** (`team-and-investment:compact`)
    - Action title: states the team's combined qualification, e.g. "The core team brings [combined years] of directly relevant experience to [Client]"
    - Content: 2-column horizontal cards on the left (small 72×96 portrait photo + name in Arial bold + italic role + 2–4 line description), Investment panel on the right with "Investment" header + paragraph + bulleted assumptions. Variants: `:compact` for ≤6-person teams with fee; `:with-experts` for 3-column (core team + Subject Matter Experts column + Investment); `:network` for core team + Expert Network row, no investment column (use a separate slide for fee).

19. *(Optional)* **Person bio(s)** (`person-bio`)
    - Action title: names the person and anchors their relevance, e.g. "[Name] has led [N] similar transformations and will serve as day-to-day lead"
    - Content: large photo placeholder left + name + email/phone below photo. Right side: name in Palatino, role in Arial, then two-column layout with Experience, Education, and Selected projects sections. Repeat for each key team member who warrants a slide.

**Section 5 — Appendix (~5–10 slides):**

20. **Section divider** (`segment-divider`)
    - Content: "Section 05" + "Appendix" or "Supporting material". Use solid variant if no contextual photo is available.

21. **Client references** (`photo-card-grid`)
    - Action title: none or a simple label ("Client references")
    - Content: 3–4 column grid of reference cards. Each card: client logo placeholder, project title, 2–3 line description. Contact name and email at bottom if available.

22. **Extended CVs** (`person-bio` × N)
    - Action title: none or name label
    - Content: full CV format for each team member not covered in the core team section. Same layout as slide 19.

23. **About Implement** (`two-panel:about-firm`)
    - Action title: positions the firm, e.g. "Implement Consulting Group is Europe's leading transformation consultancy"
    - Content: dark left panel (`#30373B`) with white Palatino title + 1–2 paragraph firm description + chart area (e.g. headcount growth, office map); white right panel with 4 numbered "We are…" principle blocks (short bold statement + 1–2 sentences each).

24. **Why Implement** (`iconic-3-column:sidebar`)
    - Action title: makes the case for choosing Implement over alternatives, e.g. "Three things make Implement the right partner for [Client]"
    - Content: left sidebar (~14% width) with a single icon + "Why Implement?" label; right area: 3 columns each with a distinct differentiator heading + 3–4 bullets

**Closing:**

25. **Closing letter** (`photo-left-content:letter`)
    - Action title: none (personal correspondence tone)
    - Content: mirrors slide 2. Closing thank-you letter: "We look forward to the opportunity to work with you on [topic]. Should you have any questions, please do not hesitate to contact [partner name] at [email]. Best regards, [Partner name], [Role]." Photo left carries the "Change with impact" wordmark overlay.

---

### Proposal-writing conventions

**Letter slides (slides 2 and 25):** Always a signed letter from the partner, not a bullet summary. Tone is warm and personal. Format: greeting → brief context sentence → 2–4 substantive paragraphs → closing sentence → "Best regards, [Partner name], [Role]". Include a placeholder for the partner's signature and avatar. Both letter slides use `photo-left-content:letter`; the photo on the left carries the "Change with impact" wordmark overlay — note this in the content brief so im-deck applies the overlay class.

**Contents slide (slide 3):** Action title is "Contents" only — no declarative sentence. The list should have 4–6 entries matching the section names on the segment-dividers that follow. Numbering is "01 / 02 / 03…" in the IM_ green-grey color.

**Segment-dividers:** Every section opens with a `segment-divider` slide showing the section number and name. Use the photo variant (`segment-divider:photo`) by default — choose a contextual image relevant to the section topic. Use the solid variant (`segment-divider:solid`) if no appropriate image is available. The segment-divider has no action title.

**Section 1 always uses the SCR pattern:** The situation + complication + key questions structure in `two-panel:scr` is the canonical way to open the substantive argument. The left panel holds what is true now (situation + complications); the right panel holds the key questions or objectives the proposal addresses. Never use a simple bullet list or `full-width-body` for this slide.

**Section 4 combines team and investment on one slide:** The `team-and-investment` layout holds both the team photo grid and the fee panel. Do not split these onto separate slides unless the team section is very large (>8 people).

**Final slide always mirrors the opener:** Slide 25 is a second `photo-left-content:letter`, not a `pull-quote` or `full-width-body`. The closing letter thanks the client, invites questions, and signs off from the partner. The mood should be confident and warm — not sales-y.

**Action title rules for proposals:**
- Slides 1–4, segment-dividers: no action titles (cover, letters, contents, section breaks)
- Slides 5–24 (substantive content): all titles must be declarative sentences stating the so what
- Exception: appendix slides (21–24) may use label-only titles

**VDD variant** (when the proposal is for a Vendor Due Diligence):
- Section 2 expands to 5–7 perspective slides covering the VDD framework: executive summary of key investor questions → market attractiveness → competitive positioning → company platform → optional geographic expansion
- Action title style on perspective slides: frame the investor question, not the finding. Correct: "What drives growth in the Norwegian aftermarket for bodywork parts?" — Incorrect: "Market is growing at 3–5% p.a."
- The closing letter (slide 25) is more prominent — use a near-black background if `photo-left-content:letter` supports a dark variant

---

## 3. Status / Project Update
*Default: 5–7 slides. Scannable in 3 minutes.*

**Purpose:** Steering committee or client update. Partners read this before the meeting and use it to frame the discussion. Data-heavy, RAG statuses, clear decisions-needed.

**Default slide scaffold:**
1. Cover — project name + reporting period
2. KPI dashboard — 3–4 headline metrics each with RAG status (Green / Amber / Red)
3. Moves grid — progress by workstream: each card shows workstream name + status + one-line update
4. Two-panel — issues & risks (left) / mitigations & owners (right)
5. Alternating timeline — milestones: completed (filled/confirmed dots) vs. upcoming (hollow dots)
6. Full-width body text — next steps + decisions needed from this meeting (bulleted, owner + date per item)

**Action title style:** Short, factual, readable in 5 seconds.
- Correct: "The project is on track overall but workstream 3 requires a resourcing decision this week"
- Incorrect: "Project status"

**Deviation guidance:**
- Merge KPI dashboard and moves grid onto one slide if total slide count must stay ≤ 5
- Add a bleed-right panel if one specific risk needs more than 3 bullet lines to explain

---

## 4. Workshop / Facilitation
*Default: 8–15 slides. Projected in live sessions.*

**Purpose:** Structure a working session. Slides are prompts and discussion templates — not documents to be read. Wide whitespace is intentional. Participants should be looking at each other, not reading slides.

**Default slide scaffold:**
1. Cover — workshop title + date + facilitator
2. `photo-left-content:purpose` — workshop objective and desired outcomes (right panel), visual/image placeholder (left)
3. `segment-divider` — "Part 1: [section name]"
4. Full-width body text — exercise brief: what we'll do, why, how long, ground rules
5. Two-panel — discussion framework or analysis template participants fill in (can be left intentionally sparse)
6. Pull quote — key insight, provocation, or "the one thing to take away from this section"
7. `segment-divider` — "Part 2: [section name]"
8–N. Repeat the exercise pattern (brief → framework → insight) as many times as the agenda needs
Final. Full-width body text — output template / agreed next steps / decisions made

**Action title style:** Imperative or question form — the slide is a prompt, not a finding.
- "Map your three biggest growth levers and rank them by near-term impact"
- "Where does pricing power actually come from in this market?"
- Not: "Exercise 1 — Growth levers"

**Deviation guidance:**
- Add as many segment-dividers and exercise pairs as the agenda needs
- Remove pull quote sections if the session is purely analytical / output-focused
- For very large workshops (full-day), add a "Recap" slide between parts using full-width body text

---

## Sample analysis slide layout-matching

Use this when the story calls for "sample analysis slides" (e.g. in proposals, slides in Section 2):

| Content type | Layout |
|---|---|
| Market size + growth drivers + outlook | `bleed-right` (market segments as cards, key stats in sidebar) |
| Competitive positioning / buying criteria | `two-panel` (competitor map left, criteria right) or `comparison-table` |
| Company overview / snapshot | `bleed-right` (key facts as cards, financial highlights in sidebar) |
| Value chain | `bleed-right` (chain steps as cards left, client's position highlighted in sidebar) |
| Geographic expansion | `iconic-3-column` (one column per priority market) |
| Financial summary | `kpi-dashboard` (3–4 headline metrics) |
