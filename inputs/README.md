# Inputs

Raw material for `/oracle`. It scans this folder for anything modified in the **last seven
days**, hunting for "content spikes" — things you said with unusual energy, or repeated
across conversations.

## What to put here

The more unfiltered, the better. The Oracle is looking for what you were *already* thinking
about, not what you think you should write about.

- **Meeting notes / transcripts** — Granola, Otter, Fathom exports
- **Slack exports** — channels where you actually argue about things
- **Voice memos** — transcribed. Your unedited spoken takes are the richest source here.
- **Saved links** — with a line on why you saved it, which matters more than the link
- **Draft fragments** — half-finished thoughts, notes-app dumps
- **Screenshots of posts you reacted to** — especially ones you disagreed with
- **Newsletters you read all the way through**

## Suggested structure

```
inputs/
├── meetings/2026-07-15-standup.md
├── slack/product-channel-export.md
├── voice-memos/2026-07-18-shower-thought.md
├── saved/
└── notes/
```

## Privacy

This folder is **gitignored by default** — it holds meeting notes and Slack exports that
shouldn't go to GitHub. If you want a shared corpus, remove the `inputs/` line from
`.gitignore` deliberately, after you've checked what's in here.

Same applies to `drafts/` and `published/`, which are also ignored by default.
