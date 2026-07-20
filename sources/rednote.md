# 小红书 / RedNote Sources

**Status: automatable.** Earlier versions of this file said manual-only — that was wrong.
TikHub's `xiaohongshu/app_v2/search_notes` endpoint works, costs **$0.001/request**, and
returns title, description, author, and engagement in one call.

The list below is **not hand-curated or guessed** — it's the output of
`scripts/xhs_discover.mjs`, which searched 20 AI-related keywords, collected 400 notes from
344 creators, and ranked by how many distinct keywords each creator surfaced in. Appearing
under multiple keywords is the signal that matters: it separates durable voices from one-hit
viral posts.

Re-run it quarterly. Total cost per run: **$0.02**.

Profile URLs: `https://www.xiaohongshu.com/user/profile/<id>`

---

## The anchor: 张咋啦 / Zara Zhang

`59757acd50c4b45e6e9a90df` — 3 keywords, 7 posts, **50.7k 赞 / 56.6k 藏**

Second-highest engagement in the entire scan and the only creator whose posts are about the
*content system itself* rather than just AI tools. Her recent titles:

- 文科生才是 vibe coding 最大的受益者
- **如何一年在Twitter涨粉7万：我做内容的方法** ← read this one first
- 30分钟完整版：4个可以落地的AI原生工作方式
- 把 Claude Code 接入飞书，太爽了！教程+演示
- 近期让我眼前一亮的4个AI产品

**One person, four platforms:** 小红书 张咋啦 · X [@zarazhangrui](https://x.com/zarazhangrui) ·
[Substack](https://zarazhang.substack.com/) · [GitHub](https://github.com/zarazhangrui).
Harvard '17 psychology → The Information → GGV → ByteDance. Built [LongCut](https://www.longcut.ai/)
by vibe coding with no engineering background. Also wrote
[follow-builders](https://github.com/zarazhangrui/follow-builders) — an open-source AI builders
digest that is essentially this system's Oracle, already built.

Her stated principles, worth arguing with rather than adopting wholesale:
关注产品人不关注媒体人 · only recommend products you deeply use · 只要掌握信息源，中国和硅谷没有信息差

---

## Highest signal — 3+ keywords

| Creator | ID | Keywords | 赞/藏 | Beat |
|---|---|---|---|---|
| 里昂说AI | `69120fe4000000003700b048` | 4 | 81.8k / 161k | Top engagement in the whole scan. Codex, AI tooling, beginner-accessible. |
| 张咋啦 | `59757acd50c4b45e6e9a90df` | 3 | 50.7k / 56.6k | See above |
| 帽米星CapriceS | `5bde53546ac94f000190fa2b` | 3 | 1.4k / 1.8k | Indie building + monetization. Ships and reports numbers. |
| 🐸阿蛙学AI | `60c1e0cb000000000101c977` | 3 | — | GEO, getting AI to recommend your product. Niche and practical. |

## Vibe coding / building

The richest vein for your angle — people documenting real workflows, not tool roundups.

| Creator | ID | 赞/藏 | Why |
|---|---|---|---|
| 石不敢当 | `65380914000000000301de27` | 9.5k / 12.1k | 每天vibe coding7小时这是我的完整工作流 — a real documented process |
| 流心小蛋挞 | `5a4e4cb94eacab045467736e` | 6.6k / 7.0k | 0基础vibe coding，3天上线第一个网站 |
| 麻省理工长毛兔 | `5ebb39850000000001007441` | 6.7k / 8.2k | 当普通人用"AI杠杆"放大自己能创造的价值 |
| 老A的AI研究所 | `6355eca2000000001901e148` | 2.6k / 3.2k | Long-form Vibe Coding and Agent tutorials |
| John Wayne | `54e9dff9b4c4d642702faf7a` | 1.4k / 1.0k | 深度使用三个月，Claude Code最佳实践 — you use Claude Code |
| 童蒙l53 | `67544304000000000800834e` | 930 / 464 | 我用了3个月Claude Code后，终于不再焦虑了 |

## 文科生 / career transition

Your stated angle. Consistently high save-rates — people bookmark these.

| Creator | ID | 赞/藏 | Why |
|---|---|---|---|
| 樱桃小丸纸 | `699d2f1f000000001d000496` | 5.6k / 4.5k | 推荐所有文科生转行AI产品 (+ 续集) |
| Alex-88 | `5f4220aa0000000001001eb2` | 9.1k / 5.9k | 现在做AI Agent 约等于2020年做自媒体 — strong framing to push against |
| 今天不吃鱼 | `6801bcd4000000000e01c40c` | 2.5k / 4.6k | 奉劝跳槽想进AI应用开发的别太相信Xhs — contrarian about the platform itself |
| 烦死了这破deck | `680dc928000000000e02eeb0` | 3.0k / 3.3k | 北美 AI 转型consulting, ex-MBB. Specific and unglamorous. |

## 硅谷 / 出海

| Creator | ID | 赞/藏 | Why |
|---|---|---|---|
| 硅谷AI投资Hannah | `5970639c6a6a697577c7987b` | 1.1k / 1.2k | 硅谷打工人最值得加入的AI Startup — concrete company lists |
| Mira的出海观察 | — | 12.9k / 20.8k | Highest save-rate on a single vibecoding post in the scan |
| 阿西_出海 | `576b483634609431150d43cb` | 554 / 535 | Bridges X discourse into 小红书 — direct overlap with your X list |
| 硅谷出海数据增长Carrie | `5bd9af2e1cbb180001540eef` | 1.2k / 991 | Cross-border growth |
| Apcorn椰子 | `54e5e44ae77989360ae239d8` | 544 / 466 | 挑战靠AI创业公司赚一百万美元 — build-in-public vlog |

## AI 产品经理

Dense niche, mostly interview-prep and 转行 content. Lower ceiling but high intent.

| Creator | ID | 赞/藏 | Why |
|---|---|---|---|
| AI产品阿豪 | `59850e2850c4b47ddd4668d3` | 2.6k / 2.3k | 每天拆解一个AI产品 — daily teardown series |
| Elaine产品观察 | `6a0529580000000002001001` | 2.8k / 2.0k | 每天认识一个AI产品：Codex / Cursor |
| 亚慧是个宝藏AI产品经理 | — | 1.6k / 2.3k | AI PM面试四个问题判断你的vibe coding能力 |
| 小虎柴柴 | — | 1.1k / 1.3k | 法学生在这个时代最大的红利：ai |

---

## Re-running discovery

```bash
node scripts/xhs_discover.mjs          # ~2 min, $0.02
```

Reads `TIKHUB_API_KEY` from `../wdyt/.env.local`. Edit the `KEYWORDS` array to change beats.

**Rate limiting is real:** the API 429s aggressively. The script paces at 4s between calls
with exponential-backoff retry. Without pacing, 15 of 20 calls fail — don't remove the sleeps.

**Keywords must not contain spaces.** `AI产品经理` works; `AI 产品经理` returns HTTP 400.

## Caveat on this list

Ranked by keyword-breadth and engagement, which is a proxy for *reach*, not for *quality* or
*fit with your angle*. The scan cannot tell you who is worth arguing with — that's your call.
Read a few posts from each before committing, and mark `⚡` on the ones where you think
"right, but they're missing something." The Oracle weights those up, and they generate better
ideas than the highest-engagement accounts. Put those marks in
`sources/rednote.local.md` — gitignored, unlike this file.

Search-result rank also skews toward beginner-facing content, since that's what gets saved.
The sharpest practitioners may rank lower here than they deserve.
