# im-first-draft — workflow reference

## Slot in the IM_ chain

```
im-story → im-first-draft → im-deck → im-edit
```

`im-first-draft` is optional. If skipped, `im-deck` reads the story file's default `**Layout hint:**` lines as today.

## Three commands

| Command | Trigger | Effect |
|---|---|---|
| Generate | "build the firstdraft", "let me sketch the layouts" | `*-story.md` → `*-firstdraft.html` |
| Apply | "apply the firstdraft", "lock in the layouts" | Picks in HTML → rewrites story file's layout hints (backup first) |
| Re-render | "I edited the story, refresh the sorter" | Regenerates HTML, preserves picks where slide titles still match |

## The examples corpus (forward compatibility)

When `im-examples/manifest.json` exists at the sibling-folder level, the generator records `examples_corpus_present: true` in the embedded state, and the alternatives modal's `.ifd-real-examples` slot becomes populated by sorter.js (currently empty in MVP). All three IM_ skills query the corpus via the shared tag vocabulary in `layout-catalog.md`.

## How a layout swap reaches im-deck

1. User clicks a slide in the sorter → picks alternative → state updated, `user_pick` set
2. Ctrl+S saves the firstdraft.html in place
3. User returns to chat: "apply the firstdraft"
4. `apply-firstdraft.mjs` reads the state, rewrites `**Layout hint:**` lines in the story.md
5. User runs `im-deck` — reads the now-updated story.md, builds the deck using the picked layouts
