// Fix dead note links by attaching xsec_token.
//
// Bare https://www.xiaohongshu.com/explore/<id> URLs get walled by XHS
// (error 300031 当前笔记暂时无法浏览) unless the URL carries an xsec_token.
// Tokens are not exposed by user-posted-notes endpoints, but search_notes
// results DO include them. So for each stored note we search a distinctive
// slice of its title, match by note id, and graft the token onto the URL.
//
// Scope: all of me.json + top N notes per pulled creator (default 5 —
// link-clicking is a top-notes activity; deeper notes stay bare).
//
// Usage: node scripts/xhs_fix_links.mjs [topN]
// Cost: ~(5 + creators × topN) × $0.001. Paced 4s to dodge 429s.

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

// Find a note's xsec_token by searching its title and matching the id.
async function findToken(note, attempt = 1) {
  // a distinctive middle slice of the title, no spaces/emoji-only fragments
  const t = (note.title || '').replace(/[\s#【】\[\]]+/g, '');
  if (t.length < 4) return null;
  const kw = t.slice(0, Math.min(12, t.length));
  const url = `${BASE}/api/v1/xiaohongshu/app_v2/search_notes?keyword=${encodeURIComponent(kw)}&page=1&sort=general`;
  try {
    const r = await fetch(url, { headers: H });
    if (r.status === 429 && attempt <= 3) { await sleep(8000 * attempt); return findToken(note, attempt + 1); }
    if (!r.ok) return null;
    const j = await r.json();
    const items = j?.data?.data?.items || [];
    const hit = items.find(i => i?.note?.id === note.id);
    return hit?.note?.xsec_token || null;
  } catch { return null; }
}

const withToken = (id, token) =>
  `https://www.xiaohongshu.com/explore/${id}?xsec_token=${encodeURIComponent(token)}&xsec_source=pc_search`;

const hasToken = n => (n.url || '').includes('xsec_token=');

let fixed = 0, missed = 0, skipped = 0;

async function fixFile(file, limit) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const notes = data.notes || [];
  let touched = false;
  // top notes first — they're the ones worth clicking
  const sorted = [...notes].sort((a, b) => ((b.likes || 0) + (b.saves || 0)) - ((a.likes || 0) + (a.saves || 0)));
  const targets = new Set(sorted.slice(0, limit).filter(n => !hasToken(n)).map(n => n.id));
  for (const n of notes) {
    if (!targets.has(n.id)) { if (hasToken(n)) skipped++; continue; }
    const token = await findToken(n);
    if (token) { n.url = withToken(n.id, token); fixed++; touched = true; process.stdout.write(`  ✓ ${n.title.slice(0, 24)}\n`); }
    else { missed++; process.stdout.write(`  ✗ 未找到令牌: ${n.title.slice(0, 24)}\n`); }
    await sleep(4000);
  }
  if (touched) fs.writeFileSync(file, JSON.stringify(data, null, 1));
}

const meFile = path.join(root, 'me.json');
if (fs.existsSync(meFile)) {
  console.log('— 修复我的笔记链接 —');
  await fixFile(meFile, Infinity);   // all of mine — there are few
}

const cDir = path.join(root, 'creators');
if (fs.existsSync(cDir)) {
  for (const f of fs.readdirSync(cDir).filter(f => f.endsWith('.json'))) {
    const c = JSON.parse(fs.readFileSync(path.join(cDir, f), 'utf8'));
    console.log(`— ${c.name || f}（前 ${TOP_N} 篇）—`);
    await fixFile(path.join(cDir, f), TOP_N);
  }
}

console.log(`\n完成: ${fixed} 条链接已带令牌, ${missed} 条未匹配到, ${skipped} 条本来就有`);
