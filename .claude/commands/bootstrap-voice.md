---
description: Generate voice-guide.md by analyzing the user's best-performing past posts
---

Build `voice/voice-guide.md` from the user's actual writing. This is the setup step — run
once, then refresh every few months as the voice evolves.

## Step 1: Gather the corpus

Ask the user for **10–20 of their best-performing posts**. Accept any of:

- Pasted directly into the conversation
- A file or folder path (check `inputs/` first — read anything already there)
- A profile URL to fetch

Push for *high performers specifically*, not a random sample — the goal is to codify what
works for them, not what they happen to write. If they give fewer than 8, warn that the
analysis will be thin but proceed.

Also ask which posts they consider their **worst** or most off-voice, if they have any.
Contrast is the fastest way to find the anti-patterns section.

## Step 2: Analyze

Read every post completely before writing anything. Then extract, with **direct quotes as
evidence for every claim** — never assert a pattern you can't point at:

- **Core DNA** — 3–5 sentences describing what makes this writing recognizable
- **Hook formulas** — the opening moves that recur; name each, quote a real example, note
  when it's used
- **Content structures** — the skeletons underneath (setup → turn → payoff shapes)
- **Language patterns** — sentence length and variance, paragraph length, punctuation
  habits, vocabulary they reach for, vocabulary conspicuously absent, how they handle
  numbers, how they open, how they close
- **Signature moves** — the 3–5 distinctly-theirs things
- **Anti-patterns for this voice** — constructions that are fine generally but wrong here
- **Per-platform adaptations** — how the voice shifts across LinkedIn / X / newsletter

Count things. "Average sentence 14 words with high variance; shortest 3, longest 41" is
usable. "Varied sentence length" is not.

## Step 3: Write the file

Overwrite `voice/voice-guide.md` completely, following its existing section structure.
Remove the `STATUS: TEMPLATE` banner at the top.

Every pattern needs a real quoted example from their corpus. A voice guide full of
generic descriptors is worse than no voice guide — it produces confident slop.

## Step 4: Verify

Show the user the Core DNA and Signature Moves sections and ask directly: **does this sound
like you, or does it sound like a description of a generic good writer?** Revise until they
say yes. That confirmation is the whole point of the step.

Then remind them to fill in `voice/style-guide.md` by hand — it's the one file the machine
can't generate.
