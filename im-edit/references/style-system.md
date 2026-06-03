# im-edit Style System

The named-style catalogue lives in `assets/style-catalogue.json`. This file is the human-readable counterpart.

## Why named styles?

Consistency by default. Instead of asking reviewers to remember Palatino/16px/dark grey for a body paragraph, they pick "Body" from a dropdown and the recipe applies. Per-element overrides (font / size / colour) are still available when a reviewer needs to break the recipe.

## The named styles

| Style | pt | Use for | Font | Weight |
|---|---|---|---|---|
| `footer` | 6.5 | Page-number tracker, source/notes footer | Arial | Regular |
| `eyebrow` | 9 | Page numbers, source line, caption | Arial | Bold, uppercase, +0.18em |
| `section-label` | 9 | Section-label eyebrows | Arial | Bold, uppercase, +0.18em |
| `caption` | 9 | Photo caption, attribution | Arial | Bold, uppercase, +0.18em |
| `body-small` | 10 | Sub-sub-labels (STEP 1, RUNTIME), footer meta | Arial | Regular |
| `kpi-kicker` | 10 | KPI metric label | Arial | Bold, uppercase, +0.18em |
| `body` | 12 | Default paragraph + bullet text | Arial | Regular |
| `subheading` | 14 | Card titles, table column heads | Arial | Bold |
| `callout` | 18 | Palatino small numbers ("Node 18+") | Palatino | Normal |
| `heading` | 24 | Action titles AND section headings | Palatino | Normal |
| `action-title` | 24 | Slide action title | Palatino | Normal |
| `callout-large` | 40 | Cover, pull-quote, agenda, KPI value | Palatino | Normal |
| `quote` | 40 | Pull-quote text (italic) | Palatino | Italic |
| `kpi-value` | 40 | Big KPI number | Palatino | Normal |
| `h1` | 40 | Cover headline | Palatino | Normal |

## Default style by element role

When im-deck generates a slide, every text element has a `data-imedit-id="s<NN>-<role>-<idx>"`. The role determines the default named style. See `style-catalogue.json` → `default_style_by_role` for the full map. Examples:

- `data-imedit-id="s02-action-title-0"` → default style `action-title`
- `data-imedit-id="s03-kpi-value-0"` → default style `kpi-value`
- `data-imedit-id="s04-body-2"` → default style `body`

If a reviewer hasn't overridden the style, the element uses its default. Overrides live in the deck's state JSON.

## Per-element overrides

After picking a named style, a reviewer can override individual properties via the toolbar:

- **Font**: Palatino (display) ↔ Arial (body) ↔ *(inherit from style)*
- **Size**: −2 / +2 stepper or explicit pixel input. Snaps to the standard size steps when possible (10.8, 11.4, 11.5, 13.8, 15.3, 17.2, 22, 31.7, 34, 38, 46).
- **Colour**: Constrained to the IM_ palette — Blue-Green 100/60/30/light/near-white, Green-Grey 100/60/30/light/near-white, Black/Ash/Grey/White. No free-text hex input.

Overrides combine with the chosen style. Example: `style="action-title"` + override `color="blue-green-60"` produces Palatino 31.7px Blue-Green-60. Removing the override reverts to the style's default.

## Extending the catalogue

To add a new named style:

1. Add the recipe to `style-catalogue.json` → `styles`.
2. (Optional) Add a default-by-role mapping.
3. Document in this file.
4. The toolbar dropdown picks up the new entry on next page load (no rebuild needed).

## Adjustable defaults

Body text defaults to 12pt. Reviewers can change body to 10.5, 11, or other values via the Size stepper in the toolbar. The standard step list (pt): 6.5, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 35, 38, 40, 44.

To change size: select an element, then click − / + on the size stepper, or type an explicit value.
