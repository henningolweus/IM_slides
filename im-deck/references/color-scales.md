# IM_ Nuance Color Scales

Two anchor colors expand into 5-step scales each. Picking the right step is part of the IM_ visual language — not all accents should be 100%.

## Blue-Green scale (the accent family)

| Step | Hex | CSS variable | Use for |
|---|---|---|---|
| 100 | `#67817F` | `--im-blue-green` | Action accents — title underlines, bullet dots, keyinfo icons, divider strips |
| 60  | `#A4B3B2` | `--im-blue-green-60` | Secondary accents — sub-labels, secondary borders |
| 30  | `#C2CDCC` | `--im-blue-green-30` | Tertiary — table dividing lines, soft borders |
| Light | `#E1E6E5` | `--im-blue-green-light` | Background tint for keyinfo panels, hover states |
| Near-white | `#F1F4F3` | `--im-blue-green-near-white` | Right-panel and card backgrounds on light slides |

## Green-Grey scale (the cover / canvas family)

| Step | Hex | CSS variable | Use for |
|---|---|---|---|
| 100 | `#B9C7C2` | `--im-green-grey` | Cover-left background (Standard), divider-left background |
| 60  | `#D5DDDA` | `--im-green-grey-60` | Highlighted table cells, secondary fills |
| 30  | `#E3E9E7` | `--im-green-grey-30` | Light panel backgrounds |
| Light | `#EAEEEC` | `--im-green-grey-light` | Subtle section backgrounds |
| Near-white | `#F1F4F3` | `--im-green-grey-near-white` | Page backgrounds where pure white feels too cold |

## Picking rules

- **One accent at 100% per slide max.** The eye needs an anchor. If you have three accents at 100%, the slide flattens and nothing stands out.
- **Use 60% for secondary information.** Sub-labels, captions, footer meta — they need to be visible but should sit behind the primary accent.
- **Use 30% for tertiary.** Table dividers, hairline borders, decorative connectors. Anywhere the eye should skip past.
- **Light and near-white are for panels — never for ink.** They make great backgrounds; they don't read as type.
- **Never use 100% as a panel fill.** It looks heavy and dominates the layout. Reserve 100% for line-and-dot accents only.
- **Dark theme inverts the relationships but not the rules.** What reads as "near-white" in Standard becomes a dark tone in Dark; the role of "1 anchor accent, hierarchy in tints" still holds.

## Worked examples

**Slide with three levels of information importance** (e.g. KPI dashboard):
- The headline number (most important): `--im-black` text
- The metric label (medium): `--im-ash` (existing variable) for body color
- The detail caption (least): `--im-grey` (existing variable)
- The vertical accent on the card top: `--im-blue-green` at 100%
- The hairline below the metric: `--im-blue-green-30`

**Slide with a single coloured callout** (e.g. one keyinfo panel):
- Panel fill: `--im-blue-green-near-white`
- Panel label: `--im-blue-green` at 100% (the anchor for this slide)
- Panel body text: `--im-ash`
- Icon strokes inside the panel: `--im-blue-green-60` (recede behind the label)

## Source

Values reconciled against implement-design's canonical colors.md (`implement-design/references/colors.md`).

Blue-Green 100%, 60%, 30%, Light, and Near-white are direct canonical values.
Green-Grey 100%, 60%, 30%, and Near-white are direct canonical values.
Green-Grey Light (`#EAEEEC`) is an HSL-derived approximation — the canonical Green-Grey scale has no "light" step; this value is the midpoint between 30% (`#E3E9E7`) and Near-white (`#F1F4F3`).
