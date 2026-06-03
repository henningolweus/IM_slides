# IM_ Icon Catalog

A categorized index of the SVG icons available to im-deck.
The icons themselves live in the anthropic-skills:implement-design
skill — this file is the index, not a copy.

## Resolving the library path

The icon library path is stored in `references/.icon-library-path.txt`
(written by `scripts/find-implement-design.ps1`).

To use an icon during deck generation:

1. Read `references/.icon-library-path.txt` → get the base path
2. Pick a category + filename from the table below
3. Read the SVG file from `<base path>\<category>\<filename>.svg`
4. Inline the `<path>` (or `<g>`) elements into the layout snippet's icon slot
5. Strip the outer `<svg>` wrapper; set the new wrapper attributes:
   `viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"`

If `references/.icon-library-path.txt` does not exist (implement-design
not installed locally), fall back to the bundled essentials list at the
end of this document. Do not invent SVG content.

## Categories

The following is the canonical category structure from
`implement-design/references/icons.md` (1,373 icons total, 21 categories).
All icons are line-art, stroke-based, Ash-Grey `#30373B`, no fills.

| # | Category | Approx. count | Use cases | Sample concepts |
|---|---|---|---|---|
| 01 | People | ~100 | Team slides, advisory board, stakeholders, references | person, group, hands, handshake, leader, audience, expert, mentor |
| 02 | Projects and processes | ~70 | Frameworks, change mgmt, operational models | process, workflow, pipeline, stage, gate, cycle, milestone, roadmap |
| 03 | Scores and ratings | ~30 | KPIs, benchmarks, performance summaries | trophy, star, medal, rating, score, award |
| 04 | Education and learning | ~15 | Capability building, training, onboarding | book, graduation, lesson, certificate, learning |
| 05 | Media (hardware + software) | ~50 | Tech transformation, digital tools, platforms | laptop, screen, phone, app, camera, speaker |
| 06 | Building and tools / construction | ~15 | Toolkits, infrastructure, setup | wrench, hammer, tool, drill, build |
| 07 | Industrial | ~30 | Manufacturing, supply chain, operations | factory, truck, warehouse, crane, equipment |
| 08 | Financial | ~7 | Investment, returns, fees, M&A | coin, balance, currency, vault, valuation |
| 09 | Medical | ~7 | Healthcare strategy, pharma, wellbeing | pulse, cross, heart, healthcare |
| 10 | Office supplies | ~30 | Reports, contracts, deliverables, admin | document, file, folder, pen, clip, archive |
| 11 | Food and drink | ~80 | Consumer goods, F&B strategy, hospitality | food, drink, restaurant, ingredient, meal |
| 12 | Transport (road, sea, air) | ~40 | Logistics, market entry, expansion | car, ship, plane, truck, route |
| 13 | Nature and animals | ~50 | ESG, sustainability, environment | leaf, tree, water, energy, planet, recycle |
| 14 | Cities | ~15 | Market entry, geography, real estate | building, skyline, city, office, tower |
| 15 | Sports and activities | ~25 | Performance, culture, competition, motivation | run, sprint, team sport, fitness |
| 16 | Arrows and decorative elements | ~200 | Connectors, callouts, diagrams, flow indicators | arrow-right, arrow-curve, pointer, divider, bracket |
| 17 | Timer badges | ~40 | Roadmaps, milestones, schedules, sprints | clock, timer, badge, deadline, phase |
| 18 | UN Sustainable Development Goals | ~18 | ESG reporting, impact, sustainability strategy | SDG-1 through SDG-17 + general SDG |
| 19 | Signs and symbols | ~50 | Checkmarks, indicators, status, logic | check, x, plus, minus, question, exclamation, warning |
| 20 | Large illustrations (named) | ~11 | Hero slides, section dividers, visual anchors | named scene illustrations |
| 21 | Lean / Myth busters | ~19 | Lean methodology, hypothesis-driven work, myth busting | lean, hypothesis, myth, bust |
| | **Total** | **~1,373** | | |

## Picking an icon — quick guide

1. From the content brief, identify the concept (e.g. "team collaboration", "growth", "risk").
2. Match to a category using the table above (e.g. team → People; process → Projects and processes; risk → Signs and symbols or Financial).
3. If multiple categories fit, prefer the more specific one.
4. List 2-3 candidate filenames in the chosen category (the full library uses descriptive names — search the category folder).
5. Read each candidate's SVG file. Pick the one whose visual matches the IM_ minimalist line style (single weight 1.4 stroke, no fill, square caps).
6. Inline its path content using the wrapper attributes above.

### Category-to-concept quick map

