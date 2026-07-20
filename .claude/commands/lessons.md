---
description: Diff the AI draft against what was actually published and extract lessons
argument-hint: [draft folder slug, optional]
---

The reinforcement loop. This is what makes the system compound — every edit the user made
by hand becomes a rule the machine follows next time.

## Step 1: Get the published version

Ask the user to paste **exactly what they published**, or point to a URL to fetch. Save it
to `published/YYYY-MM-DD-<slug>.md`.

If they published the draft unchanged, say so and stop — there's nothing to learn, and that's
a good sign. Note the clean pass in the council log.

## Step 2: Diff

Compare `drafts/<slug>/final.md` against the published version. Categorize every change:

- **Cuts** — what did they delete? (the highest-signal category by far)
- **Rewrites** — which sentences did they replace, and what with?
- **Additions** — what did they add that the machine didn't have?
- **Reorderings** — what moved, and why might it have?
- **Register shifts** — where did they make it sound more like themselves?

Quote both versions for each meaningful change. Ignore pure typo fixes.

## Step 3: Generalize

For each change, ask: **is this a one-off, or a rule?**

A rule is something that would apply to the next piece too. "Cut the sentence about Q3
revenue" is a one-off. "Cut any sentence that restates the previous sentence with different
words" is a rule.

Be strict here. Over-generalizing from a single edit is how the lessons file fills with
noise and starts contradicting itself. If you're unsure whether something is a pattern,
say so and let the user decide.

Pay special attention to:
- Anything the user cut that the machine thought was good — that's a taste gap
- Register changes — those mean the voice guide is off, and may warrant a `/bootstrap-voice` refresh
- Additions of specifics — that means the interview missed something it should have caught

## Step 4: Propose

Present each candidate lesson in the `content-lessons.md` format:

```
## <today's date> — <short rule>
**What I did:** <quote the draft>
**What the user changed it to:** <quote the published version>
**Generalizable rule:** <what to do differently every time>
```

Ask the user to approve each one individually. **Do not write anything to
`voice/content-lessons.md` without explicit approval** — that file is the machine's long-term
memory and a bad rule there poisons every future draft.

## Step 5: Append

Append approved lessons under the `## Learned rules` heading. Append only — never rewrite or
reorder existing entries.

If more than three lessons came out of one piece, flag it: that usually means `voice-guide.md`
is drifting from how the user actually writes, and it's worth re-running `/bootstrap-voice`
with recent posts.
