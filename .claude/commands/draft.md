---
description: Turn an interview transcript into a draft calibrated to the codified voice
argument-hint: [draft folder slug, optional]
---

Structure the user's own words into a post. **You are not writing — you are arranging.**

## Step 1: Load the instruction manual

Read all four, completely, before drafting:

1. `drafts/<slug>/transcript.md` — the raw material
2. `voice/style-guide.md` — identity, promotion rules, hard constraints
3. `voice/voice-guide.md` — hooks, structures, language patterns
4. `voice/content-lessons.md` — every mistake already made once

If `voice-guide.md` still shows `STATUS: TEMPLATE`, **stop** and tell the user to run
`/bootstrap-voice` first. Drafting without it produces generic output that will fail the
council anyway.

If no slug was given, use the most recently modified folder in `drafts/`.

## Step 2: Draft

**The sentence test:** every sentence in the draft must trace back to something in the
transcript. Not paraphrased loosely — traceable. If you're writing a sentence and you can't
point to where in the transcript it came from, you're generating, and you need to stop and
mark it instead.

Specifically:

- **Numbers, names, dates, quotes** come only from the transcript or `inputs/`. Anything
  needed but missing becomes `[NEEDS: specific figure for X]` inline. Never estimate,
  never round up, never invent a plausible-sounding number.
- **Opinions** are the user's. If the piece needs a claim they didn't make, mark it
  `[NEEDS: do you actually believe X?]` rather than asserting it on their behalf.
- **The opening** uses a hook formula from `voice-guide.md`, built from the concrete moment
  captured in the interview. Start mid-thought. No warm-up sentence.
- **The structure** follows one of the documented content structures. Name which one you
  used at the bottom of the draft.
- **The register** matches the transcript. If they said "this was a disaster," the draft
  says "this was a disaster," not "this presented significant challenges."
- **Promotion** follows the rules in `style-guide.md`. Usually that means none.
- **The close** lands on the strongest declarative line. No rhetorical question.

Re-read the banned patterns in `CLAUDE.md` and the seed rules in `content-lessons.md`
before you finalize. Those exist because they're the failures that keep happening.

## Step 3: Self-check before handing off

Go through the draft line by line and answer honestly:

- Which sentences can't I trace to the transcript?
- Could any sentence appear verbatim in someone else's post about a different topic?
- Does the first sentence contain a specific, or is it scene-setting?
- Is there anything here I made up because it sounded good?

Fix what you find. Then write `drafts/<slug>/draft.md`.

## Step 4: Report

Show the user the draft in full. Below it, list:

- **Structure used:** <which one from the voice guide>
- **Hook formula:** <which one>
- **Open `[NEEDS:]` markers:** <list them — these need the user's input>
- **Lowest-confidence line:** <the one sentence you're least sure traces back to them>

Then tell them to run `/council`.
