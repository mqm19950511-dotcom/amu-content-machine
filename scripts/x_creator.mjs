// Pull an X (Twitter) account's profile + recent tweets with engagement.
// Mirrors xhs_creator.mjs but for X, via TikHub's twitter/web endpoints.
// Writes creators_x/<handle>.json.
//
// Usage:
//   node scripts/x_creator.mjs levelsio karpathy swyx ...   # explicit handles
//   node scripts/x_creator.mjs --list                       # the built-in top-builder set

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const ENV = process.env.TIKHUB_ENV_PATH || path.resolve(root, '../wdyt/.env.local');
let KEY = process.env.TIKHUB_API_KEY;
if (!KEY && fs.existsSync(ENV)) KEY = fs.readFileSync(ENV, 'utf8').match(/^TIKHUB_API_KEY=(.*)$/m)?.[1];
if (!KEY) { console.error('No TIKHUB_API_KEY'); process.exit(1); }
KEY = KEY.trim().replace(/^["']|["']$/g, '');

const BASE = 'https://api.tikhub.io';
const H = { Authorization: `Bearer ${KEY}` };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const nInt = v => { const n = parseInt(String(v).replace(/,/g, ''), 10); return isNaN(n) ? 0 : n; };

// 张咋啦's builder list ∩ 叮叮's AI/builder niche
const TOP = ['karpathy','swyx','kevinweil','petergyang','_catwu','trq212','amasad','rauchg',
  'alexalbert__','garrytan','mattturck','zarazhangrui','danshipper','sama','levelsio','simonw',
  'AravSrinivas','emollick'];

async function get(url, tries = 3) {
  for (let i = 1; i <= tries; i++) {
    const r = await fetch(url, { headers: H });
    if (r.status === 429) { await sleep(5000 * i); continue; }
    if (!r.ok) return null;
    return r.json();
  }
  return null;
}

function deep(o, key, depth = 0) {
  if (depth > 6 || !o || typeof o !== 'object') return undefined;
  if (key in o && typeof o[key] !== 'object') return o[key];
  for (const v of Object.values(o)) { const r = deep(v, key, depth + 1); if (r !== undefined) return r; }
}

async function pull(handle) {
  const pj = await get(`${BASE}/api/v1/twitter/web/fetch_user_profile?screen_name=${encodeURIComponent(handle)}`);
  const prof = pj?.data || {};
  const name = prof.name || handle;
  const desc = prof.desc || deep(prof, 'description') || '';
  const followers = nInt(prof.sub_count ?? deep(prof, 'followers_count'));
  const avatar = (prof.avatar || '').replace('_normal', '');

  const tj = await get(`${BASE}/api/v1/twitter/web/fetch_user_post_tweet?screen_name=${encodeURIComponent(handle)}`);
  const tl = tj?.data?.timeline || [];
  const tweets = tl
    .filter(t => t.text && !t.text.startsWith('RT @'))
    .map(t => ({
      id: t.tweet_id,
      text: String(t.text).replace(/\s+/g, ' ').trim(),
      likes: nInt(t.favorites), bookmarks: nInt(t.bookmarks), retweets: nInt(t.retweets),
      replies: nInt(t.replies), quotes: nInt(t.quotes), views: nInt(t.views),
      created: t.created_at || '',
      url: `https://x.com/${handle}/status/${t.tweet_id}`,
    }))
    .sort((a, b) => (b.likes + b.retweets) - (a.likes + a.retweets));

  return { handle, name: String(name).replace(/^@/, ''), desc: desc.replace(/\s+/g, ' ').trim(),
           followers, avatar, tweets };
}

const args = process.argv.slice(2);
const handles = args[0] === '--list' ? TOP : args;
if (!handles.length) { console.error('Usage: node scripts/x_creator.mjs <handle...> | --list'); process.exit(1); }

const outDir = path.join(root, 'creators_x');
fs.mkdirSync(outDir, { recursive: true });
console.log(`Pulling ${handles.length} X account(s)…`);
let ok = 0;
for (const h of handles) {
  try {
    const c = await pull(h);
    if (c.tweets.length) {
      fs.writeFileSync(path.join(outDir, `${h}.json`), JSON.stringify(c, null, 1));
      ok++; console.log(`  ✓ @${h} — ${c.tweets.length} tweets, ${c.followers} followers`);
    } else console.log(`  ✗ @${h} — no tweets`);
  } catch (e) { console.log(`  ✗ @${h} — ${e.message}`); }
  await sleep(2500);
}
console.log(`Done: ${ok}/${handles.length} → creators_x/`);
