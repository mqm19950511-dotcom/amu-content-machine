# Content Machine

A six-step Claude Code system that turns your raw thinking into publishable posts — without
the AI slop. Adapted from [Alex Lieberman's workflow](https://www.chatprd.ai/how-i-ai/alex-liebermans-6-step-workflow-to-beat-ai-slop)
(founder of Morning Brew, now Tenex), as covered on Lenny's Newsletter's *How I AI*.

![Architecture](docs/architecture-en.png)

<sub>中文版架构图见 [docs/architecture.png](docs/architecture.png)</sub>

## The idea

Most people use AI backwards: they ask it to write *about* a topic, and get back the average
of the internet. This system never asks the model for an opinion. It interviews you until
you've said something worth publishing, then structures what you actually said.

> "AI slop is hilariously people just pointing the finger at themselves and saying,
> 'I'm not intelligent enough.'" — Alex Lieberman

The leverage is in **step 2**, not step 3. Drafting is the easy part.

## Two halves: intelligence + creation

This repo grew a second half — a **source-intelligence dashboard**. Give it a 小红书 ID (plus
optional X handles and Substack feeds) and it pulls, analyzes, and visualizes:

- **Your own content** — every post with engagement, auto-categorized, trend charts, and an
  AI content analysis (what works, what to cut, your winning formula)
- **小红书 / X / Substack sources** — per-account analysis + a cross-account *landscape* for
  each platform (top themes, 常青 vs 热点 topics, and the gaps you're positioned to fill)

That intelligence then feeds the creation pipeline: **Vault** (ranked ideas) → **Draft** (in
your voice) → **Council** (six reviewers score it).

**It's all regenerable from an ID.** The scripts are the machinery; the pulled data is
disposable and gitignored. Clone this repo, run `/onboard <your-id>`, and it rebuilds the
whole dashboard for *your* account.

```bash
node scripts/xhs_me.mjs <your-xhs-id>       # pull your content
node scripts/xhs_discover.mjs               # find creators in your niche
node scripts/x_creator.mjs --list           # pull X builders
node scripts/substack_creator.mjs --list    # pull Substack feeds
# …analyze (Claude agents), then:
node scripts/build_dashboard.mjs            # build
node scripts/serve.mjs                       # → http://localhost:8420
```

See `.claude/commands/onboard.md` for the full flow. Needs a [TikHub](https://tikhub.io) API
key (~a few cents per onboarding); Substack is free RSS.

## Setup

```bash
git clone <this-repo> && cd content_machine
./scripts/init.sh        # creates your private working copies from templates
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

Optional: the **content-scout** skill (`.claude/skills/content-scout/`) mines your own
sources for topic ideas — your email (requires the claude.ai **Gmail connector**, authorized
via `/mcp` inside Claude Code) and your local Granola meeting exports — and banks them into
the Vault's 📮/🎙️ sections. Everything is read locally; nothing is uploaded.

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
├── LICENSE · CONTRIBUTING.md · .env.example
├── .claude/
│   ├── commands/                # the six steps + onboard/scan/cover
│   ├── agents/                  # council members as parallel subagents
│   └── skills/content-scout/    # mine your email + meeting notes for ideas
├── scripts/                     # dependency-free Node: pullers, digests,
│   │                            #   build_dashboard, serve, cover, init.sh
├── dashboard/index.html         # local dashboard UI (data files gitignored)
├── voice/*.template.md          # style/voice/lessons templates
│                                #   (your filled-in copies stay local)
├── personas/
│   ├── interview-panel.md       # the six interviewers
│   └── writers-council.md       # the six reviewers + rubric
├── sources/                     # public account lists (your notes → *.local.md)
├── docs/architecture*.png       # the diagrams above (EN + 中文)
├── inputs/                      # raw material for the Oracle (local)
├── vault/ideas.template.md      # idea backlog: /oracle + 📮 email + 🎙️ meetings
├── drafts/                      # one folder per piece in progress (local)
└── published/                   # what actually went out (local)
```

## What's public and what isn't

This repo is designed to be forked and shared, so the split matters. Anything personal lives
in a gitignored working copy created from a tracked template by `scripts/init.sh`.

**Public** — the framework (`CLAUDE.md`, commands, agents, `personas/`, `scripts/`), the empty
`voice/*.template.md` files, and the curated source lists in `sources/`. Those lists are public
accounts and public engagement numbers, and they're most of what makes this repo useful to
someone else.

**Private** — your filled-in voice guides, your annotations on the source lists, and all your
material (`inputs/`, `drafts/`, `published/`, `vault/`).

The one worth understanding: `voice/voice-guide.md` is both the most personal file here and the
engine of the whole system. It's gitignored. Its template isn't. Don't edit templates in place.

Your `⚡` marks on source accounts — "this person is right but missing something" — go in
`sources/*.local.md`, also gitignored. They're useful editorial judgments about named people,
and they don't belong in a public repo under your name.

## Contributing

PRs welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). The short version: the machinery
(scripts, commands, skills, dashboard code) is public; anything personal (voice guides,
pulled data, ideas, drafts) is gitignored and must never appear in a PR.

## License

[MIT](LICENSE).

## Credits

System design by [Alex Lieberman](https://alexlieberman.com). Documented by
[ChatPRD's How I AI](https://www.chatprd.ai/how-i-ai) and
[Lenny's Newsletter](https://www.lennysnewsletter.com/p/how-i-ai-how-the-founder-of-morning).
This repo is an independent Claude Code implementation of the publicly described workflow.
