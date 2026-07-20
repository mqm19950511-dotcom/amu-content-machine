---
description: Pull recent posts from external sources into inputs/external/ for the Oracle
argument-hint: [substack | x | all]
---

Fetch the external half of the Oracle's diet. Run this before `/oracle`, or let `/oracle`
call it.

Target: $ARGUMENTS (default: `all`)

## Substack — RSS, always works

Read `sources/substacks.md`. For each publication where `Read:` isn't `never`, fetch
`<url>/feed` with WebFetch.

Pull posts from the **last 7 days only**. For each, extract:

- Title, author, date, URL
- The central claim in one sentence
- Any specific numbers or predictions made
- **What's missing or contestable** — this is the field that matters. The Oracle ranks by
  tension, so a summary with no identified gap is useless to it.

Weight `⚡`-marked publications higher; those are the ones the user reliably disagrees with.

Write to `inputs/external/substack-YYYY-MM-DD.md`.

## X — browser automation

Requires the Chrome tools. Load them in **one** call:

```
ToolSearch: select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__tabs_create_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__get_page_text,mcp__claude-in-chrome__computer
```

Then:

1. `tabs_context_mcp` first, to see what's open
2. Open a **new tab** — never hijack a tab the user is using
3. Navigate to the List URL in `sources/x-accounts.md`. If it's not filled in, stop and tell
   the user to build a List — scraping the algorithmic timeline gives incomplete, non-chronological
   results and isn't worth the tokens.
4. `get_page_text`, scroll, repeat until you've covered ~7 days or ~100 posts

Capture per post: handle, date, text, rough engagement, and **whether the user would have a
different take**. Skip retweets and pure announcements with no argument in them.

Write to `inputs/external/x-YYYY-MM-DD.md`.

**If the browser isn't connected or X isn't logged in:** say so plainly and fall back to
asking the user to paste. Don't retry more than twice — this is a known failure mode, not
something to grind on.

## RedNote

Not automatable. Read `sources/rednote.md`. Just check whether anything new landed in
`inputs/saved/` and note it for the Oracle. Don't attempt to scrape.

## Output

Report what you got:

```
Substack: 14 posts from 9 publications
X:        62 posts from your AI List
RedNote:  3 manual saves since last scan

Highest-tension items (best response opportunities):
1. <claim> — <who> — <why the user would push back>
```

That last section is the actual product of this command. Then suggest `/oracle`.
