# Content Machine

A six-step Claude Code system that turns your raw thinking into publishable posts — without
the AI slop. Adapted from [Alex Lieberman's workflow](https://www.chatprd.ai/how-i-ai/alex-liebermans-6-step-workflow-to-beat-ai-slop)
(founder of Morning Brew, now Tenex), as covered on Lenny's Newsletter's *How I AI*.

## The idea

Most people use AI backwards: they ask it to write *about* a topic, and get back the average
of the internet. This system never asks the model for an opinion. It interviews you until
you've said something worth publishing, then structures what you actually said.

> "AI slop is hilariously people just pointing the finger at themselves and saying,
> 'I'm not intelligent enough.'" — Alex Lieberman

The leverage is in **step 2**, not step 3. Drafting is the easy part.

## Setup

```bash
git clone <this-repo> && cd content_machine
claude
```

Then, inside Claude Code:

```
/bootstrap-voice
```

Paste in 10–20 of your best-performing posts. This writes `voice/voice-guide.md` — the file
everything else calibrates against. Then fill in `voice/style-guide.md` by hand (who you are,
what you're promoting, what you'll never say).

Optional but recommended: install [Wispr Flow](https://wisprflow.ai) or any voice-to-text
tool. The interview step works far better spoken than typed — you say things out loud that
you'd never bother typing.

## Daily use

```
/oracle                  # 15 ranked ideas from your inputs, leftovers → vault
/interview <idea>        # six personas interrogate you until specifics emerge
/draft                   # transcript + voice guides → a real post
/council                 # six reviewers score 1-10, auto-revise below 9
/repurpose               # adapt across platforms
```

After you publish:

```
/lessons                 # diff AI draft vs. what you actually posted → new rules
```

That last one is what makes the system compound. Every edit you made by hand becomes a rule
the machine follows next time.

## The six steps

**1. The Oracle** — Scans the last seven days of your inputs (Slack exports, meeting notes,
saved links, your own drafts) for "content spikes" — things you said with unusual energy or
repeated across conversations. Returns 15 ranked ideas. Unused ones go to `vault/ideas.md`.

**2. The Interview Panel** — Six interviewer personas (Tim Ferriss, Joe Rogan, Barbara Walters,
Howard Stern, Michael Barbaro, Larry King) take turns pushing you for specifics. Each has a
different angle of attack. They don't stop until you've given a number, a name, or a story.
Output is a transcript in your own words.

**3. Drafting with Codified Voice** — Claude drafts from the transcript, using
`voice/style-guide.md`, `voice/voice-guide.md`, and `voice/content-lessons.md` as its
instruction manual. It structures your sentences; it doesn't write new ones.

**4. The Writer's Council** — Six reviewer personas (David Perell, Sean Puri, Morgan Housel,
Ann Handley, Nicolas Cole, and an "AI Slop Allergist") independently score the draft 1–10.
Average below 9 triggers an automatic revision using their feedback. Runs as parallel
subagents so scores stay genuinely independent.

**5. The Lessons Loop** — After you publish, the system diffs its final draft against your
published version and proposes generalizable lessons. You approve them, and they append to
`voice/content-lessons.md` permanently.

**6. Repurpose & Distribute** — One command adapts the piece across formats, following
per-platform rules in the voice guide.

## Repository layout

```
content_machine/
├── CLAUDE.md                    # orchestration rules Claude reads every session
├── .claude/
│   ├── commands/                # the six steps + bootstrap
│   └── agents/                  # council members as parallel subagents
├── voice/
│   ├── style-guide.md           # identity, promotion targets, hard constraints
│   ├── voice-guide.md           # generated: hooks, structures, patterns
│   └── content-lessons.md       # append-only log of past mistakes
├── personas/
│   ├── interview-panel.md       # the six interviewers
│   └── writers-council.md       # the six reviewers + rubric
├── inputs/                      # raw material for the Oracle
├── vault/ideas.md               # ranked idea backlog
├── drafts/                      # one folder per piece in progress
└── published/                   # what actually went out
```

## Credits

System design by [Alex Lieberman](https://alexlieberman.com). Documented by
[ChatPRD's How I AI](https://www.chatprd.ai/how-i-ai) and
[Lenny's Newsletter](https://www.lennysnewsletter.com/p/how-i-ai-how-the-founder-of-morning).
This repo is an independent Claude Code implementation of the publicly described workflow.
