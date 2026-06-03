# Comment grammar — how Claude resolves im-edit comments

When the user invokes `im-edit` and asks to apply comments, Claude reads the deck's `#im-edit-state` block, iterates pending comments, and edits the surrounding HTML according to this playbook.

## Comment shapes and Claude actions

| Shape | Examples | Action |
|---|---|---|
| Rephrase / rewrite | "rephrase to be more direct"; "tighten this"; "make this sound less hedged"; "say it the way a partner would" | Replace the element's text content with a rewritten version. Preserve `<strong>`, `<em>`, `<br>` children where they make sense. |
| Replace specific text | "change 'X' to 'Y'"; "swap 'rapid' for 'fast'" | Targeted text substitution within the element. |
| Add | "add bullet: ..."; "add a sentence about X"; "append: ..." | Append a new `<li>` to the nearest `<ul>` or a new sentence to the existing paragraph. |
| Delete | "delete this"; "remove this bullet"; "cut this row" | Remove the element (and its enclosing `<li>` / table row if the deletion empties the parent). |
| Make bold / italic | "make bold"; "italicise"; "emphasise" | Wrap the element's text in `<strong>` / `<em>`. |
| Style instruction | "make this Arial 18pt"; "change to Heading 2"; "use Blue-Green 60%" | Apply directly to the state JSON's `styles` map (do NOT modify the HTML). Mark resolution_note = "style override applied". |
| Reflow / restructure | "split into two slides"; "merge with slide above" | OUT OF SCOPE for im-edit v1. Mark `status: "deferred"` with resolution_note = "out-of-scope: layout restructure". |
| Ambiguous / unclear | "fix this"; "doesn't read right"; "?" | Mark `status: "needs_clarification"` with resolution_note quoting the comment. Leave for user. |

## Slide-level comments

Comments with `target_imedit_id: null` and `scope: "slide"` apply to the slide as a whole.
Use these for layout-wide instructions: "swap all icons to people", "make this slide darker",
"this whole slide reads as too academic". When applying, Claude may need to edit multiple
elements within the slide, or defer with reason "needs human guidance on layout choice".

## Resolution workflow per comment

1. Find the target element by `data-imedit-id`:
   ```js
   const target = document.querySelector(`[data-imedit-id="${comment.target_imedit_id}"]`);
   ```
2. Classify the comment shape using the table above.
3. Apply the action.
4. Update the comment in state JSON:
   ```json
   {
     "id": "c-abc123",
     "status": "applied",
     "resolution_note": "Rewrote to remove hedge.",
     "resolved_at": "2026-06-02T14:00:00Z"
   }
   ```

## Atomic backup

Before writing the modified HTML back, save a backup of the pre-apply state to `<deck>.before-apply.html`. If the apply has already been run in this session, overwrite the previous backup. This is a single-step undo.

## Reporting

After processing all pending comments, report a summary:
- N comments applied (M rephrasings, K deletions, L additions, J style changes)
- N comments deferred (with brief reasons)
- N comments need clarification (list them so the user can answer)
- 0 errors (or list errors if any)

Example:
> Applied 5 comments — 2 rephrasings, 1 deletion, 2 style changes.
> 1 comment deferred: "split into two slides" (layout restructure, im-edit v1 limit).
> 0 comments need clarification. 0 errors.

## Guardrails

- Never modify or remove `data-imedit-id` attributes.
- Never delete the `#im-edit-state` script tag during apply (only `strip-chrome.mjs` does that).
- Never edit content inside slides for which the user did not leave a comment.
- If a comment is genuinely ambiguous, prefer marking `needs_clarification` over guessing.
- If the comment text instructs a change that would violate one of the PPTX 4 constraints (e.g. "add a gradient background"), defer with reason "would break PPTX export constraints" — do NOT silently apply.
