# Contributing

Thanks for wanting to improve Content Machine. The repo runs on one hard rule, so read
this first — it's short.

## The one rule: machinery is public, the person is private

Everything in this repo is one of two things:

- **Machinery** — scripts (`scripts/`), slash commands (`.claude/commands/`), skills
  (`.claude/skills/`), personas (`personas/`), templates (`*.template.md`), and the
  dashboard code (`dashboard/index.html`). This is what PRs touch.
- **A person** — filled-in voice guides, pulled data (`me.json`, `creators*/`,
  `analysis/`), vault ideas, drafts, keys. All gitignored. **Never** commit these, never
  include real account data, transcripts, or engagement dumps in a PR, issue, or fixture.
  If a test needs data, invent an obviously fake sample.

If `git status` shows a file that describes a human rather than a mechanism, it does not
belong in your commit.

## Ground rules for changes

- **The AI never invents the user's content.** Any feature that makes the model generate
  opinions, anecdotes, or numbers on the user's behalf breaks the core design — it will
  be rejected. Extraction, structuring, scoring, and questioning are the moves.
- **Local-first.** New features must not upload user data anywhere. Reading the user's
  own sources (their email, their meeting exports) is fine; phoning home is not.
- **Keys via `.env.local`** (see `.env.example`) or env vars. Never a hardcoded path or
  key, and never a default that points outside the repo.
- **Templates, not working copies.** If your feature needs a per-user file, ship
  `thing.template.md`, teach `scripts/init.sh` to create the working copy, and add the
  working copy to `.gitignore`.
- Keep scripts dependency-free Node (`.mjs`, no npm install) where possible — that's why
  a non-coder can run this repo.

## Good first contributions

- New source pullers (a platform's public data → `creators_*/` shape)
- New personas for the interview panel or council (with a distinct angle of attack)
- New skills under `.claude/skills/` (usage-only, like `content-scout`)
- Dashboard improvements that render existing data better
- Docs that lower the barrier for non-technical users

## Workflow

1. Fork, branch, make the change.
2. `node --check` any script you touched; run `scripts/init.sh` on a fresh clone if you
   changed setup.
3. Open a PR with a plain-language description of what a user can now do.
