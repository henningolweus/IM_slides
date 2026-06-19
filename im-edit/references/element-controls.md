# Element controls

Which toolbar controls are active for which element kinds, and what they do.

## Element kinds (by tag)

| Tag | Element kind | Controls active |
|---|---|---|
| `<h1>`, `<h2>` (or any wrapped `data-imedit-id` heading) | Heading | Style, Font, Size, Colour, Comment |
| `<p>` (action-title, subtitle, body, caption, etc.) | Text | Style, Font, Size, Colour, Comment |
| `<li>` | Bullet | Style, Font, Size, Colour, Comment |
| `<span>` (small-text inline elements) | Inline text | Font, Size, Colour, Comment (Style hidden — inline can't carry block styles cleanly) |
| `<th>`, `<td>` | Table cell | Style, Font, Size, Colour, Comment |
| `<div>` with `data-imedit-id` whose children are only text + inline tags (`span`, `strong`, `em`, `br`, `a`, `code`) | Text leaf — treated as a text element | Style, Font, Size, Colour, Comment + inline text editing |
| `<div>` with `data-imedit-id` containing block-level children (`p`, `div`, `h*`, `ul`, `ol`, `table`, …) | Container | Comment only |
| `<img>` | Image | Comment only |
| `<svg>` icon | Icon | Comment only |

The selection halo always draws around the clicked element. The toolbar updates to show the current style/overrides for that element.

## What each control does

### Style dropdown
Sets `data-imedit-style="<name>"` on the element and adds class `ime-style-<name>`. The style's recipe is auto-injected into `<head>` as `<style id="ime-style-css-<name>">`. The state JSON's `styles[<imedit-id>]` records the override (as a string if only the style is set, as an object if individual properties are also overridden).

### Font dropdown
Sets `style="font-family: ..."` inline. Updates state JSON's override object.

### Size stepper (− / + / explicit)
Sets `style="font-size: Npx"` inline. − and + walk the `size_steps` list in style-catalogue.json. Explicit input accepts any positive number.

### Colour picker
Sets `style="color: ..."` inline. Values are CSS variable references (e.g. `var(--im-blue-green-60)`), so they respect dark/light theme inversion. Updates state JSON.

### Add comment
Opens the comment popover below the selected element. Comment text is required (empty cancels). Persists to state JSON's `comments[]` array with status: pending.

## Removing an override

To remove an override:
- **Style**: Set the Style dropdown to "— inherit —" (empty value). The class and `data-imedit-style` attribute are removed; the element falls back to the role-based default style or the deck's original CSS.
- **Font / Size / Colour**: Set the respective dropdown to "— style default —". The inline style property is removed; the element inherits from its current style.

If all overrides are removed, the entry is deleted from state JSON's `styles` map.

## Read-only mode

Loading the deck with `?view=1` skips chrome rendering entirely. Comments and overrides apply visually (via the persisted state JSON's overrides), but no editing UI is shown. Use this for sharing the edited version for viewing only.
