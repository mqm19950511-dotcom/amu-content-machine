// 小红书 creator discovery via TikHub.
//
// Searches each keyword, collects note authors, ranks by keyword-breadth (how many
// distinct beats a creator surfaces under) then engagement. Breadth is the signal —
// it separates durable voices from single viral posts.
//
// Cost: $0.001/request. 20 keywords = $0.02/run. Takes ~2 min.
// Usage: node scripts/xhs_discover.mjs   →  writes xhs_authors.json
//
// Two hard-won constraints, do not remove:
//   1. The 4s sleep between calls. TikHub 429s aggressively; without pacing,
//      15 of 20 calls fail.
//   2. Keywords must contain NO spaces. 'AI产品经理' works, 'AI 产品经理' → HTTP 400.

import fs from 'node:fs';
import path from 'node:path';

// Key is read from the repo-root .env.local (see .env.example), or TIKHUB_ENV_PATH.
const ENV_PATH = process.env.TIKHUB_ENV_PATH
  || path.resolve(import.meta.dirname, '../.env.local');

let KEY = process.env.TIKHUB_API_KEY;
if (!KEY) {
  if (!fs.existsSync(ENV_PATH)) {
    console.error(`No TIKHUB_API_KEY set and no env file at ${ENV_PATH}`);
    console.error('Set TIKHUB_API_KEY, or point TIKHUB_ENV_PATH at a file containing it.');
    process.exit(1);
  }
  const m = fs.readFileSync(ENV_PATH, 'utf8').match(/^TIKHUB_API_KEY=(.*)$/m);
  if (!m) { console.error(`TIKHUB_API_KEY not found in ${ENV_PATH}`); process.exit(1); }
  KEY = m[1];
}
KEY = KEY.trim().replace(/^["']|["']$/g, '');
const H = { Authorization: `Bearer ${KEY}`, 'content-type': 'application/json' };
const BASE = 'https://api.tikhub.io';
const sleep = ms => new Promise(r => setTimeout(r, ms));

// no spaces — spaces appeared to trigger HTTP 400
const KEYWORDS = [
  'AI产品经理', 'vibecoding', 'AI工具推荐', '文科生AI', 'AI创业',
  'ClaudeCode', 'AI编程', '独立开发', 'AI出海', '硅谷AI',
  'Cursor', 'AIAgent', 'AI转型', 'AI副业', 'AI学习',
  '大模型', 'prompt工程', 'AI创作者', 'AI产品', '张咋啦',
];

const authors = new Map();
let calls = 0, notes = 0, ok = [], errs = [];

async function search(kw, attempt = 1) {
  const url = `${BASE}/api/v1/xiaohongshu/app_v2/search_notes?keyword=${encodeURIComponent(kw)}&page=1&sort=general`;
  try {
    const r = await fetch(url, { headers: H });
    calls++;
    if (r.status === 429 && attempt <= 4) { await sleep(8000 * attempt); return search(kw, attempt + 1); }
    if (!r.ok) { errs.push(`${kw}: HTTP ${r.status}`); return; }
    const j = await r.json();
    const items = (j?.data?.data?.items || []).filter(x => x?.note);
    if (!items.length) { errs.push(`${kw}: 0 items`); return; }
    ok.push(`${kw}:${items.length}`);
    for (const it of items) {
      const n = it.note, u = n.user || {};
      const name = u.nickname || u.nick_name;
      if (!name) continue;
      notes++;
      const id = u.userid || u.user_id || u.id || name;
      const avatar = String(u.images || u.image || u.avatar || '').split('?')[0];
      if (!authors.has(id)) authors.set(id, { name, id, avatar, hits: 0, eng: 0, col: 0, kws: new Set(), titles: [] });
      const a = authors.get(id);
      if (!a.avatar && avatar) a.avatar = avatar;
      a.hits++;
      a.eng += Number(n.liked_count) || 0;
      a.col += Number(n.collected_count) || 0;
      a.kws.add(kw);
      const t = n.title && String(n.title).slice(0, 62);
      if (t && a.titles.length < 5 && !a.titles.includes(t)) a.titles.push(t);
    }
  } catch (e) { errs.push(`${kw}: ${e.message}`); }
}

for (const kw of KEYWORDS) { await search(kw); await sleep(4000); }

const ranked = [...authors.values()]
  .map(a => ({ ...a, kws: [...a.kws], score: a.kws.length * 20000 + a.eng + a.col }))
  .sort((x, y) => y.score - x.score);

fs.writeFileSync('xhs_authors.json', JSON.stringify(ranked, null, 1));
console.log(JSON.stringify({ calls, notes, uniqueAuthors: authors.size, ok, errs }, null, 1));
console.log('--- TOP 40 ---');
for (const a of ranked.slice(0, 40)) {
  console.log(`${a.name} | kw=${a.kws.join(',')} | hits=${a.hits} | 赞${a.eng} 藏${a.col}`);
  console.log(`   ${a.titles.join(' / ')}`);
}
