// Regenerate the analyst-facing digest files from the raw pulls.
// Pure transform, no API calls — run after any pull, before the analyze workflows.
//
//   creators/*.json     -> analysis/creators/<userId>-digest.md
//   creators_x/*.json   -> analysis/x/<handle>-digest.md
//   creators_sub/*.json -> analysis/sub/<slug>-digest.md
//   me.json             -> analysis/me-digest.md
//
// Usage: node scripts/make_digests.mjs

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const readDir = d => fs.existsSync(path.join(root, d))
  ? fs.readdirSync(path.join(root, d)).filter(f => f.endsWith('.json'))
      .map(f => JSON.parse(fs.readFileSync(path.join(root, d, f), 'utf8')))
  : [];
const out = (rel, s) => {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, s);
};
const clip = (s, n) => (s || '').replace(/\s+/g, ' ').slice(0, n);

// ── Xiaohongshu creators ────────────────────────────────────────────────
let n = 0;
for (const c of readDir('creators')) {
  const notes = (c.notes || []).slice()
    .sort((a, b) => (b.likes + b.saves) - (a.likes + a.saves));
  const rows = notes.map(x =>
    `| ${clip(x.title || x.desc, 60)} | ${x.likes} | ${x.saves} | ${x.comments} | ${x.shares} | ${x.type} |`);
  out(`analysis/creators/${c.userId}-digest.md`,
`# ${c.name} — 小红书 content digest

Bio: ${clip(c.desc, 200)}
Fans ${c.fans} · ${c.likesRecv} likes / ${c.savesRecv} saves received · ${notes.length} recent posts

| title | 赞 | 藏 | 评 | 转 | type |
|--|--|--|--|--|--|
${rows.join('\n')}
`);
  n++;
}
console.log(`creators digests: ${n}`);

// ── X ───────────────────────────────────────────────────────────────────
n = 0;
for (const c of readDir('creators_x')) {
  const tweets = (c.tweets || []).slice().sort((a, b) => b.likes - a.likes);
  const rows = tweets.map(t =>
    `| ${clip(t.text, 90)} | ${t.likes} | ${t.retweets} | ${t.bookmarks} | ${t.replies} | ${t.views} |`);
  out(`analysis/x/${c.handle}-digest.md`,
`# @${c.handle} (${c.name}) — X 内容摘要

简介: ${clip(c.desc, 300)}
粉丝 ${c.followers} · 近期推文 ${tweets.length}

| 推文 | 赞 | 转 | 收藏 | 回复 | 浏览 |
|--|--|--|--|--|--|
${rows.join('\n')}
`);
  n++;
}
console.log(`x digests: ${n}`);

// ── Substack ────────────────────────────────────────────────────────────
n = 0;
for (const c of readDir('creators_sub')) {
  if (!c.slug) continue;
  const rows = (c.posts || []).map((p, i) =>
    `${i + 1}. ${p.title} —— ${clip(p.snippet, 120)}`);
  out(`analysis/sub/${c.slug}-digest.md`,
`# ${c.name} — Substack 内容摘要

简介: ${clip(c.desc, 300)}
近期文章 ${(c.posts || []).length}

${rows.join('\n')}
`);
  n++;
}
console.log(`sub digests: ${n}`);

// ── me ──────────────────────────────────────────────────────────────────
if (fs.existsSync(path.join(root, 'me.json'))) {
  const { profile, notes } = JSON.parse(fs.readFileSync(path.join(root, 'me.json'), 'utf8'));
  const sorted = notes.slice().sort((a, b) =>
    (b.likes + b.saves + b.comments + b.shares) - (a.likes + a.saves + a.comments + a.shares));
  const rows = sorted.map(x =>
    `| ${clip(x.title || x.desc, 60)} | ${x.likes} | ${x.saves} | ${x.comments} | ${x.shares} | ${x.type} | ${String(x.created || '').slice(0, 10)} |`);
  out('analysis/me-digest.md',
`# ${profile.name} — 我的小红书全量 digest

Bio: ${clip(profile.desc, 200)}
Fans ${profile.fans} · ${profile.likesRecv} likes / ${profile.savesRecv} saves received · ${notes.length} posts

| title | 赞 | 藏 | 评 | 转 | type | date |
|--|--|--|--|--|--|--|
${rows.join('\n')}
`);
  console.log(`me digest: ${notes.length} notes`);
}
