---
description: Adapt a finished piece across platforms following the content pyramid
argument-hint: [what to make, e.g. "3 tweets and 2 LinkedIn posts"]
---

Maximize the return on one piece of thinking. Based on the content pyramid model: one pillar
piece feeds many derivatives.

Request: $ARGUMENTS

## Step 1: Load

- The finished piece: `drafts/<slug>/final.md`, or `published/` if it's already out
- `voice/voice-guide.md` — especially the **per-platform adaptations** section
- `voice/style-guide.md` — platform lengths, formats, and promotion rules
- `drafts/<slug>/transcript.md` — **read this too**

The transcript matters here. It usually contains good material that didn't fit the main
piece — a tangent, a second story, a line that was strong but off-topic. Those make the
best derivatives, and they're already in the user's own words.

If no format was specified, propose a set based on the platforms in `style-guide.md`.

## Step 2: Adapt, don't summarize

A derivative is not a compressed version of the pillar. Each one should **stand alone** and
be worth reading by someone who never sees the original.

- **Single post (X/LinkedIn)** — take *one* idea from the piece, not all of them. The best
  derivative is usually a single strong paragraph expanded, not the whole thing shrunk.
- **Thread** — needs its own structure: hook, escalating beats, payoff. Not the essay with
  line breaks inserted.
- **LinkedIn post** — hook must survive the "see more" fold. Front-load the specific.
- **Newsletter section** — can carry more context and a slower build.
- **Video/audio script** — spoken cadence, shorter sentences, more repetition than text
  tolerates.

Rules that still apply, unchanged:

- No new specifics. Everything traces to the pillar or the transcript.
- Register stays consistent with the voice guide.
- Promotion rules from `style-guide.md` apply per-piece, not per-batch — don't stack a CTA
  onto every derivative.

## Step 3: Vary the angles

If producing multiple pieces for the same platform, each must take a **different angle** —
different hook, different idea, different structure. Three posts that are visibly the same
post reworded will read as automation, which defeats the whole system.

State the angle for each so the user can see the spread:

```
**LinkedIn 1** — angle: the failure story
**LinkedIn 2** — angle: the contrarian claim, no narrative
**X thread** — angle: the tactical walkthrough
```

## Step 4: Output

Write to `drafts/<slug>/repurposed/` as one file per piece, named by platform and angle.
Show them all in the conversation.

Flag anything you'd send back through `/council` — if a derivative's hook is weak, say so
rather than shipping six pieces of uneven quality.
