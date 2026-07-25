---
description: Interactive setup — collect the user's language, data-access method, account ID, and who they follow, then run the full pull → analyze → build pipeline
argument-hint: (no args — this is interactive)
---

Onboard a new user of the Content Machine. Walk them through setup **interactively**, one
question at a time, then run the whole pipeline end to end in their chosen language.

Do not assume answers. Ask, wait, confirm. Keep it friendly and brief.

## Step 1 — Language

Ask: **"What language should your dashboard and analysis be in — English or Chinese?"**

Store the choice as `LANG` (`en` or `zh`). Everything the pipeline *generates* — the dashboard
UI, every AI analysis, the landscapes, the vault ideas — is produced in this language. Source
content (the user's own posts, other people's tweets and articles) always stays in its original
language; never translate a real post.

## Step 2 — Data access (two options)

Ask how they want to pull data:

**A) TikHub API key (paid, simplest).** A [TikHub](https://tikhub.io) key, pay-as-you-go
(~a few cents per onboarding). Put `TIKHUB_API_KEY=...` in a `.env.local` file at the repo root,
or `export` it. Verify before continuing:
`curl -s -H "Authorization: Bearer $TIKHUB_API_KEY" https://api.tikhub.io/api/v1/tikhub/user/get_user_info`
should return `"code":200`. This is what the `scripts/*_creator.mjs` pullers use by default.

**B) Their own login cookie (free).** Instead of paying, the user can pull with their own
logged-in session cookie from the platform. Free, but more setup and more fragile (cookies
expire; the requests run as their own account). If they choose this, use the browser-automation
tools to read their timeline or a profile while they're logged in, or have them paste a cookie
for a direct-fetch variant. Prefer TikHub unless they specifically want free.

Substack needs nothing either way (free RSS).

## Step 3 — Their account

Ask for their **Xiaohongshu (RED) ID** — either the internal hash (24 hex chars) or the numeric
RED ID from their profile. If they give a numeric RED ID, also ask for their handle so the
script can resolve it:
```bash
node scripts/xhs_me.mjs <hash_id>
node scripts/xhs_me.mjs <red_id> "<handle>"   # resolves via search
```
This writes `me.json`. Confirm the profile that comes back is really them (name + follower count).

## Step 4 — Who they follow

Ask three things (all optional — they can skip any):
1. **Niche keywords** (to discover creators). The default set is AI/career; edit the `KEYWORDS`
   array in `scripts/xhs_discover.mjs` to match what they answer.
2. **X handles** they follow → edit the `TOP` array in `scripts/x_creator.mjs`.
3. **Substack feeds** they follow → edit the `FEEDS` map in `scripts/substack_creator.mjs`.

If they don't know, the built-in defaults (AI builders) are a fine starting point.

## Step 5 — Pull everything

```bash
node scripts/xhs_discover.mjs            # rank creators in their niche  -> xhs_authors.json
node scripts/xhs_creator.mjs --top 24    # pull those creators' posts    -> creators/
node scripts/x_creator.mjs --list        # pull X builders               -> creators_x/
node scripts/substack_creator.mjs --list # pull Substack feeds           -> creators_sub/
```
These are paced against rate limits — let them run.

## Step 6 — Analyze (in LANG)

Generate the digests first (pure transform, no API cost):
```bash
node scripts/make_digests.mjs   # raw pulls -> analysis/**/[id]-digest.md + me-digest.md
```
Then run the analysis. Pass `LANG` to every analysis agent so all output
is in the user's language:
- `scripts/analyze_creators.wf.js` — per-creator Xiaohongshu analysis
- `scripts/analyze_sources.wf.js` — per-account X + Substack analysis
- one agent each for the three landscapes (Xiaohongshu / X / Substack) and the user's own
  content analysis

Each agent's *instructions* are English; each ends with **"write all output in {LANG}"**. Every
workflow script reads `LANG` from `args`. Results are written under `analysis/`. See those
scripts for the exact schemas.

## Step 7 — Build + serve

```bash
node scripts/build_dashboard.mjs --lang <en|zh>   # -> dashboard/data.js + me.js, stamps UI language
node scripts/serve.mjs                             # -> http://localhost:8420
```
Open it and confirm it renders in their language. The UI also has a live EN/ZH toggle.

## Step 8 — Point them at the creation pipeline

The intelligence is ready; the creation pipeline runs on it:
- `/oracle` -> ranked ideas (Vault)
- `/bootstrap-voice` -> a voice profile from their posts
- `/draft` -> a Vault idea written in their voice
- `/council` -> six reviewers score it

## Notes

- **Nothing pulled or generated is committed** — it's all gitignored and regenerable from the ID.
  Re-run `/onboard` any time to refresh.
- **Completion rate, impressions, and view counts are owner-only** — no public API exposes them.
  You get likes / saves / comments / shares.
