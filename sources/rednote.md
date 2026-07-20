# 小红书 / RedNote Sources

**Manual capture only.** There's no reliable automation here, and it's better to know that
than to build a scraper that breaks silently.

## Why this one is different

No public API. Aggressive anti-scraping and login walls. Most content is images with text
baked in, so even successful scraping returns pictures, not words.

So: manual. But see the workaround below — for the creators who matter most, you may not
need RedNote at all.

---

## 张咋啦 / Zara Zhang — the anchor account

**She is one person across three platforms.** Worth stating plainly since the names look
unrelated:

| Platform | Identity | Automatable |
|---|---|---|
| 小红书 | 张咋啦 — 2万 → 18万 followers, ~500 posts | ✗ |
| X | [@zarazhangrui](https://x.com/zarazhangrui) | ✓ |
| Substack | [Zara's Newsletter](https://zarazhang.substack.com/) | ✓ RSS |
| GitHub | [zarazhangrui](https://github.com/zarazhangrui) | ✓ |

**Background:** Harvard '17, psychology. The Information (reporter) → GGV Capital (analyst) →
ByteDance (product marketing, then new AI products). Built [LongCut](https://www.longcut.ai/)
— turns long videos into topic-driven learning — nights and weekends, via vibe coding, with no
traditional engineering background.

**Why she's the right anchor for your list:** her whole beat is the non-technical person
becoming AI-capable. She grew 2万→18万 on 小红书 by documenting that transition rather than
by having credentials. If your angle is AI-for-normal-people rather than AI-for-engineers,
she has already run the experiment you're running.

**Her stated principles**, worth arguing with rather than just adopting:
- 关注产品人，不关注媒体人 — follow product people, not media people
- Only recommend AI products you deeply use yourself
- 只要掌握信息源，中国和硅谷没有信息差
- 想做 AI 相关的工作，可以从使用 AI 工具开始"蹭 AI"

### The workaround

**Track her on X and Substack instead.** The same thinking appears there in scrapeable form,
and both are already in `sources/x-accounts.md` and `sources/substacks.md`. RedNote becomes
optional bonus rather than a maintenance burden.

This generalizes: for any creator posting to both RedNote and X/Substack, track the
automatable platform. Reserve manual capture for RedNote-only voices.

### Also worth reading, not just following

- **[follow-builders](https://github.com/zarazhangrui/follow-builders)** (~5.7k stars) — her
  open-source AI builders digest, monitoring X and YouTube podcasts. This is the Oracle's
  external half, already built. Read it before investing further in `/scan`.
- **[frontend-slides](https://github.com/zarazhangrui/frontend-slides)** (~25k stars) — you
  already have this installed as a Claude Code skill.
- **codebase-to-course** — another Claude Code skill of hers.

---

## The manual workflow, for RedNote-only creators

When you see a post worth responding to:

1. Screenshot it into `inputs/saved/`
2. **Write one line about why you saved it**

That second step is the whole thing. The Oracle doesn't need the post — it needs *your
reaction to* the post. "Saved because she's right about AI PM roles but wrong that it's a
China-only phenomenon" is a content spike. A bare screenshot is not.

Slower than RSS, better ideas per item, because the filtering already happened in your head.

## Add creators

| Handle | Who | Why | Also on |
|---|---|---|---|
| 张咋啦 | Zara Zhang — AI + 文科生 angle | See above | X, Substack ← track there |
| | | | |

## What RedNote is uniquely good for

Worth the manual effort specifically for:

- **Chinese-market AI product takes** that never surface on English X
- **The 职场 / career-transition angle** on AI — a much bigger conversation there than on X
- **Consumer AI adoption** — RedNote discusses *using* these tools where X discusses building them

If your angle is AI-for-normal-people, this is the highest-value list in the folder despite
being the most annoying to maintain.
