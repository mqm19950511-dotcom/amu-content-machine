// Fix dead note links by attaching xsec_token.
//
// Bare https://www.xiaohongshu.com/explore/<id> URLs get walled by XHS
// (error 300031 当前笔记暂时无法浏览) unless the URL carries an xsec_token.
// Tokens are not exposed by user-posted-notes endpoints, but search_notes
// results DO include them. Strategy per file (me / one creator):
//   1. search distinctive title slices of the untokenized top notes;
//   2. harvest id→token for ANY stored note that shows up in results
//      (one search can fix several notes — important for creators whose
//      notes all share one series title like 「独居日记」);
//   3. notes that never surface in search get a search-page URL as fallback,
//      so the click always lands somewhere useful (needs XHS web login).
//
// Usage: node scripts/xhs_fix_links.mjs [topN]
// Cost: ≤ ~(unique titles) × $0.001. Paced 4s to dodge 429s.

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const ENV = process.env.TIKHUB_ENV_PATH || path.resolve(root, '.env.local');
let KEY = process.env.TIKHUB_API_KEY;
if (!KEY && fs.existsSync(ENV)) KEY = fs.readFileSync(ENV, 'utf8').match(/^TIKHUB_API_KEY=(.*)$/m)?.[1];
if (!KEY) { console.error('No TIKHUB_API_KEY'); process.exit(1); }
KEY = KEY.trim().replace(/^["']|["']$/g, '');

const BASE = 'https://api.tikhub.io';
const H = { Authorization: `Bearer ${KEY}` };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const TOP_N = +(process.argv[2] || 5);

const withToken = (id, token) =>
  `https://www.xiaohongshu.com/explore/${id}?xsec_token=${encodeURIComponent(token)}&xsec_source=pc_search`;
const searchUrl = title =>
  `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent((title || '').toWellFormed().replace(/�/g, ''))}&source=web_explore_feed`;
const hasToken = n => (n.url || '').includes('xsec_token=');

// one search call → map of noteId → xsec_token for every hit in the result page
async function searchTokens(keyword, attempt = 1) {
  const kw = (keyword || '').replace(/[\s#【】\[\]]+/g, '');
  if (kw.length < 2) return {};
  const url = `${BASE}/api/v1/xiaohongshu/app_v2/search_notes?keyword=${encodeURIComponent(kw.slice(0, 20).toWellFormed().replace(/�/g, ''))}&page=1&sort=general`;
  try {
    const r = await fetch(url, { headers: H });
    if (r.status === 429 && attempt <= 3) { await sleep(8000 * attempt); return searchTokens(keyword, attempt + 1); }
    if (!r.ok) return {};
    const j = await r.json();
    const out = {};
    for (const i of j?.data?.data?.items || []) {
      if (i?.note?.id && i.note.xsec_token) out[i.note.id] = i.note.xsec_token;
    }
    return out;
  } catch { return {}; }
}

let fixed = 0, fallback = 0, skipped = 0;

async function fixFile(file, limit, creatorName) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const notes = data.notes || [];
  const sorted = [...notes].sort((a, b) => ((b.likes || 0) + (b.saves || 0)) - ((a.likes || 0) + (a.saves || 0)));
  const pending = new Map();   // id → note, top-N without token
  for (const n of sorted.slice(0, limit)) {
    if (hasToken(n)) skipped++;
    else pending.set(n.id, n);
  }
  if (!pending.size) return;

  // query plan: one query per unique title slice + creator name as a backup query
  const queries = new Set();
  for (const n of pending.values()) {
    const t = (n.title || '').replace(/[\s#【】\[\]]+/g, '').toWellFormed().replace(/�/g, '');
    if (t.length >= 4) queries.add(t.slice(0, 12));
  }
  if (creatorName) queries.add(creatorName);

  let touched = false;
  for (const q of queries) {
    if (![...pending.keys()].length) break;
    const tokens = await searchTokens(q);
    for (const [id, token] of Object.entries(tokens)) {
      const n = pending.get(id);
      if (n) {
        n.url = withToken(id, token);
        pending.delete(id);
        fixed++; touched = true;
        process.stdout.write(`  ✓ ${n.title.slice(0, 24)}\n`);
      }
    }
    await sleep(4000);
  }

  // fallback: search-page URL, so the click is never a dead end
  for (const n of pending.values()) {
    n.url = searchUrl(n.title);
    fallback++; touched = true;
    process.stdout.write(`  → 搜索页兜底: ${n.title.slice(0, 24)}\n`);
  }

  if (touched) fs.writeFileSync(file, JSON.stringify(data, null, 1));
}

const meFile = path.join(root, 'me.json');
if (fs.existsSync(meFile)) {
  console.log('— 修复我的笔记链接 —');
  const me = JSON.parse(fs.readFileSync(meFile, 'utf8'));
  await fixFile(meFile, Infinity, me.profile?.name);
}

const cDir = path.join(root, 'creators');
if (fs.existsSync(cDir)) {
  for (const f of fs.readdirSync(cDir).filter(f => f.endsWith('.json'))) {
    const c = JSON.parse(fs.readFileSync(path.join(cDir, f), 'utf8'));
    console.log(`— ${c.name || f}（前 ${TOP_N} 篇）—`);
    await fixFile(path.join(cDir, f), TOP_N, c.name);
  }
}

console.log(`\n完成: ${fixed} 条带令牌, ${fallback} 条转搜索页兜底, ${skipped} 条本来就有`);
