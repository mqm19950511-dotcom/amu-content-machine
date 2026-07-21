// Pull a Substack (or any RSS) publication's recent posts. Free, no API key.
// Writes creators_sub/<slug>.json.
//
// Substack exposes no per-post engagement in RSS, so downstream analysis is
// about THEMES and angle, not "why it performs" — different from X/小红书.
//
// Usage:
//   node scripts/substack_creator.mjs --list          # built-in feed set
//   node scripts/substack_creator.mjs <feedUrl> ...

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'creators_sub');

// name → feed. Curated from the user's follows where the slug is known-good.
const FEEDS = {
  'zara-zhang':        'https://zarazhang.substack.com/feed',
  'one-useful-thing':  'https://www.oneusefulthing.org/feed',
  'import-ai':         'https://importai.substack.com/feed',
  'interconnects':     'https://www.interconnects.ai/feed',
  'lennys-newsletter': 'https://www.lennysnewsletter.com/feed',
  'pragmatic-engineer':'https://newsletter.pragmaticengineer.com/feed',
  'big-technology':    'https://www.bigtechnology.com/feed',
  'every':             'https://every.to/feed',
  'semianalysis':      'https://www.semianalysis.com/feed',
  'chinatalk':         'https://www.chinatalk.media/feed',
  'the-generalist':    'https://www.generalist.com/feed',
  'dwarkesh':          'https://www.dwarkesh.com/feed',
};

const strip = s => String(s || '')
  .replace(/<!\[CDATA\[|\]\]>/g, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&[a-z]+;/gi, ' ')
  .replace(/\s+/g, ' ').trim();

function parseFeed(xml) {
  const title = strip((xml.match(/<title>([\s\S]*?)<\/title>/) || [])[1]);
  const desc = strip((xml.match(/<description>([\s\S]*?)<\/description>/) || [])[1]);
  // channel logo: <image><url>…</url></image>
  const image = strip((xml.match(/<image>[\s\S]*?<url>([\s\S]*?)<\/url>/) || [])[1]);
  const items = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(xml)) && items.length < 25) {
    const b = m[1];
    const t = strip((b.match(/<title>([\s\S]*?)<\/title>/) || [])[1]);
    const link = strip((b.match(/<link>([\s\S]*?)<\/link>/) || [])[1]);
    const date = strip((b.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1]);
    const body = strip((b.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/) ||
                        b.match(/<description>([\s\S]*?)<\/description>/) || [])[1]).slice(0, 400);
    if (t) items.push({ title: t, url: link, date, snippet: body });
  }
  return { title, desc, image, items };
}

async function pull(slug, feed) {
  const r = await fetch(feed, { headers: { 'User-Agent': 'Mozilla/5.0 ContentMachine' } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const xml = await r.text();
  const p = parseFeed(xml);
  return { slug, feed, name: p.title || slug, desc: p.desc, avatar: p.image || '', posts: p.items };
}

const args = process.argv.slice(2);
let targets;
if (args[0] === '--list') targets = Object.entries(FEEDS);
else targets = args.map((u, i) => [`feed${i + 1}`, u]);
if (!targets.length) { console.error('Usage: node scripts/substack_creator.mjs --list | <feedUrl...>'); process.exit(1); }

fs.mkdirSync(outDir, { recursive: true });
console.log(`Pulling ${targets.length} feed(s)…`);
let ok = 0;
for (const [slug, feed] of targets) {
  try {
    const c = await pull(slug, feed);
    if (c.posts.length) {
      fs.writeFileSync(path.join(outDir, `${slug}.json`), JSON.stringify(c, null, 1));
      ok++; console.log(`  ✓ ${c.name} — ${c.posts.length} posts`);
    } else console.log(`  ✗ ${slug} — no posts`);
  } catch (e) { console.log(`  ✗ ${slug} — ${e.message}`); }
}
console.log(`Done: ${ok}/${targets.length} → creators_sub/`);
