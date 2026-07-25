---
name: content-scout
description: Scan the user's own third-party sources (email inbox, Granola meeting notes) for content sparks and bank them as ranked ideas in the Vault, grouped by source. Use when the user says things like "找选题 / 扫邮箱 / 读会议 / 帮我更新灵感库 / find content ideas from my email or meetings". Reads only the user's own data locally; never uploads anything.
---

# Content Scout

Turn the user's own raw material — their **email** and their **meeting notes** — into ranked
Vault ideas, sorted into the right source section. This is the "选题从哪来" engine: the machine
reads what the user already has and surfaces what's worth writing.

## The one rule that governs everything

Same as the rest of Content Machine: **never invent the user's opinions.** A scanned source
yields a *spark* — a candidate angle with the source quoted. It is NOT a finished take. Real
substance still comes later from `/interview`. Scout finds the topic; it doesn't write the piece.

## Privacy (non-negotiable)

- **Nothing is uploaded.** All reading happens through the user's own local access (their Gmail
  connector, their local Granola export). Ideas are written to local, gitignored files.
- **Never read beyond scope.** Bound every email search (recent + a theme/label); skip personal
  1:1 mail and DMs unless the user names them. Ignore private message threads.
- **Never touch keys, tokens, or the keychain.** Don't try to decrypt anything.
- The Skill describes *how to read*, never *what was read*. No user data goes in the repo.

## Sources

### Email (via the Gmail connector)
The user authenticates Gmail themselves (`/mcp` → claude.ai Gmail). Then:
- Search a **bounded** slice by theme, e.g. newsletters (`from:substack.com`, `category:updates`),
  or receipts (`category:purchases`, `category:reservations`) — always with `newer_than:` limits.
- Mine each for a **content spark**, not the raw content: what angle could the user make from it,
  and why it fits their niche. Quote the source subject/sender.
- Good email themes: subscription audit, "digital footprint" (what receipts reveal), newsletter
  distillation, career/job pipeline, spending report.

### Granola (meeting notes)
Granola's local DB is encrypted, so **do not** try the DB, tokens, or keychain. Two clean paths:
- **Local export folder**: the user exports meetings (markdown/text) to a folder they name; read
  those files.
- **Public share link**: if the user sets a note to "anyone with the link" and pastes the URL,
  fetch it and extract the note body from the page data.
- Mine each meeting for spikes: a judgment the user said out loud, a claim someone pushed back on,
  a reusable framework, an insight that recurs. Quote the meeting + date.

## What to do (the flow)

1. **Confirm scope** with the user (which source, how recent, which label/folder). Never sweep a
   whole inbox by default.
2. **Read** the bounded slice from the chosen source.
3. **Extract sparks**: for each, produce `{title, angle, why, type(常青/热点), format, source, inspiration}`.
   Tie every spark to a real quote from the source. Score 1–10 against the user's niche and voice
   (read `voice/voice-guide.md` first if unsure of the voice).
4. **Bank into the Vault**, in the matching section:
   - Append to `vault/ideas.md` under the right header — `📮 外部源专区` (email) or
     `🎙️ 会议记录专区` (Granola). Append-only; never delete existing ideas.
   - Append to `vault/vault.json` `ideas[]`, each tagged `"source": "email"` or `"source": "granola"`.
   - If a meeting has full text worth keeping, save it under `inputs/granola/<date>-<slug>.md`
     (gitignored) and reference it in the idea's body.
5. **Rebuild the dashboard** so the new ideas show up, grouped by source:
   `node scripts/build_dashboard.mjs --lang zh`
   (The dashboard's Vault view groups by `source`: 🎙️会议 → 📮邮箱 → 🎯赛道.)
6. **Report** to the user: how many sparks, which section, the strongest 2–3, and remind them the
   real take still needs `/interview`.

## Hand-off

The banked ideas flow straight into the existing pipeline:
`vault` → `/interview <idea>` → `/draft` → `/council`.
Scout only fills the top of the funnel; it never drafts.