| Consulting concept | Best category |
|---|---|
| Team, people, collaboration | People (#01) |
| Strategy, roadmap, framework | Projects and processes (#02) |
| KPIs, performance, rankings | Scores and ratings (#03) |
| Training, capability | Education and learning (#04) |
| Digital, tech, AI, platforms | Media (#05) |
| Operations, manufacturing | Industrial (#07) |
| Investment, M&A, returns | Financial (#08) |
| Reports, documents, outputs | Office supplies (#10) |
| Sustainability, ESG | Nature and animals (#13) + SDGs (#18) |
| Market entry, geography | Cities (#14) + Transport (#12) |
| Checkmarks, warnings, status | Signs and symbols (#19) |
| Flow diagrams, connectors | Arrows and decorative (#16) |
| Lean, agile, hypothesis | Lean / Myth busters (#21) |

## Bundled essentials (fallback)

If implement-design is not installed, fall back to inline-defined SVGs for
the most common consulting-deck concepts. These 41 icons are bundled in
`assets/icons/` within the implement-design skill and are always available
when that skill is present.

All filenames use Pascal_case with underscores (e.g. `Bar_chart.svg`).
Read from: `<base path>\<filename>.svg` (no subdirectory — bundled icons
are flat in the `assets/icons/` folder).

### Full bundled set (41 icons)

**People and collaboration (12)**

| Filename | Concept |
|---|---|
| `Man.svg` | Individual person (male) |
| `Woman.svg` | Individual person (female) |
| `Business_man.svg` | Business professional (male) |
| `Business_woman.svg` | Business professional (female) |
| `Anonymous.svg` | Unknown / generic person |
| `Two_people.svg` | Pair, partnership, one-to-one |
| `Three_people.svg` | Team, group, collaboration |
| `Meeting.svg` | Meeting, workshop, roundtable |
| `Person_with_idea.svg` | Individual insight, innovation |
| `Handshake.svg` | Agreement, partnership, deal |
| `Thumbs_up.svg` | Approval, positive signal |
| `Thumbs_down.svg` | Rejection, negative signal |

**Strategy and process (10)**

| Filename | Concept |
|---|---|
| `Target.svg` | Goal, objective, focus |
| `Strategy.svg` | Strategic direction, compass, planning |
| `Idea.svg` | Lightbulb moment, innovation, ideation |
| `Innovation_sprint_1.svg` | Agile sprint, rapid innovation, iteration |
| `Milestone.svg` | Milestone, checkpoint, key date |
| `Iteration_loop.svg` | Cycle, loop, agile process, iteration |
| `Pyramid.svg` | Hierarchy, pyramid framework, priority |
| `Arrow_hits_KPI.svg` | Growth, hitting targets, KPI achievement |
| `Lean_startup.svg` | Lean methodology, build-measure-learn |
| `Organisational_chart.svg` | Org structure, hierarchy, reporting lines |

**Communication and thinking (3)**

| Filename | Concept |
|---|---|
| `Brain.svg` | AI, analytics, thinking, intelligence |
| `Thought_bubble.svg` | Insight, hypothesis, consideration |
| `Communication_v1.svg` | Comms, network, stakeholder dialogue |

**Data and scores (5)**

| Filename | Concept |
|---|---|
| `Graph_1.svg` | Line chart, trend, data over time |
| `Bar_chart.svg` | Bar chart, comparison, volume |
| `Pie_chart_1.svg` | Pie chart, composition, share |
| `Trophy.svg` | Best-in-class, award, benchmark winner |
| `Star.svg` | Rating, highlight, featured item |

**Digital and AI (3)**

| Filename | Concept |
|---|---|
| `Laptop.svg` | Digital, tech, software, remote work |
| `Globe.svg` | Global, geography, web, international |
| `AI_eye_1.svg` | AI, surveillance, machine vision, analytics |

**Signs and symbols (8)**

| Filename | Concept |
|---|---|
| `Warning.svg` | Risk, caution, alert |
| `Done.svg` | Completed, checkmark, approved |
| `Clock.svg` | Time, schedule, deadline |
| `Location.svg` | Location, geography, place |
| `Question_mark_1.svg` | Unknown, open question, hypothesis |
| `What.svg` | What? — framing, problem statement |
| `Why.svg` | Why? — root cause, rationale |
| `How.svg` | How? — approach, method |

### Bundled essentials: consulting-concept lookup

Use this table when building a slide and you need a specific consulting
concept — maps 20 common concepts to the actual bundled filename.

| Concept | Use this bundled file | Notes |
|---|---|---|
| Chart / trend data | `Graph_1.svg` | Line graph; use `Bar_chart.svg` for volume comparisons |
| Handshake / agreement | `Handshake.svg` | Exact match |
| Target / goal | `Target.svg` | Exact match |
| Growth / KPI hit | `Arrow_hits_KPI.svg` | Arrow hitting target; implies upward momentum |
| Idea / innovation | `Idea.svg` | Lightbulb-equivalent |
| Strategic direction | `Strategy.svg` | Compass-equivalent; directional planning |
| Team / group | `Three_people.svg` | Three-person group; use `Meeting.svg` for meeting context |
| Process / cycle | `Iteration_loop.svg` | Agile loop; cycle/process equivalent |
| Risk / caution | `Warning.svg` | No shield bundled; Warning is the risk signal |
| Analysis / thinking | `Brain.svg` | No magnifier bundled; Brain covers analytical thought |
| Time / schedule | `Clock.svg` | Exact match |
| Communication | `Communication_v1.svg` | No network icon bundled; covers stakeholder comms |
| Deliverable / output | `Laptop.svg` | No document icon bundled; use for digital deliverables |
| Milestone / date | `Milestone.svg` | Milestone-on-timeline icon |
| Location / region | `Location.svg` | No flag bundled; pin/location marker |
| Done / complete | `Done.svg` | Checkmark equivalent |
| Warning / alert | `Warning.svg` | Exact match |
| Brain / AI | `Brain.svg` | Exact match |
| Org structure | `Organisational_chart.svg` | Also covers hierarchy, governance, reporting |
| Pie chart / share | `Pie_chart_1.svg` | Note the `_1` suffix in the filename |

**Important:** never invent SVG path data. If a required icon cannot be located,
leave a placeholder comment `<!-- ICON MISSING: <concept> -->` in the slot
and report to the user at delivery time.
