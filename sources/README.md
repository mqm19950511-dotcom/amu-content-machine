# Sources

The Oracle has two halves. `inputs/` is the **internal** half — what you've been saying and
thinking. This folder is the **external** half — who you're listening to.

`/oracle` reads these lists to find response opportunities: takes you'd push back on,
consensus worth breaking, and threads where your angle is missing.

| File | Platform | How it gets scanned |
|---|---|---|
| `x-accounts.md` | X | `/scan` via browser, or manual paste |
| `substacks.md` | Substack | `/scan` via RSS — free, no auth |
| `rednote.md` | 小红书 / RedNote | `/scan` via TikHub API — $0.001/request |

## Scanning reality check

These three platforms are not equally accessible, and it's worth knowing that up front:

**Substack is easy.** Every publication exposes RSS at `<url>/feed`. `/scan` fetches these
directly. No auth, no rate limits, full post text. If you only maintain one list, maintain
this one.

**X is medium.** The API is paid and the free tier is unusable for this. `/scan` drives your
logged-in browser instead, using the Chrome tools — it reads your timeline or a List you've
built. Practical advice: **make an X List** with your AI accounts rather than relying on the
algorithmic timeline. A List is chronological, complete, and scrapeable in one page. The
timeline is none of those things.

**RedNote is easy but metered.** No public API, but TikHub proxies it — search returns title,
description, author, and engagement in one call at $0.001/request. `scripts/xhs_discover.mjs`
built the creator list in `rednote.md` this way: 20 keywords, 400 notes, 344 creators, $0.02.

Two constraints that will bite you: the API 429s aggressively (pace at ~4s between calls), and
keywords cannot contain spaces (`AI产品经理` works, `AI 产品经理` returns HTTP 400).

Manual capture still has a place. When you screenshot a post into `inputs/saved/`, write one
line about *why* — that reaction is a content spike, and it's higher-signal than anything the
API returns.

## Curation principle

Follow people you **disagree with productively**, not just people you admire. The Oracle
ranks response opportunities by tension, so a feed of accounts you nod along to will produce
15 ideas you have nothing to add to.

The best source account is one where you regularly think "that's right, but they're missing
something." Mark those with `⚡` in the lists.

## Maintenance

Prune quarterly. An account that hasn't triggered an idea in three months is noise, and the
Oracle's ranking gets worse as the list grows. Twenty sharp accounts beat two hundred.
