# Content Machine

A six-step content system that turns raw thinking into publishable posts without AI slop.
Adapted from Alex Lieberman's (Morning Brew, Tenex) Claude workflow.

## The core principle

**The AI never invents ideas or sentences. It structures yours.**

Slop comes from asking a model to write *about* a topic. This system asks you questions
until you've said something worth publishing, then formats what you actually said. Every
sentence in a final draft should trace back to something the user spoke or wrote.

If you find yourself generating an opinion, an anecdote, or a specific number that the user
did not supply — stop and ask instead. That is the whole system.

## Repository map

| Path | What it holds |
|---|---|
| `voice/style-guide.md` | Who the user is, what they promote, hard constraints |
| `voice/voice-guide.md` | Codified voice: hooks, structures, language patterns |
| `voice/content-lessons.md` | Append-only log of mistakes the system has made |
| `personas/interview-panel.md` | The six interviewers |
| `personas/writers-council.md` | The six reviewers + scoring rubric |
| `inputs/` | Raw source material for the Oracle (exports, notes, links) |
| `vault/ideas.md` | Ranked idea backlog; unused Oracle ideas land here |
| `drafts/` | Working drafts, one folder per piece |
| `published/` | Final published versions, used by the lessons loop |

## The six steps

Each step is a slash command in `.claude/commands/`. Run them in order, or jump in anywhere.

1. `/oracle` — scan inputs, produce 15 ranked ideas, save leftovers to the Vault
2. `/interview` — six personas interrogate the user until real specifics emerge
3. `/draft` — turn the transcript into a post, calibrated to the voice guides
4. `/council` — six reviewers score it 1-10; below 9 average triggers a revision loop
5. `/lessons` — diff the AI draft against what was actually published, extract lessons
6. `/repurpose` — adapt the winning piece across platforms

Bootstrap: `/bootstrap-voice` builds `voice-guide.md` from the user's past posts. Run this first.

## Rules that override default behavior

**Never write in the user's voice from imagination.** Read `voice/voice-guide.md` and
`voice/content-lessons.md` before producing any draft. If `voice-guide.md` is still the
unfilled template, say so and run `/bootstrap-voice` rather than guessing.

**Never fabricate specifics.** Numbers, dates, company names, quotes, and anecdotes come
from the interview transcript or the input files. Anything you need but don't have becomes
a `[NEEDS: ...]` marker in the draft, not an invention.

**Voice input is expected.** The user often dictates (Wispr Flow or similar), so transcripts
will contain filler, false starts, and run-ons. Preserve the *thinking* and the phrasing that
sounds like them; clean up only the disfluency. Do not smooth their register into neutral
business English — that flattening is the most common failure mode here.

**Every draft folder gets the same shape:**
```
drafts/YYYY-MM-DD-slug/
├── transcript.md    # raw interview output
├── draft.md         # current working draft
├── council.md       # scores and feedback per round
└── final.md         # what went out the door
```

**The lessons file is sacred.** Only append to `voice/content-lessons.md` when the user
explicitly approves a lesson. Never rewrite or prune it without being asked.

## Banned patterns

These appear in `content-lessons.md` as hard rules, repeated here because they matter most:

- No "In today's fast-paced world" / "In an era of" openers
- No "It's not just X, it's Y" constructions
- No triads of adjectives where one would do
- No em-dash-heavy rhythm that reads as machine cadence
- No "Here's the thing:" or "The truth is:" as filler pivots
- No closing with a question the user wouldn't actually ask
- No hedging ("perhaps", "arguably", "it could be said") unless the user hedged
