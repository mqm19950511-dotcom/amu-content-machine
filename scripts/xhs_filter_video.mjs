// Filter pulled creators to video-dominant accounts.
//
// The user's content direction is video; image-text (图文) creators are noise
// for benchmarking. A creator stays if >= 60% of their pulled notes are video.
// Prunes both creators/<id>.json and their entries in xhs_authors.json.
//
// Usage: node scripts/xhs_filter_video.mjs [minRatio=0.6]

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const RATIO = +(process.argv[2] || 0.6);
const cDir = path.join(root, 'creators');
const listFile = path.join(root, 'xhs_authors.json');

if (!fs.existsSync(cDir)) { console.log('no creators/'); process.exit(0); }

const kept = [], dropped = [];
for (const f of fs.readdirSync(cDir).filter(f => f.endsWith('.json'))) {
  const c = JSON.parse(fs.readFileSync(path.join(cDir, f), 'utf8'));
  const notes = c.notes || [];
  const vids = notes.filter(n => n.type === 'video' || n.type === 'video_note').length;
  const ratio = notes.length ? vids / notes.length : 0;
  if (ratio >= RATIO && notes.length >= 5) kept.push({ id: c.userId, name: c.name, ratio });
  else {
    dropped.push({ name: c.name || f, ratio: ratio.toFixed(2) });
    fs.unlinkSync(path.join(cDir, f));
  }
}

if (fs.existsSync(listFile)) {
  const list = JSON.parse(fs.readFileSync(listFile, 'utf8'));
  const keepIds = new Set(kept.map(k => k.id));
  // mark video-dominant creators in the table; drop nothing from the discovery
  // list (breadth there is still useful context), but flag pulled+filtered ones
  const out = list.map(a => keepIds.has(a.id) ? { ...a, video: true } : a)
    .filter(a => !dropped.some(d => d.id === a.id));
  fs.writeFileSync(listFile, JSON.stringify(out, null, 1));
}

console.log(`保留 ${kept.length} 位视频博主:`);
kept.forEach(k => console.log(`  ✓ ${k.name} (视频占比 ${(k.ratio * 100).toFixed(0)}%)`));
console.log(`剔除 ${dropped.length} 位图文为主:`);
dropped.forEach(d => console.log(`  ✗ ${d.name} (视频占比 ${(d.ratio * 100).toFixed(0)}%)`));
