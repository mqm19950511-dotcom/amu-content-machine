---
description: Scan inputs for content spikes and produce 15 ranked ideas
---

Defeat the blank page. Surface 15 ranked content ideas from what the user has actually been
thinking about, then bank the leftovers.

## Step 1: Scan

Read everything in `inputs/` modified in the **last seven days** (if the folder is empty or
stale, say so and ask the user to drop in material or paste it directly).

Typical inputs: Slack exports, meeting notes, saved links, voice memo transcripts, draft
fragments, newsletters they saved, screenshots of posts they reacted to.

Also read `vault/ideas.md` — some banked ideas may have become timely.

Split the scan two ways, roughly half and half:

**Internal spikes** — things *the user* said or wrote with unusual energy. Look for:
- A point they made more than once across different conversations
- Strong language: "the thing nobody gets is", "I keep telling people", "this drives me crazy"
- A specific number, result, or story they mentioned in passing
- A decision they made and explained
- Something they argued about

**External opportunities** — things happening in their world worth responding to:
- Posts from accounts they follow that they'd have a different take on
- A consensus view in their space that they'd push back on
- News in their industry where their credibility anchors give them standing

## Step 2: Rank

Score each idea against:

1. **Specificity available** — do we already have the number, story, or name that makes it
   real? Ideas with evidence sitting in the inputs rank far above ideas needing research.
2. **Earned authority** — does it sit inside the "Topics I own" list in `voice/style-guide.md`?
3. **Tension** — is there something to disagree with? Ideas everyone already agrees with
   score low regardless of how true they are.
4. **Timeliness** — is there a reason this is now?
5. **Energy** — how strongly did the user actually seem to feel about it?

## Step 3: Present

Give exactly 15, ranked, in this shape:

```
### 1. <the angle, stated as a claim — not a topic>
**Source:** <where in the inputs this came from — quote the spike>
**Specifics on hand:** <the numbers/names/stories already available>
**The tension:** <what someone would push back on>
**Format:** <LinkedIn post / thread / newsletter>
```

State it as a **claim**, not a topic. "How I think about hiring" is a topic. "We stopped
doing take-home tests and hiring got better" is an idea.

## Step 4: Bank the rest

Append every idea the user doesn't pick to `vault/ideas.md` with today's date and its source
quote. Never overwrite the vault — append only. Dedupe against what's already there.

Then ask which one they want to take into `/interview`.
