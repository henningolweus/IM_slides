# Minto Principles for IM_ Deck Storytelling

## The Governing Thought

The governing thought is the single declarative sentence that answers the question the audience is asking. It is the "so what" of the entire deck — the one sentence a partner could say walking out of the room.

**Rules:**
- One sentence, declarative, not a question
- States a point of view, not a topic
- The rest of the deck exists to prove or develop this sentence

**Examples (weak → strong):**
- "DWS acquisition of Norwegian travel assets" → "DWS is buying quasi-monopoly access points to a structurally growing Arctic tourism market, making this a platform investment, not a portfolio bet"
- "Stallion market analysis" → "Stallion has built a defensible niche in Norwegian aftermarket parts distribution, but must move in the next 12–18 months to capture the Nordic expansion window before a better-capitalised competitor does"
- "Q2 project status" → "The project is on track for delivery but a resource gap in workstream 3 requires a steering committee decision this week"

## Top-Down Logic (Pyramid Principle)

Start with the answer, then support it. Never build bottom-up (analysis → conclusion) in a deck.

```
Governing thought (the answer)
├── Key message 1 (supports the governing thought)  →  Slide 2
│   ├── Evidence / data point
│   └── Evidence / data point
├── Key message 2  →  Slide 3
│   └── Evidence / data point
└── Key message 3  →  Slide 4
    └── Evidence / data point
```

Each slide = one key message. The action title states the message. The slide body provides the evidence.

**Test:** Cover the slide body with your hand. Does the action title alone advance the argument? If not, rewrite it.

## SCR Structure (Situation–Complication–Resolution)

Use as the backbone for proposal and briefing decks.

- **Situation:** Context the audience already accepts as true. Establishes shared ground.
  Example: "The Norwegian outbound tourism market grew 12% in 2024."
- **Complication:** The tension or problem that makes the situation unstable. Creates the need for action.
  Example: "Despite this, the infrastructure serving these tourists is fragmented, founder-owned, and undercapitalised."
- **Resolution:** The answer — what the subject of the deck does about the complication.
  Example: "DWS's acquisition creates a platform to consolidate and scale these assets behind institutional capital."

The governing thought is typically the Resolution stated as a single declarative sentence.

## MECE

Key messages must be Mutually Exclusive, Collectively Exhaustive:
- **Mutually exclusive:** no two slides cover the same point. If two action titles could describe the same content, merge them.
- **Collectively exhaustive:** together, the slides fully prove the governing thought. Nothing a sceptical partner would ask is left unanswered.

**Check:** After writing all action titles, ask: "Is there any overlap? Is there a gap?" If yes, restructure before writing content briefs.

## Action Title Checklist

Run this on every slide title before presenting the storyline for review:

- [ ] Complete declarative sentence (subject + verb + so what)
- [ ] States the slide's conclusion, not its topic area
- [ ] Could stand alone as a memo bullet
- [ ] ≤ 2 lines at 31.7px Arial (roughly ≤ 120 characters including spaces)
- [ ] No vague labels — not "Market overview", "Competitive dynamics", "Our team"
- [ ] Read the titles in sequence: do they form a coherent argument without the slide bodies?

**HTML format for action titles:**
```html
<h2 class="action-title"><strong>Section label</strong> | The declarative so-what sentence goes here</h2>
```
The bold part before the pipe is the section label (optional shorthand). Everything after the pipe is the action title proper.

**Proposal exception:** The personal intro/thank-you slide (slide 2) has no action title — it uses a `<div class="panel-sub">` heading instead. Credential slides (4–6) use descriptive headers. From the first substantive slide onward, all titles must be declarative.
