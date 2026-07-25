// Pull a 小红书 creator's profile + recent posted notes, for per-creator analysis.
// Same endpoints as xhs_me.mjs, but for anyone. Writes creators/<id>.json.
//
// Usage:
//   node scripts/xhs_creator.mjs <user_id> [maxNotes]        # one creator
//   node scripts/xhs_creator.mjs --top <N>                   # top N from xhs_authors.json
//
// $0.001/request. Paced to dodge 429s.

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
const num = (o, ...ks) => { for (const k of ks) { const v = o?.[k]; if (typeof v === 'number') return v; if (typeof v === 'string' && /^[\d.]+$/.test(v)) return +v; } return 0; };
const clean = u => (u || '').split('?')[0];

async function get(url, tries = 4) {
  for (let i = 1; i <= tries; i++) {
    const r = await fetch(url, { headers: H });
    if (r.status === 429) { await sleep(6000 * i); continue; }
    if (!r.ok) return null;
    return r.json();
  }
  return null;
}

async function pullCreator(userId, maxNotes = 30) {
  const pj0 = await get(`${BASE}/api/v1/xiaohongshu/app_v2/get_user_info?user_id=${userId}`);
  const praw = pj0?.data || {};
  const pj = (typeof praw.liked === 'undefined' && praw.data) ? praw.data : praw;

  const notes = [];
  let cursor = '', page = 0;
  while (notes.length < maxNotes && page < 6) {
    const j = await get(`${BASE}/api/v1/xiaohongshu/app_v2/get_user_posted_notes?user_id=${userId}${cursor ? `&cursor=${cursor}` : ''}`);
    const inner = j?.data?.data || {};
    const batch = inner.notes || [];
    for (const n of batch) {
      notes.push({
        id: n.id, title: (n.display_title || n.title || '').trim() || '(untitled)',
        desc: (n.desc || '').replace(/\s+/g, ' ').trim().slice(0, 300),
        type: n.type || 'normal',
        likes: num(n, 'likes', 'liked_count', 'nice_count'),
        saves: num(n, 'collected_count', 'infavs'),
        comments: num(n, 'comments_count'), shares: num(n, 'share_count'),
        url: `https://www.xiaohongshu.com/explore/${n.id}`,
      });
    }
    page++;
    if (!inner.has_more || !batch.length) break;
    cursor = batch[batch.length - 1]?.cursor || '';
    if (!cursor) break;
    await sleep(1500);
  }

  return {
    userId,
    name: pj.share_info?.title || pj.nickname || '',
    desc: (pj.desc || '').trim(),
    avatar: clean(pj.imageb || pj.images),
    fans: num(pj, 'fans'), likesRecv: num(pj, 'liked'), savesRecv: num(pj, 'collected'),
    notes: notes.sort((a, b) => (b.likes + b.saves) - (a.likes + a.saves)),
  };
}

const outDir = path.join(root, 'creators');
fs.mkdirSync(outDir, { recursive: true });

let targets = [];
if (process.argv[2] === '--top') {
  const n = +(process.argv[3] || 20);
  const authors = JSON.parse(fs.readFileSync(path.join(root, 'xhs_authors.json'), 'utf8'));
  // prefer breadth then engagement — the creators worth a deep-dive
  targets = authors
    .map(a => ({ ...a, kwn: a.kws.length }))
    .sort((x, y) => (y.kwn - x.kwn) || ((y.eng + y.col) - (x.eng + x.col)))
    .slice(0, n).map(a => a.id);
} else if (process.argv[2]) {
  targets = [process.argv[2]];
} else {
  console.error('Usage: node scripts/xhs_creator.mjs <user_id> | --top <N>'); process.exit(1);
}

console.log(`Pulling ${targets.length} creator(s)…`);
let ok = 0;
for (const id of targets) {
  const c = await pullCreator(id, 30);
  if (c.name && c.notes.length) {
    fs.writeFileSync(path.join(outDir, `${id}.json`), JSON.stringify(c, null, 1));
    ok++;
    console.log(`  ✓ ${c.name} — ${c.notes.length} notes`);
  } else {
    console.log(`  ✗ ${id} — no data`);
  }
  await sleep(2500);
}
console.log(`Done: ${ok}/${targets.length} → creators/`);
