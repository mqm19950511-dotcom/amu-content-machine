// Upsert a pulled creator (creators/<id>.json) into xhs_authors.json so the
// dashboard's creator table includes manually added accounts, not just
// keyword-discovered ones.
//
// Usage: node scripts/xhs_upsert_author.mjs <user_id> [keyword]

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const [id, kw] = [process.argv[2], process.argv[3]];
if (!id) { console.error('Usage: node scripts/xhs_upsert_author.mjs <user_id> [keyword]'); process.exit(1); }

const cFile = path.join(root, 'creators', `${id}.json`);
if (!fs.existsSync(cFile)) { console.error(`creators/${id}.json not found — pull the creator first.`); process.exit(1); }
const c = JSON.parse(fs.readFileSync(cFile, 'utf8'));

const listFile = path.join(root, 'xhs_authors.json');
let list = [];
if (fs.existsSync(listFile)) {
  try { list = JSON.parse(fs.readFileSync(listFile, 'utf8')); } catch { list = []; }
}

const notes = c.notes || [];
const entry = {
  name: c.name, id: c.userId || id, avatar: c.avatar || '',
  kws: [kw && kw.trim() ? kw.trim() : '手动添加'],
  eng: notes.reduce((s, n) => s + (n.likes || 0), 0),
  col: notes.reduce((s, n) => s + (n.saves || 0), 0),
  hits: notes.filter(n => (n.likes || 0) >= 100).length,
  titles: notes.slice(0, 5).map(n => n.title),
};

const i = list.findIndex(a => a.id === entry.id);
if (i >= 0) {
  const kws = [...new Set([...(list[i].kws || []), ...entry.kws])];
  list[i] = { ...list[i], ...entry, kws };
  console.log(`updated ${c.name} in xhs_authors.json (${list.length} total)`);
} else {
  list.push(entry);
  console.log(`added ${c.name} to xhs_authors.json (${list.length} total)`);
}
fs.writeFileSync(listFile, JSON.stringify(list, null, 1));
