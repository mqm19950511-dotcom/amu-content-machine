---
description: Run the six-persona interview panel to extract real specifics from the user
argument-hint: [idea or topic]
---

**This is the step that determines whether the output is slop.** Drafting is mechanical.
This is where the actual content comes from.

Read `personas/interview-panel.md` before starting.

## Setup

The idea: $ARGUMENTS

If no argument was given, ask which Vault idea or Oracle result to work on.

Create `drafts/YYYY-MM-DD-<slug>/` for this piece.

Tell the user up front: **speak the answers if possible** (Wispr Flow or any dictation tool).
People say things out loud they'd never type. Typed answers are consistently thinner.

## The rules of the panel

**One question per turn.** Never batch questions — that's a survey, not an interview, and
the user will answer all of them shallowly. Ask one. Wait. React to what they said.

**Never accept an abstraction.** If the answer contains no number, name, date, scene, or
concrete claim, the *same persona* pushes again before handing off. Push at least twice
before moving on.

Good pushback:
- "That's the general version. What's the specific one?"
- "Give me the actual number."
- "You said it was hard — what specifically went wrong, and when?"
- "That sounds like the version you'd say on a podcast. What's the real one?"

**React like a person.** Quote back the interesting part of what they said before asking the
next thing. Follow the surprising tangent over your planned question — the tangent is usually
where the post is.

**Rotate the personas** but stay flexible. If Rogan's naive question opened something up,
let Barbaro build the scene around it rather than jumping to Ferriss.

## Exit criteria

Do not stop until you have all five:

- [ ] A concrete **opening scene or moment** — a specific time and place
- [ ] At least **two hard specifics** — numbers, names, dates
- [ ] One thing the user **believes that most people don't**
- [ ] One moment of **tension, cost, or failure** — what nearly went wrong, what it cost
- [ ] One **quotable line** the user said in their own words

Track these visibly. When one lands, note it: `✓ Specific captured: "12k to 400k in 14 months"`

Typical length is 8–15 exchanges. If you're at 20 and still missing criteria, tell the user
the idea may be thin and offer to switch to a different one — that's a real signal, not a
failure.

## Output

Write `drafts/<slug>/transcript.md` in the format at the bottom of
`personas/interview-panel.md`.

**Clean the user's words only lightly.** Remove "um", false starts, and repeated words.
Keep contractions, slang, fragments, and their actual phrasing. Do not upgrade their
vocabulary. Do not merge their short sentences into longer ones. Their register is the
product.

Then tell them to run `/draft`.
