---
description: Run the six-reviewer Writer's Council; auto-revise until the draft scores 9+
argument-hint: [draft folder slug, optional]
---

Automated quality control. Six independent reviewers score the draft; anything below a 9.0
average gets revised and re-scored.

Read `personas/writers-council.md` for the rubric.

## Step 1: Dispatch the council

Load `drafts/<slug>/draft.md` (most recent folder if no slug given).

Spawn **all six reviewers as parallel subagents in a single message** — one Agent call each,
using the agent types in `.claude/agents/`:

- `council-perell` — resonance and idea density
- `council-puri` — hook strength and shareability
- `council-housel` — durability and truth
- `council-handley` — clarity and craft
- `council-cole` — structure and format fit
- `council-slop-allergist` — machine cadence detection

Independence is the point. Do **not** score six personas yourself in one pass — they'll
converge on a single opinion and the council becomes decorative. Each subagent sees the
draft and its own persona brief, nothing else. Do not tell any reviewer what the others said.

Pass each subagent: the full draft, its persona section from `personas/writers-council.md`,
the rubric, and the target platform.

## Step 2: Tally

```
| Reviewer | Score | Blocking objection |
|---|---|---|
| Perell | 8 | Idea is true but not surprising |
| ... | | |

AVERAGE: 8.3  → REVISION REQUIRED
```

**Thresholds:**
- Average ≥ 9.0 → passes
- Average < 9.0 → revise
- Slop Allergist < 7 → revise regardless of average (veto power)

## Step 3: Revise

Apply the specific fixes the reviewers proposed — they return rewrites, not directions, so
use them. Where two reviewers conflict, prefer the one protecting **specificity and truth**
over the one protecting polish. Housel and the Slop Allergist outrank Puri when they disagree.

**Never fix a score problem by inventing content.** If Perell says the idea isn't surprising
enough, the answer is not to manufacture a spicier claim — it's to flag that the interview
didn't surface a strong enough angle, and say so.

Re-dispatch the full council on the revised draft. Fresh subagents, no memory of round one.

## Step 4: Stop conditions

- **Passes 9.0** → write `drafts/<slug>/final.md`, note the round count
- **Three rounds without passing** → stop. Report the persistent blocking objections and
  tell the user plainly which ones require *them*, not the machine — usually a missing
  specific or a weak underlying idea. Suggest re-running `/interview` on the thin part.

Never grind past three rounds. If the council can't get there, the problem is upstream.

## Step 5: Log

Write every round's scores and feedback to `drafts/<slug>/council.md`. This is the record
`/lessons` uses later.

Show the user the final draft, the score progression across rounds, and any remaining
`[NEEDS:]` markers. Then tell them to publish, and to run `/lessons` after they do.
